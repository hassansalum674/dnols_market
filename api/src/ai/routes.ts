import type { FastifyInstance } from "fastify";
import { generateCoverPair, type CoverVariant } from "./covers.js";
import {
  assistDescription,
  type DescriptionAction,
  type DescriptionLanguage,
} from "./description.js";
import { openAiConfigured } from "./client.js";

export async function registerAiRoutes(app: FastifyInstance): Promise<void> {
  app.get("/ai/status", async () => ({
    openai: openAiConfigured(),
    covers: true,
    description: true,
  }));

  app.post("/ai/generate-cover", async (req, reply) => {
    const body = req.body as {
      name?: string;
      category?: string;
      condition?: string;
      notes?: string;
      variant?: number;
    };

    const name = body.name?.trim();
    if (!name) {
      return reply.code(400).send({
        error: "missing_name",
        message: "Product name is required to generate covers.",
      });
    }

    const variant =
      body.variant === 1 || body.variant === 2
        ? (body.variant as CoverVariant)
        : undefined;

    try {
      const result = await generateCoverPair({
        name,
        category: body.category?.trim() || "general",
        condition: body.condition?.trim() || "new",
        notes: body.notes,
        variant,
      });

      return {
        covers: result.covers,
        aiConfigured: result.aiConfigured,
        hint: result.aiConfigured
          ? undefined
          : "OPENAI_API_KEY not set — using placeholder covers. Add the key on Render for real AI images.",
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "cover_generation_failed";
      return reply.code(422).send({ error: "cover_generation_failed", message: msg });
    }
  });

  app.post("/ai/description", async (req, reply) => {
    const body = req.body as {
      action?: string;
      language?: string;
      productName?: string;
      category?: string;
      condition?: string;
      draft?: string;
      voiceTranscript?: string;
      answers?: Record<string, string>;
    };

    const productName = body.productName?.trim();
    if (!productName) {
      return reply.code(400).send({
        error: "missing_name",
        message: "Product name is required.",
      });
    }

    const action = (["write", "improve", "questions"] as const).includes(
      body.action as DescriptionAction,
    )
      ? (body.action as DescriptionAction)
      : "write";

    const language: DescriptionLanguage =
      body.language === "sw" ? "sw" : "en";

    try {
      const result = await assistDescription({
        action,
        language,
        productName,
        category: body.category?.trim() || "general",
        condition: body.condition?.trim() || "new",
        draft: body.draft,
        voiceTranscript: body.voiceTranscript,
        answers: body.answers,
      });

      return {
        ...result,
        aiConfigured: openAiConfigured(),
        hint: openAiConfigured()
          ? undefined
          : "OPENAI_API_KEY not set — using basic text templates.",
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "description_failed";
      return reply.code(422).send({ error: "description_failed", message: msg });
    }
  });
}
