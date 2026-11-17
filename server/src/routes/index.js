import { Router } from "express";
import { auth, requireRole } from "../middleware/auth.js";
import * as authCtrl from "../controllers/authController.js";
import * as onboard from "../controllers/onboardingController.js";
import * as conv from "../controllers/conversationController.js";
import * as clients from "../controllers/clientController.js";
import * as accounts from "../controllers/accountController.js";
import * as ai from "../controllers/aiController.js";

const r = Router();

r.post("/auth/register", authCtrl.register);
r.post("/auth/login", authCtrl.login);
r.get("/auth/me", auth, authCtrl.me);
r.patch("/auth/me", auth, authCtrl.updateMe);
r.post("/onboarding/complete", auth, onboard.completeOnboarding);

r.get("/metrics", auth, conv.metrics);
r.get("/conversations", auth, conv.listConversations);
r.post("/conversations/bulk", auth, requireRole("assistant"), conv.bulk);
r.get("/conversations/:id", auth, conv.getConversation);
r.patch("/conversations/:id", auth, conv.patchConversation);
r.post("/conversations/:id/classify", auth, requireRole("assistant"), conv.classifyOne);
r.post("/conversations/:id/archive", auth, requireRole("assistant"), conv.archive);
r.post("/conversations/:id/complete", auth, conv.complete);
r.post("/conversations/:id/summarize", auth, conv.summarize);

r.get("/clients", auth, requireRole("assistant"), clients.listClients);
r.post("/clients", auth, requireRole("assistant"), clients.createClient);
r.get("/clients/:id", auth, requireRole("assistant"), clients.getClient);
r.put("/clients/:id", auth, requireRole("assistant"), clients.updateClient);

r.get("/accounts", auth, requireRole("assistant"), accounts.listAccounts);
r.post("/accounts/connect", auth, requireRole("assistant"), accounts.connectAccount);
r.delete("/accounts/:id", auth, requireRole("assistant"), accounts.disconnectAccount);
r.post("/accounts/:id/sync", auth, requireRole("assistant"), accounts.syncAccount);

r.post("/ai/classify", auth, ai.classify);
r.post("/ai/summarize", auth, ai.summarize);
r.post("/ai/ask", auth, ai.ask);
r.post("/ai/draft-reply", auth, requireRole("assistant"), ai.draft);

r.get("/drafts", auth, ai.listDrafts);
r.put("/drafts/:id", auth, ai.updateDraft);
r.post("/drafts/:id/send", auth, requireRole("assistant"), ai.sendDraft);

r.get("/client/attention", auth, requireRole("client"), clients.attention);
r.post("/client/attention/:id/handled", auth, requireRole("client"), clients.handled);
r.post("/client/attention/:id/assign-assistant", auth, requireRole("client"), clients.assignAssistant);

r.get("/activity", auth, ai.overviewContext);
r.post("/notifications/read", auth, ai.markNotifications);
r.get("/workspace", auth, ai.workspace);
r.patch("/workspace", auth, requireRole("assistant"), ai.updateWorkspace);
r.get("/settings/ai", auth, ai.settings);

export default r;
