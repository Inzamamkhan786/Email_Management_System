import { heuristicClassify, validateAnalysis } from "./classifier.js";

function provider() {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GROQ_API_KEY) return "groq";
  return process.env.AI_PROVIDER || "mock";
}

export function aiMode() {
  const p = provider();
  return p === "mock" ? { mock: true, provider: "mock" } : { mock: false, provider: p };
}

async function complete(prompt, json = false) {
  const p = provider();
  if (p === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: json ? { type: "json_object" } : undefined,
        messages: [
          { role: "system", content: "You are MailPilot, a precise executive-assistant email copilot. Be concise. Never invent facts that are not in the emails." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }
  if (p === "groq") {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are MailPilot, a precise executive-assistant email copilot. Be concise." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }
  return null;
}

export async function classifyConversation(conversation) {
  const latest = conversation.messages?.[conversation.messages.length - 1] || {};
  const payload = {
    subject: conversation.subject,
    body: latest.body,
    sender: latest.from?.email,
    history: conversation.messages || [],
  };

  const mock = heuristicClassify(payload);
  const llm = await complete(
    `Classify this email conversation. Return JSON with keys: classification (ASSISTANT_TO_REPLY|CLIENT_TO_REPLY|NO_REPLY_NEEDED|NEEDS_REVIEW), confidence (0-1), priority (LOW|MEDIUM|HIGH), requiresResponse, summary, reason, suggestedAction, category, deadline, meeting.\nSubject: ${conversation.subject}\nThread:\n${(conversation.messages || []).map((m) => `${m.from?.name}: ${m.body}`).join("\n---\n")}`,
    true
  );
  if (!llm) return mock;
  try {
    const parsed = JSON.parse(llm);
    return validateAnalysis({ ...mock, ...parsed, mock: false });
  } catch {
    return mock;
  }
}

export async function summarizeConversation(conversation) {
  const llm = await complete(
    `Summarize this thread in 2-3 sentences for a busy assistant.\nSubject: ${conversation.subject}\n${(conversation.messages || []).map((m) => `${m.from?.name}: ${m.body}`).join("\n")}`
  );
  if (llm) return llm;
  return conversation.analysis?.summary || `Thread on “${conversation.subject}” with ${conversation.messages?.length || 0} messages.`;
}

export async function draftReply(conversation, tone = "professional") {
  const latest = conversation.messages?.[conversation.messages.length - 1];
  const llm = await complete(
    `Draft a ${tone} email reply. Do not include a subject line. Keep it under 160 words.\nSubject: ${conversation.subject}\nLast message from ${latest?.from?.name}: ${latest?.body}`
  );
  if (llm) return llm.trim();
  return mockDraft(conversation, tone);
}

function mockDraft(conversation, tone) {
  const latest = conversation.messages?.[conversation.messages.length - 1];
  const name = latest?.from?.name?.split(" ")[0] || "there";
  const professional = `Hi ${name},\n\nThank you for the note regarding “${conversation.subject}”. I have reviewed the details and will follow up with a confirmed next step shortly.\n\nIf anything is time-sensitive on your side, please let me know and I will prioritize it.\n\nBest regards,\nSarah Chen`;
  if (tone === "short") {
    return `Hi ${name},\n\nThanks — noted on “${conversation.subject}”. I will confirm shortly.\n\nBest,\nSarah`;
  }
  if (tone === "warm") {
    return `Hi ${name},\n\nAppreciate you sending this over. I will take care of “${conversation.subject}” and loop back as soon as I have a clear answer.\n\nWarmly,\nSarah`;
  }
  return professional;
}

export async function answerQuestion(question, context) {
  const { conversations = [], user } = context;
  const q = question.toLowerCase();

  const llm = await complete(
    `Answer based only on this inbox snapshot. If listing emails, use their subjects.\nQuestion: ${question}\nEmails:\n${conversations
      .slice(0, 40)
      .map((c) => `- [${c.classification}] ${c.subject} from ${c.participants?.[0]?.name} (id:${c._id})`)
      .join("\n")}`
  );
  if (llm) return { text: llm, refs: findRefs(llm, conversations) };

  if (/attention|need my|today/.test(q)) {
    const items = conversations.filter((c) => c.classification === "ASSISTANT_TO_REPLY" && !c.archived);
    return {
      text: items.length
        ? `You have ${items.length} conversation${items.length === 1 ? "" : "s"} that need your attention:\n${items
            .slice(0, 6)
            .map((c, i) => `${i + 1}. ${c.subject} — ${c.participants?.[0]?.name}`)
            .join("\n")}`
        : "Nothing is currently assigned to you. The inbox is clear.",
      refs: items.slice(0, 6).map((c) => ({ id: c._id, subject: c.subject })),
    };
  }
  if (/client/.test(q)) {
    const items = conversations.filter((c) => c.classification === "CLIENT_TO_REPLY" && !c.archived);
    return {
      text: items.length
        ? `${items.length} conversation${items.length === 1 ? "" : "s"} require the client's response:\n${items
            .slice(0, 6)
            .map((c, i) => `${i + 1}. ${c.subject}`)
            .join("\n")}`
        : "No client decisions are waiting.",
      refs: items.slice(0, 6).map((c) => ({ id: c._id, subject: c.subject })),
    };
  }
  if (/waiting|follow/.test(q)) {
    const items = conversations.filter((c) => c.status === "waiting");
    return {
      text: items.length
        ? `${items.length} thread${items.length === 1 ? "" : "s"} waiting on a reply:\n${items.map((c, i) => `${i + 1}. ${c.subject}`).join("\n")}`
        : "No threads are waiting on a response.",
      refs: items.map((c) => ({ id: c._id, subject: c.subject })),
    };
  }
  if (/deadline/.test(q)) {
    const items = conversations.filter((c) => c.analysis?.deadline);
    return {
      text: items.length
        ? `Upcoming deadlines:\n${items.map((c, i) => `${i + 1}. ${c.subject} — ${c.analysis.deadline}`).join("\n")}`
        : "No explicit deadlines were extracted.",
      refs: items.map((c) => ({ id: c._id, subject: c.subject })),
    };
  }
  if (/summar/.test(q) && context.conversation) {
    return { text: await summarizeConversation(context.conversation), refs: [{ id: context.conversation._id, subject: context.conversation.subject }] };
  }
  const fromMatch = q.match(/from (.+)$/);
  if (fromMatch) {
    const name = fromMatch[1].trim();
    const items = conversations.filter((c) =>
      (c.participants || []).some((p) => p.name.toLowerCase().includes(name) || p.email.toLowerCase().includes(name))
    );
    return {
      text: items.length ? `Found ${items.length} conversation(s) matching that sender.` : "No matching sender.",
      refs: items.map((c) => ({ id: c._id, subject: c.subject })),
    };
  }
  return {
    text: `I can help with attention items, client decisions, waiting threads, deadlines, and drafts. ${user?.name ? `Currently signed in as ${user.name}.` : ""}`,
    refs: [],
  };
}

function findRefs(text, conversations) {
  return conversations
    .filter((c) => text.toLowerCase().includes(c.subject.toLowerCase().slice(0, 24)))
    .slice(0, 6)
    .map((c) => ({ id: c._id, subject: c.subject }));
}
