import { store } from "../store/fileStore.js";
import { id, now } from "../utils/ids.js";
import { logActivity, notify } from "../utils/activity.js";
import { withClient } from "./conversationController.js";

export async function listClients(req, res) {
  const clients = store.clients().find({ workspaceId: req.user.workspaceId });
  const conversations = store.conversations().find({ workspaceId: req.user.workspaceId });
  res.json({
    clients: clients.map((c) => ({
      ...c,
      stats: {
        total: conversations.filter((x) => x.clientId === c._id && !x.archived).length,
        attention: conversations.filter((x) => x.clientId === c._id && x.classification === "CLIENT_TO_REPLY" && !x.archived).length,
        unread: conversations.filter((x) => x.clientId === c._id && x.unread).length,
      },
    })),
  });
}

export async function createClient(req, res) {
  const { name, email, company, title, notes } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Name and email are required." });
  const client = store.clients().insert({
    _id: id("cli"),
    name,
    email,
    company: company || "",
    title: title || "",
    notes: notes || "",
    assistantId: req.user._id,
    workspaceId: req.user.workspaceId,
    userId: null,
    accountIds: [],
    createdAt: now(),
  });
  res.status(201).json({ client });
}

export async function getClient(req, res) {
  const client = store.clients().findById(req.params.id);
  if (!client) return res.status(404).json({ message: "Client not found" });
  const conversations = store.conversations().find({ clientId: client._id }).map(withClient);
  const accounts = store.accounts().find({ clientId: client._id });
  res.json({ client, conversations, accounts });
}

export async function updateClient(req, res) {
  const updated = store.clients().updateById(req.params.id, req.body);
  res.json({ client: updated });
}

export async function attention(req, res) {
  const items = store
    .conversations()
    .find({ clientId: req.user.clientId, classification: "CLIENT_TO_REPLY" })
    .filter((c) => !c.archived && c.status !== "completed")
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    .map(withClient);
  res.json({ conversations: items });
}

export async function handled(req, res) {
  const c = store.conversations().findById(req.params.id);
  if (!c || c.clientId !== req.user.clientId) return res.status(404).json({ message: "Not found" });
  const updated = store.conversations().updateById(c._id, {
    status: "completed",
    unread: false,
    handledAt: now(),
    handledBy: req.user.name,
  });
  logActivity({
    type: "handled",
    text: `${req.user.name} marked “${c.subject}” as handled.`,
    actor: req.user.name,
    conversationId: c._id,
    clientId: c.clientId,
    workspaceId: c.workspaceId,
  });
  const assistants = store.users().find({ workspaceId: c.workspaceId, role: "assistant" });
  assistants.forEach((a) =>
    notify({
      userId: a._id,
      title: "Client handled a conversation",
      body: `${req.user.name} marked “${c.subject}” as handled.`,
      conversationId: c._id,
    })
  );
  res.json({ conversation: withClient(updated) });
}

export async function assignAssistant(req, res) {
  const c = store.conversations().findById(req.params.id);
  if (!c || c.clientId !== req.user.clientId) return res.status(404).json({ message: "Not found" });
  const updated = store.conversations().updateById(c._id, {
    classification: "ASSISTANT_TO_REPLY",
    analysis: {
      ...c.analysis,
      classification: "ASSISTANT_TO_REPLY",
      overridden: true,
      overriddenBy: req.user.name,
      overriddenAt: now(),
      suggestedAction: "The client asked the assistant to take this over.",
    },
    unread: true,
  });
  logActivity({
    type: "reassign",
    text: `${req.user.name} asked the assistant to handle “${c.subject}”.`,
    actor: req.user.name,
    conversationId: c._id,
    clientId: c.clientId,
    workspaceId: c.workspaceId,
  });
  const assistants = store.users().find({ workspaceId: c.workspaceId, role: "assistant" });
  assistants.forEach((a) =>
    notify({
      userId: a._id,
      title: "Please take this over",
      body: `${req.user.name} asked you to handle “${c.subject}”.`,
      conversationId: c._id,
    })
  );
  res.json({ conversation: withClient(updated) });
}
