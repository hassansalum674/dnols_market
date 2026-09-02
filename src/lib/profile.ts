import { loadLastDeliveryPhone, loadLastPayPhone } from "./checkout";

export type UserProfile = {
  displayName?: string;
  phone?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  fulfillment?: "pickup" | "delivery";
  avatarDataUrl?: string;
  /** When true, ignore Google photoURL and show the letter avatar. */
  preferLetterAvatar?: boolean;
  language?: "en" | "sw";
};

function key(uid: string): string {
  return `dnols.profile.${uid}`;
}

export function loadProfile(uid: string): UserProfile {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) || "{}") as UserProfile;
  } catch {
    return {};
  }
}

export function saveProfile(uid: string, patch: UserProfile): void {
  try {
    const cur = loadProfile(uid);
    const next = { ...cur, ...patch };
    if (patch.avatarDataUrl === "") delete next.avatarDataUrl;
    if (patch.displayName === "") delete next.displayName;
    localStorage.setItem(key(uid), JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Copy checkout phones onto the signed-in account after pay or sign-in. */
export function mergeCheckoutPhonesToProfile(uid: string): void {
  const pay = loadLastPayPhone();
  const delivery = loadLastDeliveryPhone();
  const patch: UserProfile = {};
  if (pay) patch.phone = pay;
  if (delivery) patch.deliveryPhone = delivery;
  if (Object.keys(patch).length) saveProfile(uid, patch);
}
