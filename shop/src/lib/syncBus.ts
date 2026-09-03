type PushFn = () => void;

let push: PushFn = () => {};
let applying = false;

export const SELLER_SYNC_EVENT = "dnols-seller-sync";

export function setSellerPush(fn: PushFn) {
  push = fn;
}

export function beginRemoteApply() {
  applying = true;
}

export function endRemoteApply() {
  applying = false;
}

export function requestSellerPush() {
  if (applying) return;
  push();
}

export function emitSellerSync() {
  window.dispatchEvent(new Event(SELLER_SYNC_EVENT));
}
