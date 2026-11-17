const AUTO = Number(process.env.CLASSIFY_AUTO_THRESHOLD || 0.9);
const REVIEW = Number(process.env.CLASSIFY_REVIEW_THRESHOLD || 0.7);

const CLIENT_SIGNALS = [
  /approv/i,
  /contract/i,
  /budget/i,
  /invest/i,
  /sign off|sign-off|signature/i,
  /your decision|your call|need you to/i,
  /partnership/i,
  /equity/i,
  /board/i,
  /offer letter/i,
  /personal/i,
  /confidential/i,
  /legal/i,
  /term sheet/i,
];

const ASSISTANT_SIGNALS = [
  /schedul/i,
  /calendar/i,
  /reschedul/i,
  /availability/i,
  /confirm the meeting/i,
  /book/i,
  /travel itinerary/i,
  /logistics/i,
  /follow up|follow-up/i,
  /invoice/i,
  /receipt/i,
  /introduc/i,
  /can you send/i,
  /please share/i,
];

const NO_REPLY_SIGNALS = [
  /newsletter/i,
  /unsubscribe/i,
  /no-reply|noreply/i,
  /receipt/i,
  /your order/i,
  /shipped/i,
  /weekly digest/i,
  /notification/i,
  /fyi\b/i,
  /status update/i,
  /automatically generated/i,
];

export function heuristicClassify({ subject = "", body = "", sender = "", history = [] }) {
  const text = `${subject}\n${body}\n${sender}\n${history.map((m) => m.body).join("\n")}`;
  const clientHits = CLIENT_SIGNALS.filter((r) => r.test(text)).length;
  const assistantHits = ASSISTANT_SIGNALS.filter((r) => r.test(text)).length;
  const noreplyHits = NO_REPLY_SIGNALS.filter((r) => r.test(text)).length;
  const asksReply = /please (reply|confirm|advise|approve|let me know)|waiting (on|for) your/i.test(text);

  let classification = "NEEDS_REVIEW";
  let confidence = 0.62;
  let reason = "The request is ambiguous and should be reviewed before assigning responsibility.";
  let category = "AMBIGUOUS";
  let suggestedAction = "Read the latest message and decide who should respond.";
  let priority = "MEDIUM";
  let requiresResponse = true;

  if (noreplyHits >= 2 && clientHits === 0) {
    classification = "NO_REPLY_NEEDED";
    confidence = 0.93;
    reason = "This looks like an automated or informational update that does not ask for a reply.";
    category = "INFORMATIONAL";
    suggestedAction = "Archive or file. No response required.";
    priority = "LOW";
    requiresResponse = false;
  } else if (clientHits >= 2 || (clientHits >= 1 && /approv|contract|budget|partnership/i.test(text))) {
    classification = "CLIENT_TO_REPLY";
    confidence = Math.min(0.96, 0.78 + clientHits * 0.06);
    reason = "The sender is asking for a personal, financial, or executive decision that only the client should make.";
    category = "BUSINESS_DECISION";
    suggestedAction = "Brief the client and request a decision. Do not send a commitment on their behalf.";
    priority = /urgent|asap|today|eod/i.test(text) ? "HIGH" : "HIGH";
  } else if (assistantHits >= 1 && clientHits === 0) {
    classification = "ASSISTANT_TO_REPLY";
    confidence = Math.min(0.95, 0.8 + assistantHits * 0.04);
    reason = "This is an operational request (scheduling, logistics, or routine follow-up) that an assistant can handle.";
    category = "ADMINISTRATIVE";
    suggestedAction = "Draft a concise reply and confirm details without escalating.";
    priority = asksReply ? "MEDIUM" : "MEDIUM";
  } else if (noreplyHits >= 1 && !asksReply && clientHits === 0) {
    classification = "NO_REPLY_NEEDED";
    confidence = 0.88;
    reason = "Informational message with no explicit request for a response.";
    category = "INFORMATIONAL";
    suggestedAction = "Mark as read. No reply needed.";
    priority = "LOW";
    requiresResponse = false;
  } else if (asksReply && clientHits === 0) {
    classification = "ASSISTANT_TO_REPLY";
    confidence = 0.81;
    reason = "The sender is waiting on a reply, and nothing in the thread requires an executive decision.";
    category = "FOLLOW_UP";
    suggestedAction = "Reply with the missing information or propose next steps.";
  }

  if (confidence < REVIEW) {
    classification = "NEEDS_REVIEW";
    reason = "Confidence is below the review threshold. Assign responsibility after reading the thread.";
  }

  const deadlineMatch = text.match(
    /\b(?:by|before|due)\s+((?:monday|tuesday|wednesday|thursday|friday|today|tomorrow|eod|end of day)|\w+\s+\d{1,2})\b/i
  );
  const meeting = /meeting|call|zoom|calendar invite/i.test(text)
    ? {
        title: subject.replace(/^(re:|fwd:)\s*/i, ""),
        mentioned: true,
      }
    : null;

  const summary = buildSummary(subject, body, classification);

  return validateAnalysis({
    classification,
    confidence: Number(confidence.toFixed(2)),
    priority,
    requiresResponse,
    summary,
    reason,
    suggestedAction,
    category,
    deadline: deadlineMatch ? deadlineMatch[1] : null,
    meeting,
    evidence: pickEvidence(text, classification),
    mock: true,
    overridden: false,
  });
}

function buildSummary(subject, body, classification) {
  const first = (body || "").replace(/\s+/g, " ").trim().slice(0, 180);
  if (classification === "CLIENT_TO_REPLY") {
    return `Decision needed on “${subject}”. ${first}`;
  }
  if (classification === "ASSISTANT_TO_REPLY") {
    return `Operational follow-up on “${subject}”. ${first}`;
  }
  if (classification === "NO_REPLY_NEEDED") {
    return `Informational: ${subject}. No response required.`;
  }
  return `Review required: ${subject}. ${first}`;
}

function pickEvidence(text, classification) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return lines.slice(0, 3);
}

export function validateAnalysis(raw) {
  const allowed = ["ASSISTANT_TO_REPLY", "CLIENT_TO_REPLY", "NO_REPLY_NEEDED", "NEEDS_REVIEW"];
  const priorities = ["LOW", "MEDIUM", "HIGH"];
  const classification = allowed.includes(raw.classification) ? raw.classification : "NEEDS_REVIEW";
  let confidence = Number(raw.confidence);
  if (Number.isNaN(confidence) || confidence < 0 || confidence > 1) confidence = 0.5;
  if (confidence < REVIEW && classification !== "NEEDS_REVIEW" && !raw.overridden) {
    return {
      ...raw,
      classification: "NEEDS_REVIEW",
      confidence,
      reason: raw.reason || "Low confidence — flagged for human review.",
    };
  }
  return {
    ...raw,
    classification,
    confidence,
    priority: priorities.includes(raw.priority) ? raw.priority : "MEDIUM",
    requiresResponse: Boolean(raw.requiresResponse),
    summary: String(raw.summary || "").slice(0, 600),
    reason: String(raw.reason || "").slice(0, 400),
    suggestedAction: String(raw.suggestedAction || "").slice(0, 400),
    category: String(raw.category || "GENERAL"),
  };
}

export function applyConfidencePolicy(analysis) {
  if (analysis.overridden) return analysis;
  if (analysis.confidence < REVIEW) {
    return { ...analysis, classification: "NEEDS_REVIEW" };
  }
  return analysis;
}

export { AUTO, REVIEW };
