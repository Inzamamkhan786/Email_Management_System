import { store } from "../store/fileStore.js";
import { classifyConversation, summarizeConversation } from "../services/ai/llm.js";
import { logActivity, notify } from "../utils/activity.js";
import { now } from "../utils/ids.js";

function scoped(user) {
  const all = store.conversations().find();
  if (user.role === "client") {
    return all.filter((c) => c.clientId === user.clientId);
  }
  return all.filter((c) => c.workspaceId === user.workspaceId);
}

function withClient(c) {
  const client = store.clients().findById(c.clientId);
  const account = store.accounts().findById(c.accountId);
  return { ...c, client, account };
}

export async function listConversations(req, res) {
  const {
    segment,
    q,
    classification,
    priority,
    unread,
    clientId,
    attachment,
    status,
    sort = "recent",
  } = req.query;

  let items = scoped(req.user);

  const segmentMap = {
    all: () => true,
    assistant: (c) => c.classification === "ASSISTANT_TO_REPLY" && !c.archived,
    client: (c) => c.classification === "CLIENT_TO_REPLY" && !c.archived,
    none: (c) => c.classification === "NO_REPLY_NEEDED" && !c.archived,
    review: (c) => c.classification === "NEEDS_REVIEW" && !c.archived,
    important: (c) => c.important && !c.archived,
    action: (c) => c.analysis?.requiresResponse && !c.archived && c.status !== "completed",
    waiting: (c) => c.status === "waiting" && !c.archived,
    meetings: (c) => Boolean(c.analysis?.meeting) && !c.archived,
    archived: (c) => c.archived,
  };
  if (segment && segmentMap[segment]) items = items.filter(segmentMap[segment]);
  if (classification) items = items.filter((c) => c.classification === classification);
  if (priority) items = items.filter((c) => c.priority === priority);
  if (unread === "true") items = items.filter((c) => c.unread);
  if (unread === "false") items = items.filter((c) => !c.unread);
  if (clientId) items = items.filter((c) => c.clientId === clientId);
  if (attachment === "true") items = items.filter((c) => c.hasAttachments);
  if (status) items = items.filter((c) => c.status === status);
  if (q) {
    const s = q.toLowerCase();
    items = items.filter((c) => {
      const client = store.clients().findById(c.clientId);
      const blob = [
        c.subject,
        c.snippet,
        client?.name,
        client?.company,
        ...(c.participants || []).map((p) => `${p.name} ${p.email}`),
        ...(c.messages || []).map((m) => m.body),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(s);
    });
  }

  items.sort((a, b) => {
    if (sort === "oldest") return new Date(a.lastMessageAt) - new Date(b.lastMessageAt);
    if (sort === "priority") {
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3);
    }
    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
  });

  res.json({ conversations: items.map(withClient) });
}

export async function getConversation(req, res) {
  const c = store.conversations().findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Conversation not found" });
  if (req.user.role === "client" && c.clientId !== req.user.clientId) {
    return res.status(403).json({ message: "Not allowed" });
  }
  res.json({ conversation: withClient(c) });
}

export async function patchConversation(req, res) {
  const c = store.conversations().findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Conversation not found" });
  if (req.user.role === "client") return res.status(403).json({ message: "Not allowed" });

  const patch = {};
  const fields = ["unread", "important", "archived", "status"];
  for (const f of fields) if (req.body[f] !== undefined) patch[f] = req.body[f];

  if (req.body.classification && req.body.classification !== c.classification) {
    patch.classification = req.body.classification;
    patch.analysis = {
      ...c.analysis,
      classification: req.body.classification,
      overridden: true,
      overriddenBy: req.user.name,
      overriddenAt: now(),
    };
    logActivity({
      type: "override",
      text: `${req.user.name} changed classification to ${label(req.body.classification)} on “${c.subject}”.`,
      actor: req.user.name,
      conversationId: c._id,
      clientId: c.clientId,
      workspaceId: c.workspaceId,
    });
  }

  if (req.body.resetClassification) {
    patch.analysis = { ...c.analysis, overridden: false, overriddenBy: null, overriddenAt: null };
  }

  const updated = store.conversations().updateById(c._id, patch);
  res.json({ conversation: withClient(updated) });
}

export async function classifyOne(req, res) {
  const c = store.conversations().findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Conversation not found" });
  if (c.analysis?.overridden && !req.body.force) {
    return res.json({ conversation: withClient(c), skipped: true, message: "Manual override preserved." });
  }
  const analysis = await classifyConversation(c);
  const updated = store.conversations().updateById(c._id, {
    analysis,
    classification: analysis.classification,
    priority: analysis.priority,
  });
  logActivity({
    type: "classified",
    text: `AI classified “${c.subject}” as ${label(analysis.classification)}.`,
    actor: "MailPilot",
    conversationId: c._id,
    clientId: c.clientId,
    workspaceId: c.workspaceId,
  });
  res.json({ conversation: withClient(updated) });
}

export async function archive(req, res) {
  const updated = store.conversations().updateById(req.params.id, { archived: true, unread: false });
  res.json({ conversation: withClient(updated) });
}

export async function complete(req, res) {
  const updated = store.conversations().updateById(req.params.id, {
    status: "completed",
    unread: false,
    handledAt: now(),
    handledBy: req.user.name,
  });
  logActivity({
    type: "completed",
    text: `${req.user.name} marked “${updated.subject}” complete.`,
    actor: req.user.name,
    conversationId: updated._id,
    clientId: updated.clientId,
    workspaceId: updated.workspaceId,
  });
  res.json({ conversation: withClient(updated) });
}

export async function summarize(req, res) {
  const c = store.conversations().findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Conversation not found" });
  const summary = await summarizeConversation(c);
  res.json({ summary });
}

export async function bulk(req, res) {
  const { ids = [], action, classification } = req.body;
  const results = [];
  for (const cid of ids) {
    let patch = {};
    if (action === "read") patch = { unread: false };
    if (action === "unread") patch = { unread: true };
    if (action === "archive") patch = { archived: true, unread: false };
    if (action === "important") patch = { important: true };
    if (action === "classify" && classification) {
      const c = store.conversations().findById(cid);
      patch = {
        classification,
        analysis: {
          ...c.analysis,
          classification,
          overridden: true,
          overriddenBy: req.user.name,
          overriddenAt: now(),
        },
      };
    }
    results.push(store.conversations().updateById(cid, patch));
  }
  res.json({ conversations: results.filter(Boolean).map(withClient) });
}

export async function metrics(req, res) {
  const items = scoped(req.user).filter((c) => !c.archived);
  res.json({
    total: items.length,
    unread: items.filter((c) => c.unread).length,
    assistant: items.filter((c) => c.classification === "ASSISTANT_TO_REPLY").length,
    client: items.filter((c) => c.classification === "CLIENT_TO_REPLY").length,
    waiting: items.filter((c) => c.status === "waiting").length,
    review: items.filter((c) => c.classification === "NEEDS_REVIEW").length,
  });
}

function label(c) {
  return (
    {
      ASSISTANT_TO_REPLY: "Assistant to Reply",
      CLIENT_TO_REPLY: "Client to Reply",
      NO_REPLY_NEEDED: "No Reply Needed",
      NEEDS_REVIEW: "Needs Review",
    }[c] || c
  );
}

export { scoped, withClient, notify };
