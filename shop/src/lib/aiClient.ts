import { apiBase } from "./apiBase";
import { resolveApiUrl } from "./photoPipeline";

const BASE = apiBase();

export type CoverVariant = 1 | 2;

export type GeneratedCover = {
  cdnUrl: string;
  cdnId: string;
  width: number;
  height: number;
  variant: CoverVariant;
  provider: string;
  sizeKb: number;
};

export type DescriptionLanguage = "en" | "sw";
export type DescriptionAction = "write" | "improve" | "questions";

async function aiFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      /failed to fetch|networkerror/i.test(msg)
        ? "Cannot reach the AI server. Check that the API is running on Render."
        : msg,
    );
  }

  const data = (await res.json().catch(() => ({}))) as T & {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.message || data.error || `AI request failed (${res.status})`);
  }

  return data;
}

export async function fetchAiStatus(): Promise<{ openai: boolean }> {
  const res = await fetch(`${BASE}/ai/status`);
  if (!res.ok) return { openai: false };
  return (await res.json()) as { openai: boolean };
}

export async function generateCovers(input: {
  name: string;
  category: string;
  condition: string;
  notes?: string;
  variant?: CoverVariant;
}): Promise<{
  covers: GeneratedCover[];
  aiConfigured: boolean;
  hint?: string;
}> {
  const data = await aiFetch<{
    covers: GeneratedCover[];
    aiConfigured: boolean;
    hint?: string;
  }>("/ai/generate-cover", input);

  return {
    ...data,
    covers: data.covers.map((c) => ({
      ...c,
      cdnUrl: resolveApiUrl(c.cdnUrl),
    })),
  };
}

export async function assistDescription(input: {
  action: DescriptionAction;
  language: DescriptionLanguage;
  productName: string;
  category: string;
  condition: string;
  draft?: string;
  voiceTranscript?: string;
  answers?: Record<string, string>;
}): Promise<{
  description?: string;
  questions?: string[];
  provider: string;
  aiConfigured: boolean;
  hint?: string;
}> {
  return aiFetch("/ai/description", input);
}
