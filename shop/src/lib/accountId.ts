/** Stable public ID from a signed-in Firebase uid. */
export function publicAccountId(uid: string): string {
  const compact = uid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const tail = (compact.slice(-8) || compact).padStart(8, "0").slice(-8);
  return `DN-${tail.slice(0, 4)}-${tail.slice(4)}`;
}

export function shopIdFromUid(uid: string): string {
  return `shop_${uid.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toLowerCase()}`;
}
