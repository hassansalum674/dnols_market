import sharp from "sharp";
import { downloadUrl, openAiConfigured, openAiJson } from "./client.js";
import { saveCdnWebp } from "../photos/cdn.js";

const MIN_COVER_PX = 800;
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

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

function coverPrompt(
  name: string,
  category: string,
  condition: string,
  variant: CoverVariant,
  notes?: string,
): string {
  const base = `Product: "${name}". Category: ${category}. Condition: ${condition}.`;
  const extra = notes?.trim() ? ` Seller notes: ${notes.trim()}.` : "";
  if (variant === 1) {
    return `${base}${extra} Professional e-commerce hero shot on pure white background, centered product, studio lighting, crisp glossy finish, premium marketplace listing photo, square 1:1, photorealistic, no text, no watermark, no people.`;
  }
  return `${base}${extra} Premium product showcase with soft blue accent rim light, subtle reflection on white surface, second angle or lifestyle context, shiny polished look, square 1:1, photorealistic, no text, no watermark, no people.`;
}

async function finalizeCoverWebp(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .resize(MIN_COVER_PX, MIN_COVER_PX, {
      fit: "cover",
      position: "centre",
      background: WHITE,
    })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });

  const width = info.width ?? 0;
  const height = info.height ?? 0;
  if (width < MIN_COVER_PX || height < MIN_COVER_PX) {
    throw new Error(`Cover image must be at least ${MIN_COVER_PX}×${MIN_COVER_PX}px.`);
  }

  return data;
}

async function templateCover(
  name: string,
  variant: CoverVariant,
): Promise<Buffer> {
  const label = name.trim().slice(0, 48) || "Product";
  const accent = variant === 1 ? "#1a6fd4" : "#0d4a8f";
  const svg = `
<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0f4f8"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="45%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <rect width="800" height="800" fill="url(#glow)"/>
  <ellipse cx="400" cy="430" rx="220" ry="70" fill="#000" opacity="0.06"/>
  <rect x="250" y="250" width="300" height="300" rx="24" fill="#ffffff" stroke="${accent}" stroke-width="3"/>
  <text x="400" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#1a1a1a">${escapeXml(label)}</text>
  <text x="400" y="455" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">AI cover ${variant}</text>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function generateOneCover(
  opts: {
    name: string;
    category: string;
    condition: string;
    variant: CoverVariant;
    notes?: string;
  },
  publicBase: string,
): Promise<GeneratedCover> {
  const { name, category, condition, variant, notes } = opts;
  let raw: Buffer;
  let provider: string;

  if (openAiConfigured()) {
    const prompt = coverPrompt(name, category, condition, variant, notes);
    const data = await openAiJson<{
      data?: { url?: string; b64_json?: string }[];
    }>("/images/generations", {
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      quality: "standard",
    });

    const item = data.data?.[0];
    if (item?.url) {
      raw = await downloadUrl(item.url);
      provider = "openai-dalle3";
    } else if (item?.b64_json) {
      raw = Buffer.from(item.b64_json, "base64");
      provider = "openai-dalle3";
    } else {
      throw new Error("OpenAI returned no image data.");
    }
  } else {
    raw = await templateCover(name, variant);
    provider = "template";
  }

  const webp = await finalizeCoverWebp(raw);
  const id = await saveCdnWebp(webp);
  const cdnPath = `/cdn/${id}.webp`;
  const cdnUrl = publicBase ? `${publicBase}${cdnPath}` : `/api/cdn/${id}.webp`;

  return {
    cdnUrl,
    cdnId: id,
    width: MIN_COVER_PX,
    height: MIN_COVER_PX,
    variant,
    provider,
    sizeKb: Math.round(webp.length / 1024),
  };
}

export async function generateCoverPair(input: {
  name: string;
  category: string;
  condition: string;
  notes?: string;
  variant?: CoverVariant;
}): Promise<{ covers: GeneratedCover[]; aiConfigured: boolean }> {
  const publicBase = (process.env.API_PUBLIC_URL ?? "").replace(/\/$/, "");
  const aiConfigured = openAiConfigured();

  if (input.variant) {
    const cover = await generateOneCover(
      {
        name: input.name,
        category: input.category,
        condition: input.condition,
        variant: input.variant,
        notes: input.notes,
      },
      publicBase,
    );
    return { covers: [cover], aiConfigured };
  }

  const covers = await Promise.all(
    ([1, 2] as CoverVariant[]).map((variant) =>
      generateOneCover(
        {
          name: input.name,
          category: input.category,
          condition: input.condition,
          variant,
          notes: input.notes,
        },
        publicBase,
      ),
    ),
  );

  return { covers, aiConfigured };
}
