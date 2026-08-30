import { loadLastDeliveryPhone, loadLastPayPhone } from "./checkout";

export type UserProfile = {
  phone?: string;
  deliveryPhone?: string;
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
    localStorage.setItem(key(uid), JSON.stringify({ ...cur, ...patch }));
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
