import { store } from "../store/fileStore.js";
import { answerQuestion, classifyConversation, draftReply, summarizeConversation, aiMode } from "../services/ai/llm.js";
import { id, now } from "../utils/ids.js";
import { logActivity } from "../utils/activity.js";

export async function classify(req, res) {
  const conversation = store.conversations().findById(req.body.conversationId);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });
  const analysis = await classifyConversation(conversation);
  res.json({ analysis, mode: aiMode() });
}

export async function summarize(req, res) {
  const conversation = store.conversations().findById(req.body.conversationId);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });
  const summary = await summarizeConversation(conversation);
  res.json({ summary, mode: aiMode() });
}

export async function ask(req, res) {
  const { question, conversationId } = req.body;
  if (!question) return res.status(400).json({ message: "Question is required." });
  const conversations = store.conversations().find({ workspaceId: req.user.workspaceId });
  const conversation = conversationId ? store.conversations().findById(conversationId) : null;
  const result = await answerQuestion(question, { conversations, conversation, user: req.user });
  res.json({ ...result, mode: aiMode() });
}

export async function draft(req, res) {
  const { conversationId, tone = "professional" } = req.body;
  const conversation = store.conversations().findById(conversationId);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });
  const body = await draftReply(conversation, tone);
  const latest = conversation.messages?.[conversation.messages.length - 1];
  const draftDoc = store.drafts().insert({
    _id: id("dft"),
    conversationId,
    to: latest?.from?.email || "",
    cc: "",
    subject: conversation.subject.startsWith("Re:") ? conversation.subject : `Re: ${conversation.subject}`,
    body,
    status: "draft",
    createdBy: req.user._id,
    demoSend: true,
    createdAt: now(),
  });
  logActivity({
    type: "drafted",
    text: `${req.user.name} drafted a response to “${conversation.subject}”.`,
    actor: req.user.name,
    conversationId,
    clientId: conversation.clientId,
    workspaceId: conversation.workspaceId,
  });
  res.json({ draft: draftDoc, mode: aiMode() });
}

export async function listDrafts(req, res) {
  res.json({ drafts: store.drafts().find() });
}

export async function updateDraft(req, res) {
  const updated = store.drafts().updateById(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Draft not found" });
  res.json({ draft: updated });
}

export async function sendDraft(req, res) {
  const draft = store.drafts().findById(req.params.id);
  if (!draft) return res.status(404).json({ message: "Draft not found" });
  const updated = store.drafts().updateById(draft._id, { status: "sent_demo", sentAt: now() });
  const conversation = store.conversations().findById(draft.conversationId);
  if (conversation) {
    store.conversations().updateById(conversation._id, {
      status: "waiting",
      waitingSince: now(),
      unread: false,
    });
  }
  res.json({
    draft: updated,
    demo: true,
    message: "Demo Mode: the reply was not sent to a real mailbox.",
  });
}

export async function overviewContext(req, res) {
  res.json({
    mode: aiMode(),
    activities: store
      .activities()
      .find({ workspaceId: req.user.workspaceId })
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 12),
    notifications: store
      .notifications()
      .find({ userId: req.user._id })
      .sort((a, b) => new Date(b.at) - new Date(a.at)),
  });
}

export async function markNotifications(req, res) {
  const notes = store.notifications().find({ userId: req.user._id });
  notes.forEach((n) => store.notifications().updateById(n._id, { read: true }));
  res.json({ ok: true });
}

export async function workspace(req, res) {
  const ws = store.workspaces().findById(req.user.workspaceId);
  res.json({ workspace: ws, mode: aiMode() });
}

export async function updateWorkspace(req, res) {
  const ws = store.workspaces().updateById(req.user.workspaceId, req.body);
  res.json({ workspace: ws });
}

export async function settings(req, res) {
  res.json({
    thresholds: {
      auto: Number(process.env.CLASSIFY_AUTO_THRESHOLD || 0.9),
      review: Number(process.env.CLASSIFY_REVIEW_THRESHOLD || 0.7),
    },
    mode: aiMode(),
  });
}
