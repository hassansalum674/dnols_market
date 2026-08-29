import type { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { readCdnWebp, saveCdnWebp } from "./cdn.js";
import { processCoverPhoto, processDetailPhoto } from "./process.js";

export async function registerPhotoRoutes(app: FastifyInstance): Promise<void> {
  await app.register(multipart, {
    limits: { fileSize: 12 * 1024 * 1024 },
  });

  app.post("/photos/process", async (req, reply) => {
    const data = await req.file();
    if (!data) {
      return reply.code(400).send({ error: "no_file", message: "Upload an image file." });
    }

    const modeField = data.fields.mode;
    const mode =
      (typeof modeField === "object" &&
        modeField !== null &&
        "value" in modeField &&
        modeField.value === "detail")
        ? "detail"
        : "cover";

    const buffer = await data.toBuffer();
    const mime = data.mimetype || "image/jpeg";

    if (!mime.startsWith("image/")) {
      return reply.code(400).send({ error: "bad_type", message: "File must be an image." });
    }

    try {
      const result =
        mode === "cover"
          ? await processCoverPhoto(buffer, mime)
          : await processDetailPhoto(buffer);

      const id = await saveCdnWebp(result.buffer);
      const publicBase = (process.env.API_PUBLIC_URL ?? "").replace(/\/$/, "");
      const cdnPath = `/cdn/${id}.webp`;
      const cdnUrl = publicBase ? `${publicBase}${cdnPath}` : `/api/cdn/${id}.webp`;

      return {
        cdnUrl,
        cdnId: id,
        width: result.width,
        height: result.height,
        mode: result.mode,
        provider: result.provider,
        sizeKb: Math.round(result.buffer.length / 1024),
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "processing_failed";
      return reply.code(422).send({ error: "processing_failed", message: msg });
    }
  });

  app.get("/cdn/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const clean = id.replace(/\.webp$/i, "");
    const buf = await readCdnWebp(clean);
    if (!buf) {
      return reply.code(404).send({ error: "not_found" });
    }
    return reply
      .header("Content-Type", "image/webp")
      .header("Cache-Control", "public, max-age=31536000, immutable")
      .send(buf);
  });
}
