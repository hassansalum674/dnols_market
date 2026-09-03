export const DESC_MAX = 280;

export type AssistLang = "en" | "sw";

export type DescribeTurn = {
  role: "user" | "assistant";
  content: string;
};

export type DescribeRequest = {
  name?: string;
  category?: string;
  condition?: string;
  variants?: string[];
  language?: AssistLang;
  messages: DescribeTurn[];
};

export type DescribeReply = {
  done: boolean;
  question?: string;
  options?: string[];
  description?: string;
  provider: string;
};

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trim()}…`;
}

export function describeConfigured(): {
  configured: boolean;
  provider: "anthropic" | "openai" | "gemini" | null;
} {
  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    return { configured: true, provider: "anthropic" };
  }
  if (process.env.OPENAI_API_KEY?.trim()) {
    return { configured: true, provider: "openai" };
  }
  if (process.env.GEMINI_API_KEY?.trim()) {
    return { configured: true, provider: "gemini" };
  }
  return { configured: false, provider: null };
}

function systemPrompt(forceWrite: boolean, language: AssistLang): string {
  const lang =
    language === "sw"
      ? "Kiswahili (simple, stall-friendly)"
      : "English (simple, stall-friendly)";
  return `You help Kariakoo stall sellers on Dnols write product listings.

Talk like a shop assistant, not a form. Read the seller's note and ask ONE follow-up question that is specific to what they wrote. Do not use a fixed script. Different notes must produce different questions.

Examples of good questions:
- Note "blue kitenge maxi wrap waist" → ask if it is a sewn dress or fabric sold by the metre, or which sizes are ready.
- Note "Samsung A14 128 used" → ask about battery health or whether the box/charger is included.
- Note "USB fan for stall" → ask about power source or noise, not "who is it for?".

Rules:
- Language: ${lang}
- Ask at most one question per turn.
- When useful, give 2–4 short tap choices for THAT question. Choices must fit this item.
- After 2 or 3 answers, or when you already know enough, stop asking and write the listing.
- Listing: 1–3 honest sentences, max ${DESC_MAX} characters. No invented brands, warranties, NIDA, or claims the seller did not give.
- Pickup/delivery in Kariakoo may be mentioned once if it fits.
${forceWrite ? "- You MUST write the listing now. Do not ask another question." : ""}

Reply with JSON only, no markdown:
{"done":false,"question":"...","options":["...","..."]}
or
{"done":true,"description":"..."}`;
}

function preamble(req: DescribeRequest): string {
  const variants = Array.isArray(req.variants)
    ? req.variants.filter(Boolean).join(", ")
    : "";
  return [
    `Product name: ${req.name?.trim() || "(none yet)"}`,
    `Category: ${req.category || "(unspecified)"}`,
    `Condition: ${req.condition || "(unspecified)"}`,
    `Sizes/variants: ${variants || "(none)"}`,
  ].join("\n");
}

function parseReply(raw: string, provider: string): DescribeReply {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("AI returned no JSON");
  }
  const obj = JSON.parse(trimmed.slice(start, end + 1)) as {
    done?: unknown;
    question?: unknown;
    options?: unknown;
    description?: unknown;
  };
  const done = Boolean(obj.done) || typeof obj.description === "string";
  if (done) {
    const description = clip(String(obj.description ?? ""), DESC_MAX);
    if (description.length < 8) throw new Error("AI listing was empty");
    return { done: true, description, provider };
  }
  const question = String(obj.question ?? "").trim();
  if (question.length < 4) throw new Error("AI question was empty");
  const options = Array.isArray(obj.options)
    ? obj.options
        .map((o) => String(o).trim())
        .filter((o) => o.length > 0 && o.length < 48)
        .slice(0, 4)
    : [];
  return { done: false, question, options, provider };
}

function asMessages(req: DescribeRequest): { role: "user" | "assistant"; content: string }[] {
  const msgs = Array.isArray(req.messages) ? req.messages : [];
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of msgs.slice(0, 12)) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const content = String(m.content ?? "").trim().slice(0, 500);
    if (!content) continue;
    out.push({ role: m.role, content });
  }
  if (out.length === 0) {
    throw new Error("Write a few words about the product first.");
  }
  const first = out[0]!;
  if (first.role === "user") {
    first.content = `${preamble(req)}\n\nSeller note:\n${first.content}`;
  } else {
    out.unshift({
      role: "user",
      content: `${preamble(req)}\n\nSeller note:\n(see below)`,
    });
  }
  return out;
}

async function callAnthropic(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  apiKey: string,
): Promise<string> {
  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-haiku-latest";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      temperature: 0.6,
      system,
      messages,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    content?: { type?: string; text?: string }[];
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(body.error?.message || `Claude failed (${res.status})`);
  }
  const text = (body.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("\n")
    .trim();
  if (!text) throw new Error("Claude returned an empty reply");
  return text;
}

async function callOpenAi(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  apiKey: string,
): Promise<string> {
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(body.error?.message || `OpenAI failed (${res.status})`);
  }
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("OpenAI returned an empty reply");
  return text;
}

async function callGemini(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  apiKey: string,
): Promise<string> {
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 400,
          responseMimeType: "application/json",
        },
      }),
    },
  );
  const body = (await res.json().catch(() => ({}))) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(body.error?.message || `Gemini failed (${res.status})`);
  }
  const text =
    body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n").trim() ??
    "";
  if (!text) throw new Error("Gemini returned an empty reply");
  return text;
}

export async function runDescribeChat(req: DescribeRequest): Promise<DescribeReply> {
  const { configured, provider } = describeConfigured();
  if (!configured || !provider) {
    const err = new Error(
      "AI writing is not connected. Add ANTHROPIC_API_KEY (Claude) on the Dnols API in Render.",
    );
    (err as Error & { status: number }).status = 503;
    throw err;
  }

  const language: AssistLang = req.language === "sw" ? "sw" : "en";
  const messages = asMessages(req);
  const assistantTurns = messages.filter((m) => m.role === "assistant").length;
  const forceWrite = assistantTurns >= 3;
  const system = systemPrompt(forceWrite, language);

  let raw: string;
  if (provider === "anthropic") {
    raw = await callAnthropic(system, messages, process.env.ANTHROPIC_API_KEY!.trim());
  } else if (provider === "openai") {
    raw = await callOpenAi(system, messages, process.env.OPENAI_API_KEY!.trim());
  } else {
    raw = await callGemini(system, messages, process.env.GEMINI_API_KEY!.trim());
  }

  const reply = parseReply(raw, provider);
  if (forceWrite && !reply.done) {
    throw new Error("AI did not write the listing");
  }
  return reply;
}
