import { store } from "../store/fileStore.js";
import { id, now } from "../utils/ids.js";

export async function listAccounts(req, res) {
  const accounts = store.accounts().find({ workspaceId: req.user.workspaceId });
  res.json({ accounts: accounts.map((a) => ({ ...a, client: store.clients().findById(a.clientId) })) });
}

export async function connectAccount(req, res) {
  const { provider, email, clientId } = req.body;
  if (!["gmail", "outlook"].includes(provider) || !email) {
    return res.status(400).json({ message: "Provider and email are required." });
  }
  const account = store.accounts().insert({
    _id: id("acc"),
    provider,
    email,
    displayName: email,
    status: "connecting",
    lastSyncAt: null,
    syncFrequency: "15m",
    workspaceId: req.user.workspaceId,
    clientId: clientId || null,
    demo: true,
    progress: 15,
    createdAt: now(),
  });
  setTimeout(() => {
    store.accounts().updateById(account._id, { status: "connected", progress: 100, lastSyncAt: now() });
  }, 1200);
  res.status(201).json({ account, demo: true, message: "Demo connection started. This is not a live OAuth grant." });
}

export async function disconnectAccount(req, res) {
  const ok = store.accounts().removeById(req.params.id);
  if (!ok) return res.status(404).json({ message: "Account not found" });
  res.json({ ok: true });
}

export async function syncAccount(req, res) {
  const account = store.accounts().findById(req.params.id);
  if (!account) return res.status(404).json({ message: "Account not found" });
  store.accounts().updateById(account._id, { status: "syncing", progress: 40 });
  const updated = store.accounts().updateById(account._id, {
    status: "connected",
    progress: 100,
    lastSyncAt: now(),
  });
  res.json({ account: updated, demo: true, message: "Demo sync complete. No live mailbox was contacted." });
}
