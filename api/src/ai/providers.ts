import { downloadUrl } from "./client.js";

export type TextProvider = "groq" | "anthropic" | "gemini" | "openai" | "template";
export type ImageProvider = "gemini-imagen" | "openai-dalle3" | "template";

export type AiProviderStatus = {
  text: TextProvider | null;
  images: ImageProvider | null;
  groq: boolean;
  anthropic: boolean;
  gemini: boolean;
  openai: boolean;
};

export function providerStatus(): AiProviderStatus {
  const groq = Boolean(process.env.GROQ_API_KEY?.trim());
  const anthropic = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  const gemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const openai = Boolean(process.env.OPENAI_API_KEY?.trim());

  const text: TextProvider | null = groq
    ? "groq"
    : anthropic
      ? "anthropic"
      : gemini
        ? "gemini"
        : openai
          ? "openai"
          : null;

  const images: ImageProvider | null = gemini
    ? "gemini-imagen"
    : openai
      ? "openai-dalle3"
      : null;

  return { text, images, groq, anthropic, gemini, openai };
}

export function textProviderConfigured(): boolean {
  const s = providerStatus();
  return Boolean(s.text);
}

export function imageProviderConfigured(): boolean {
  return Boolean(providerStatus().images);
}

function groqModel(): string {
  return process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
}

function anthropicModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-haiku-latest";
}

function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
}

function geminiImageModel(): string {
  return (
    process.env.GEMINI_IMAGE_MODEL?.trim() || "imagen-3.0-generate-002"
  );
}

function parseJsonContent(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(body) as Record<string, unknown>;
}

export async function generateJsonText(
  system: string,
  user: string,
): Promise<{ data: Record<string, unknown>; provider: TextProvider }> {
  const status = providerStatus();

  if (status.groq) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel(),
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(data.error?.message || `Groq failed (${res.status})`);
    }
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    return { data: parseJsonContent(raw), provider: "groq" };
  }

  if (status.anthropic) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: anthropicModel(),
        max_tokens: Number(process.env.ANTHROPIC_MAX_TOKENS ?? 512),
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(data.error?.message || `Anthropic failed (${res.status})`);
    }
    const raw =
      data.content?.find((c) => c.type === "text")?.text?.trim() ?? "{}";
    return { data: parseJsonContent(raw), provider: "anthropic" };
  }

  if (status.gemini) {
    const model = geminiModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    });
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(data.error?.message || `Gemini failed (${res.status})`);
    }
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return { data: parseJsonContent(raw), provider: "gemini" };
  }

  if (status.openai) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(data.error?.message || `OpenAI failed (${res.status})`);
    }
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    return { data: parseJsonContent(raw), provider: "openai" };
  }

  throw new Error("No text AI provider configured.");
}

export async function generateCoverImage(
  prompt: string,
): Promise<{ buffer: Buffer; provider: string }> {
  const status = providerStatus();

  if (status.gemini) {
    const model = geminiImageModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: "1:1" },
      }),
    });
    const data = (await res.json()) as {
      predictions?: { bytesBase64Encoded?: string }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(data.error?.message || `Gemini Imagen failed (${res.status})`);
    }
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error("Gemini Imagen returned no image.");
    return { buffer: Buffer.from(b64, "base64"), provider: "gemini-imagen" };
  }

  if (status.openai) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url",
        quality: "standard",
      }),
    });
    const data = (await res.json()) as {
      data?: { url?: string; b64_json?: string }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(data.error?.message || `OpenAI images failed (${res.status})`);
    }
    const item = data.data?.[0];
    if (item?.url) {
      return { buffer: await downloadUrl(item.url), provider: "openai-dalle3" };
    }
    if (item?.b64_json) {
      return {
        buffer: Buffer.from(item.b64_json, "base64"),
        provider: "openai-dalle3",
      };
    }
    throw new Error("OpenAI returned no image data.");
  }

  throw new Error("No image AI provider configured.");
}
