#!/usr/bin/env node
/**
 * shop/ is seller source imported by the root Vite (`@shop`).
 * It is not a second website. Port 5174 is dead.
 */
console.error(`
Port 5174 is dead. This folder is seller source, not a website.

  Stop anything listening on :5174.
  From the repo root run:  npm run dev
  Then open:               http://localhost:5173/shop

If the tab says “Dnols Shop” on localhost:5174 you started the old shop app — stop it.
`);
process.exit(1);
