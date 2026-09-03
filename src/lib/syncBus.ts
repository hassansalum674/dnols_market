type PushFn = () => void;

let push: PushFn = () => {};
let applying = false;

export const ACCOUNT_SYNC_EVENT = "dnols-account-sync";

export function setAccountPush(fn: PushFn) {
  push = fn;
}

export function beginRemoteApply() {
  applying = true;
}

export function endRemoteApply() {
  applying = false;
}

export function requestAccountPush() {
  if (applying) return;
  push();
}

export function emitAccountSync() {
  window.dispatchEvent(new Event(ACCOUNT_SYNC_EVENT));
}
