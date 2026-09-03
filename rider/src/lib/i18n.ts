const EN = {
  splashMotto: "Pickup or delivery, nearby",
  english: "English",
  swahili: "Kiswahili",
  riderPortal: "Rider",
  signInTitle: "Rider sign-in",
  signInHint: "Use the phone number the seller added you with.",
  phoneNumber: "Phone number",
  phoneHint: "+255 6XX or 7XX XXX XXX",
  sendCode: "Send code",
  sendingCode: "Sending code…",
  otpLabel: "SMS code",
  verify: "Verify",
  verifying: "Checking…",
  changeNumber: "Use a different number",
  signOut: "Sign out",
  myDeliveries: "My deliveries",
  noDeliveries: "No deliveries yet. When a seller assigns you, they show up here.",
  notLinked:
    "This number is not linked to a stall yet. Ask the seller to add you under My Riders.",
  items: "Items",
  buyer: "Buyer",
  address: "Address",
  openMaps: "Open in Google Maps",
  pickedUp: "I have picked up the order",
  delivered: "Order delivered",
  callBuyer: "Call buyer",
  comingSoon: "Coming soon",
  assigned: "Assigned",
  pickedUpBadge: "Picked up",
  deliveredBadge: "Delivered",
  activeDelivery: "Active delivery",
  back: "Back",
  updating: "Updating…",
  signInFailed: "Could not send the code. Try again.",
  badPhone: "Enter a valid Tanzania number (+255 6… or 7…).",
  badCode: "That code is not valid.",
  installApp: "Install app",
};

const SW: typeof EN = {
  splashMotto: "Kuchukua au kupeleka, karibu",
  english: "English",
  swahili: "Kiswahili",
  riderPortal: "Rider",
  signInTitle: "Ingia kama rider",
  signInHint: "Tumia namba ya simu muuzaji aliyokuongeza nayo.",
  phoneNumber: "Namba ya simu",
  phoneHint: "+255 6XX au 7XX XXX XXX",
  sendCode: "Tuma namba",
  sendingCode: "Inatuma namba…",
  otpLabel: "Namba ya SMS",
  verify: "Thibitisha",
  verifying: "Inakagua…",
  changeNumber: "Tumia namba nyingine",
  signOut: "Toka",
  myDeliveries: "Delivery zangu",
  noDeliveries: "Bado hakuna delivery. Muuzaji akikupa oda, itaonekana hapa.",
  notLinked:
    "Namba hii bado haijaunganishwa na duka. Muulize muuzaji akuongeze kwenye My Riders.",
  items: "Bidhaa",
  buyer: "Mnunuzi",
  address: "Anuani",
  openMaps: "Fungua Google Maps",
  pickedUp: "Nimechukua oda",
  delivered: "Oda imefikishwa",
  callBuyer: "Piga simu mnunuzi",
  comingSoon: "Inakuja hivi karibuni",
  assigned: "Imepewa",
  pickedUpBadge: "Imechukuliwa",
  deliveredBadge: "Imefikishwa",
  activeDelivery: "Delivery inayoendelea",
  back: "Rudi",
  updating: "Inasasisha…",
  signInFailed: "Imeshindikana kutuma namba. Jaribu tena.",
  badPhone: "Andika namba sahihi ya Tanzania (+255 6… au 7…).",
  badCode: "Namba hiyo si sahihi.",
  installApp: "Sakinisha programu",
};

export type AppLanguage = "en" | "sw";
export type RiderMsg = keyof typeof EN;

export function translate(lang: AppLanguage, key: RiderMsg): string {
  return (lang === "sw" ? SW : EN)[key];
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}
