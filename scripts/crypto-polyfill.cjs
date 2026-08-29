"use strict";
const nodeCrypto = require("node:crypto");
if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") {
  Object.defineProperty(globalThis, "crypto", {
    value: nodeCrypto.webcrypto || nodeCrypto,
    configurable: true,
  });
}
