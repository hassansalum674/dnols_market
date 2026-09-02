import type { PreferredLanguage } from "../types";

const EN = {
  stepOf: "Step {current} of {total}",
  draftSaved: "Draft saved",
  back: "Back",
  continue: "Continue",
  chooseLanguage: "Choose your language",
  languageHint: "English or Kiswahili. This applies to the rest of onboarding.",
  title1: "Shop identity",
  title2: "Location in Kariakoo",
  title3: "Contact",
  title4: "Owner identity",
  title5: "Payout",
  title6: "Shop hours",
  shopName: "Shop name *",
  category: "Category (max 2) *",
  shopPhoto: "Shop profile photo",
  shortDesc: "Short description",
  whatDoYouSell: "What do you sell?",
  noGps: "No GPS — we use your stall details inside Kariakoo.",
  street: "Street / lane name *",
  stallNumber: "Stall or shop number *",
  floor: "Floor *",
  block: "Block or building name",
  landmark: "Landmark hint",
  primaryPhone: "Primary phone number *",
  whatsappSame: "WhatsApp same as primary",
  whatsapp: "WhatsApp number *",
  idNotice:
    "Your ID is used only for payment verification. It is never shown to buyers. Enter your own NIDA — every seller has a unique ID.",
  legalName: "Full legal name (must match ID) *",
  nida: "NIDA number (20 digits) *",
  idFront: "ID photo — front",
  idBack: "ID photo — back",
  selfie: "Selfie holding ID",
  payoutNotice: "Payments are released to this number after the buyer confirms receipt.",
  mmProvider: "Mobile money provider *",
  mmNumber: "Mobile money number *",
  accountName: "Account name (must match legal name) *",
  asOnId: "As on ID",
  openDays: "Open days *",
  openingTime: "Opening time",
  closingTime: "Closing time",
  saveExit: "Save & exit — resume anytime",
  yourShopId: "Your shop ID",
  shopIdHint: "This ID belongs to your account. Keep it for support and pickup disputes.",
  closedHolidays: "Closed on public holidays",
  submitReview: "Submit for review",
  reviewHint: "Your shop will be reviewed within 24 hours. No auto-approval.",
};

const SW: typeof EN = {
  stepOf: "Hatua {current} kati ya {total}",
  draftSaved: "Rasimu imehifadhiwa",
  back: "Rudi",
  continue: "Endelea",
  chooseLanguage: "Chagua lugha",
  languageHint: "English au Kiswahili. Lugha hii itatumika katika usajili wote.",
  title1: "Utambulisho wa duka",
  title2: "Mahali Kariakoo",
  title3: "Mawasiliano",
  title4: "Utambulisho wa mmiliki",
  title5: "Malipo",
  title6: "Saa za duka",
  shopName: "Jina la duka *",
  category: "Aina (zaidi 2) *",
  shopPhoto: "Picha ya duka",
  shortDesc: "Maelezo mafupi",
  whatDoYouSell: "Unauza nini?",
  noGps: "Hakuna GPS — tunatumia maelezo ya duka ndani ya Kariakoo.",
  street: "Jina la mtaa / kichochoro *",
  stallNumber: "Namba ya duka *",
  floor: "Ghorofa *",
  block: "Jina la jengo",
  landmark: "Alama ya kukutambua",
  primaryPhone: "Namba kuu ya simu *",
  whatsappSame: "WhatsApp ni namba ile ile",
  whatsapp: "Namba ya WhatsApp *",
  idNotice:
    "Kitambulisho chako kinatumika kuthibitisha malipo tu. Hakiwekwi wazi kwa wanunuzi. Weka NIDA yako — kila muuzaji ana kitambulisho chake.",
  legalName: "Jina kamili kama kwenye kitambulisho *",
  nida: "Namba ya NIDA (tarakimu 20) *",
  idFront: "Picha ya kitambulisho — mbele",
  idBack: "Picha ya kitambulisho — nyuma",
  selfie: "Picha ukishika kitambulisho",
  payoutNotice: "Pesa zinatolewa kwenye namba hii baada ya mnunuzi kuthibitisha.",
  mmProvider: "Mtandao wa simu *",
  mmNumber: "Namba ya malipo ya simu *",
  accountName: "Jina la akaunti (lilingane na kitambulisho) *",
  asOnId: "Kama kwenye kitambulisho",
  openDays: "Siku za kufungua *",
  openingTime: "Saa ya kufungua",
  closingTime: "Saa ya kufunga",
  saveExit: "Hifadhi na toka — rudi baadaye",
  yourShopId: "Kitambulisho cha duka",
  shopIdHint: "Hiki ni kitambulisho cha akaunti yako. Kihifadhi kwa msaada na migogoro ya kuchukua bidhaa.",
  closedHolidays: "Imefungwa siku za sikukuu",
  submitReview: "Tuma kwa ukaguzi",
  reviewHint: "Duka litakaguliwa ndani ya saa 24. Hakuna idhini otomatiki.",
};

export function shopLang(pref: PreferredLanguage | ""): "en" | "sw" {
  return pref === "english" ? "en" : "sw";
}

export function shopT(
  pref: PreferredLanguage | "",
  key: keyof typeof EN,
): string {
  const table = shopLang(pref) === "en" ? EN : SW;
  return table[key];
}

export function shopTf(
  pref: PreferredLanguage | "",
  key: keyof typeof EN,
  vars: Record<string, string | number>,
): string {
  let out = shopT(pref, key);
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}

export function stepTitleI18n(
  step: number,
  pref: PreferredLanguage | "",
): string {
  const keys = [
    "title1",
    "title2",
    "title3",
    "title4",
    "title5",
    "title6",
  ] as const;
  return shopT(pref, keys[step - 1] ?? "title1");
}
