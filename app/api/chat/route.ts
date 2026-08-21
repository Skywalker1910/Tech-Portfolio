import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildPortfolioContext } from "@/lib/portfolio-context";
import { getChatSources, retrievePortfolioContext } from "@/lib/rag/retrieval";
import type { BB8Action, PortfolioRoute } from "@/lib/bb8-actions";
import { getAnalyticsContext, recordChatUsage, sanitizeAnalyticsId, type AnalyticsClientHints, type ChatTokenUsage } from "@/lib/analytics";
import { volatileRequestKey } from "@/lib/request-rate-limit";

export const dynamic = "force-dynamic";

// Rate limiting: track short-lived one-way request keys in memory (resets on cold start).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;       // max requests per window
const RATE_WINDOW = 60_000;  // 1 minute
const MAX_MESSAGES = 6;
const MAX_TOTAL_CHARS = 5_000;
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-5.6-terra";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatTelemetry = { visitorId:string; sessionId:string; chatSessionId:string; tier:"basic"|"enhanced" };

function combinedUsage(...responses: Array<{ usage?: OpenAI.Responses.ResponseUsage | null }>): ChatTokenUsage {
  return responses.reduce<ChatTokenUsage>((total, response) => ({
    inputTokens:total.inputTokens + Number(response.usage?.input_tokens ?? 0),
    outputTokens:total.outputTokens + Number(response.usage?.output_tokens ?? 0),
    totalTokens:total.totalTokens + Number(response.usage?.total_tokens ?? 0),
    cachedTokens:total.cachedTokens + Number(response.usage?.input_tokens_details?.cached_tokens ?? 0),
  }), { inputTokens:0, outputTokens:0, totalTokens:0, cachedTokens:0 });
}

const BB8_TOOLS = [
  {
    type: "function" as const,
    name: "navigate_portfolio",
    description: "Open the most relevant page while keeping BB-8 chat available as an overlay.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        href: { type: "string", enum: ["/", "/projects", "/experience", "/skills", "/contact", "/education", "/socials"] },
        label: { type: "string", description: "Short button label such as Open projects." },
      },
      required: ["href", "label"],
      additionalProperties: false,
    },
  },
  {
    type: "function" as const,
    name: "offer_resume",
    description: "Show a button that lets the visitor download Aditya's resume PDF.",
    strict: true,
    parameters: {
      type: "object",
      properties: { label: { type: "string", description: "Short download button label." } },
      required: ["label"],
      additionalProperties: false,
    },
  },
  {
    type: "function" as const,
    name: "prepare_contact_draft",
    description: "Prefill the portfolio contact form from details explicitly provided by the visitor. This never submits the form.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        message: { type: "string" },
        label: { type: "string", description: "Short button label such as Review contact draft." },
      },
      required: ["firstName", "lastName", "email", "message", "label"],
      additionalProperties: false,
    },
  },
];

function actionFromToolCall(call: { name: string; arguments: string }): BB8Action | null {
  try {
    const args = JSON.parse(call.arguments) as Record<string, unknown>;
    const label = typeof args.label === "string" ? args.label.slice(0, 60) : "Continue";
    if (call.name === "navigate_portfolio" && typeof args.href === "string") {
      const routes = ["/", "/projects", "/experience", "/skills", "/contact", "/education", "/socials"];
      if (routes.includes(args.href)) return { type: "navigate", href: args.href as PortfolioRoute, label };
    }
    if (call.name === "offer_resume") return { type: "resume", href: "/resume.pdf", label };
    if (call.name === "prepare_contact_draft") {
      const clean = (key: string, max: number) => typeof args[key] === "string" ? args[key].slice(0, max) : "";
      return {
        type: "contact_draft",
        href: "/contact",
        label,
        draft: {
          firstName: clean("firstName", 80),
          lastName: clean("lastName", 80),
          email: clean("email", 254),
          message: clean("message", 2_000),
        },
      };
    }
  } catch { /* Ignore malformed model tool arguments. */ }
  return null;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 500) for (const [key, value] of rateLimitMap) if (value.resetAt <= now) rateLimitMap.delete(key);
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

function parseMessages(body: unknown): ConversationMessage[] | null {
  if (!body || typeof body !== "object") return null;

  const { messages, message } = body as { messages?: unknown; message?: unknown };

  // Keep the original single-message contract working for older clients.
  if (messages === undefined) {
    const content = typeof message === "string" ? message.trim() : "";
    return content && content.length <= 1_000 ? [{ role: "user", content }] : null;
  }

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return null;
  }

  const conversation: ConversationMessage[] = [];
  let totalChars = 0;

  for (const entry of messages) {
    if (!entry || typeof entry !== "object") return null;
    const { role, content: rawContent } = entry as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (typeof rawContent !== "string") return null;

    const content = rawContent.trim();
    const maxLength = role === "user" ? 1_000 : 2_000;
    if (!content || content.length > maxLength) return null;

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) return null;
    conversation.push({ role, content });
  }

  return conversation.at(-1)?.role === "user" ? conversation : null;
}

export async function POST(req: NextRequest) {
  // Auth check: API key must be set server-side
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI service not configured." }, { status: 503 });
  }

  // Rate limit by IP
  const requestKey = volatileRequestKey(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown");
  if (isRateLimited(requestKey)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let conversation: ConversationMessage[] | null;
  let telemetry:ChatTelemetry|null = null;
  let clientHints: AnalyticsClientHints = {};
  try {
    const body = await req.json();
    conversation = parseMessages(body);
    const candidate = body?.telemetry;
    if (candidate && typeof candidate === "object") {
      const visitorId = sanitizeAnalyticsId(candidate.visitorId);
      const sessionId = sanitizeAnalyticsId(candidate.sessionId);
      const chatSessionId = sanitizeAnalyticsId(candidate.chatSessionId);
      const tier = candidate.tier === "enhanced" ? "enhanced" : candidate.tier === "basic" ? "basic" : null;
      if (visitorId && sessionId && chatSessionId && tier) telemetry = { visitorId, sessionId, chatSessionId, tier };
    }
    clientHints = body?.client && typeof body.client === "object" ? body.client : {};
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!conversation) {
    return NextResponse.json({ error: "Invalid conversation history." }, { status: 400 });
  }

  const startedAt = Date.now();
  const analyticsContext = telemetry ? getAnalyticsContext(req.headers, clientHints) : null;
  let retrievalMode: string | null = null;
  let retrievalFallback = false;

  const trackUsage = async (input: { successful:boolean; usage?:ChatTokenUsage|null; actionType?:string|null }) => {
    if (!telemetry || !analyticsContext) return;
    try {
      await recordChatUsage({
        eventId:crypto.randomUUID(),
        visitorId:telemetry.visitorId,
        sessionId:telemetry.sessionId,
        chatSessionId:telemetry.chatSessionId,
        context:analyticsContext,
        model:CHAT_MODEL,
        successful:input.successful,
        durationMs:Date.now() - startedAt,
        retrievalMode,
        retrievalFallback,
        actionType:input.actionType,
        usage:input.usage,
        detailed:telemetry.tier === "enhanced",
      });
    } catch (error) {
      console.error("[/api/chat] Could not record BB-8 usage.", error);
    }
  };

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const retrievalQuery = conversation
      .filter((message) => message.role === "user")
      .slice(-2)
      .map((message) => message.content)
      .join("\n");
    const retrieval = await retrievePortfolioContext(retrievalQuery, { openai });
    retrievalMode = retrieval.mode;
    retrievalFallback = Boolean(retrieval.fallbackReason);
    const response = await openai.responses.create({
      model: CHAT_MODEL,
      instructions: buildPortfolioContext(retrieval),
      input: conversation,
      max_output_tokens: 1_000,
      reasoning: { effort: "low" },
      text: { verbosity: "medium" },
      tools: BB8_TOOLS,
      tool_choice: "auto",
      parallel_tool_calls: false,
      store: false,
    });

    const toolCall = response.output.find((item) => item.type === "function_call");
    const action = toolCall?.type === "function_call" ? actionFromToolCall(toolCall) : null;
    const fallback = action?.type === "resume"
      ? "Absolutely — you can download Aditya's resume below."
      : action?.type === "contact_draft"
        ? "I've prepared the details you shared. Please review the contact form before sending it."
        : action?.type === "navigate"
          ? "I'll take you to the most relevant section."
          : "I couldn't generate a response.";
    let answer = response.output_text.trim();
    let finalResponse: OpenAI.Responses.Response | null = null;
    if (!answer && toolCall?.type === "function_call" && action) {
      const completedAction = action.type === "resume"
        ? { status: "ready", note: "The interface will display a resume download button." }
        : action.type === "contact_draft"
          ? { status: "ready", note: "The interface will prefill the contact form for review. It has not been submitted." }
          : { status: "ready", note: `The interface will navigate to ${action.href} while keeping chat open.` };
      finalResponse = await openai.responses.create({
        model: CHAT_MODEL,
        instructions: buildPortfolioContext(retrieval),
        input: [
          ...conversation,
          ...response.output,
          { type: "function_call_output", call_id: toolCall.call_id, output: JSON.stringify(completedAction) },
        ] as OpenAI.Responses.ResponseInput,
        max_output_tokens: 700,
        reasoning: { effort: "low" },
        text: { verbosity: "medium" },
        tools: BB8_TOOLS,
        tool_choice: "none",
        store: false,
      });
      answer = finalResponse.output_text.trim();
    }
    answer ||= fallback;
    await trackUsage({ successful:true, usage:combinedUsage(response, ...(finalResponse ? [finalResponse] : [])), actionType:action?.type ?? null });
    return NextResponse.json({
      answer,
      action,
      sources: getChatSources(retrieval.chunks),
      retrieval: {
        mode: retrieval.mode,
        matches: retrieval.chunks.length,
        durationMs: Math.round(retrieval.durationMs),
        fallback: Boolean(retrieval.fallbackReason),
      },
    });
  } catch (err) {
    console.error("[/api/chat] OpenAI error:", err);
    await trackUsage({ successful:false });
    return NextResponse.json({ error: "AI service temporarily unavailable." }, { status: 502 });
  }
}
