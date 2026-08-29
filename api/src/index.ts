import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerRoutes } from "./routes.js";

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "0.0.0.0";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
const buyerLat = Number(process.env.BUYER_LAT ?? -6.8224);
const buyerLng = Number(process.env.BUYER_LNG ?? 39.2739);

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((s) => s.trim()),
});

registerRoutes(app, { buyerLat, buyerLng });

app.get("/openapi.json", async (_req, reply) => {
  return reply.send({
    info: {
      title: "Dnols API",
      version: "0.1.0",
      description:
        "Shop-only Kariakoo stub. Stable REST paths — see ../openapi.yaml and README.",
    },
    paths: [
      "GET /health",
      "GET /places",
      "GET /listings",
      "GET /listings/:id",
      "GET /cart",
      "POST /cart",
      "POST /orders/pay",
      "POST /orders/reserve",
      "GET /orders/:id",
      "POST /orders/:id/handover",
      "GET /trending",
      "GET /search",
      "POST /payments/stk-push",
      "GET /payments/stk-push/:id",
    ],
  });
});

try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Dnols API on http://localhost:${PORT} (CORS ${CORS_ORIGIN})`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
