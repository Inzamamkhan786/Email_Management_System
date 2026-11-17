import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, enum: ["assistant", "client"] },
    avatar: String,
    theme: { type: String, default: "system" },
    onboardingComplete: { type: Boolean, default: false },
    workspaceId: String,
    clientId: String,
    title: String,
  },
  { timestamps: true }
);

const WorkspaceSchema = new Schema(
  {
    name: String,
    type: { type: String, enum: ["assistant", "client"] },
    ownerId: String,
    assistantName: String,
    clientName: String,
  },
  { timestamps: true }
);

const ClientSchema = new Schema(
  {
    name: String,
    email: String,
    company: String,
    title: String,
    assistantId: String,
    workspaceId: String,
    userId: String,
    accountIds: [String],
    notes: String,
  },
  { timestamps: true }
);

const EmailAccountSchema = new Schema(
  {
    provider: { type: String, enum: ["gmail", "outlook"] },
    email: String,
    displayName: String,
    status: { type: String, enum: ["connecting", "connected", "syncing", "failed", "disconnected"] },
    lastSyncAt: String,
    syncFrequency: { type: String, default: "15m" },
    workspaceId: String,
    clientId: String,
    demo: { type: Boolean, default: true },
    progress: { type: Number, default: 100 },
  },
  { timestamps: true }
);

const MessageSchema = new Schema(
  {
    from: { name: String, email: String },
    to: [{ name: String, email: String }],
    cc: [{ name: String, email: String }],
    body: String,
    sentAt: String,
    attachments: [{ name: String, size: String, type: String }],
  },
  { _id: false }
);

const AnalysisSchema = new Schema(
  {
    classification: String,
    confidence: Number,
    priority: String,
    requiresResponse: Boolean,
    summary: String,
    reason: String,
    suggestedAction: String,
    category: String,
    deadline: String,
    meeting: Schema.Types.Mixed,
    evidence: [String],
    mock: Boolean,
    overridden: Boolean,
    overriddenBy: String,
    overriddenAt: String,
  },
  { _id: false }
);

const ConversationSchema = new Schema(
  {
    subject: String,
    accountId: String,
    clientId: String,
    workspaceId: String,
    classification: String,
    priority: String,
    unread: Boolean,
    important: Boolean,
    archived: Boolean,
    status: { type: String, default: "open" },
    waitingSince: String,
    lastMessageAt: String,
    snippet: String,
    participants: [{ name: String, email: String }],
    hasAttachments: Boolean,
    analysis: AnalysisSchema,
    messages: [MessageSchema],
    tags: [String],
    handledAt: String,
    handledBy: String,
  },
  { timestamps: true }
);

const DraftSchema = new Schema(
  {
    conversationId: String,
    to: String,
    cc: String,
    subject: String,
    body: String,
    status: { type: String, default: "draft" },
    createdBy: String,
    demoSend: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ActivitySchema = new Schema(
  {
    type: String,
    text: String,
    actor: String,
    conversationId: String,
    clientId: String,
    workspaceId: String,
    at: String,
  },
  { timestamps: true }
);

const NotificationSchema = new Schema(
  {
    userId: String,
    title: String,
    body: String,
    read: { type: Boolean, default: false },
    conversationId: String,
    at: String,
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);
export const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);
export const EmailAccount = mongoose.models.EmailAccount || mongoose.model("EmailAccount", EmailAccountSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
export const EmailDraft = mongoose.models.EmailDraft || mongoose.model("EmailDraft", DraftSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivitySchema);
export const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
