import { store } from "../store/fileStore.js";
import { id, now } from "../utils/ids.js";

export async function completeOnboarding(req, res) {
  const { workspaceName, clientName, assistantName, provider, accountEmail } = req.body || {};
  const user = store.users().findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (workspaceName) {
    store.workspaces().updateById(user.workspaceId, {
      name: workspaceName,
      clientName: clientName || undefined,
      assistantName: assistantName || undefined,
    });
  }

  let account = null;
  if (provider && accountEmail) {
    account = store.accounts().insert({
      _id: id("acc"),
      provider,
      email: accountEmail,
      displayName: clientName || user.name,
      status: "connected",
      lastSyncAt: now(),
      syncFrequency: "15m",
      workspaceId: user.workspaceId,
      clientId: user.clientId || null,
      demo: true,
      progress: 100,
      createdAt: now(),
    });
  }

  const updated = store.users().updateById(user._id, { onboardingComplete: true });
  res.json({ user: { ...updated, passwordHash: undefined }, account, demo: true });
}
