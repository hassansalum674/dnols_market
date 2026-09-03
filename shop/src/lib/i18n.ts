import type { PreferredLanguage } from "../types";

export type AppLanguage = "en" | "sw";

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
  becomeASeller: "Become a seller",
  signIn: "Sign in",
  loading: "Loading…",
  splashMotto: "Pickups and deliveries",
  myShop: "My shop",
  sellHeroTitle: "Sell from Kariakoo",
  sellHeroSub:
    "List your stall on Dnols. Buyers pay upfront, pick up in person, and you get paid after handover.",
  sellBrief:
    "We verify every shop — you will need your NIDA or passport, stall location in Kariakoo, and a mobile money payout number. Review usually takes up to 24 hours.",
  sellDraftHint:
    "Your draft saves automatically if you leave. Use the same Google or email as on dnols.com — one account is both buyer and seller.",
  sameAccountHint:
    "One Dnols account is both buyer and seller. Sign in with the same Google or email you use on dnols.com.",
  alreadySeller: "Already a seller?",
  start: "Start",
  goToShop: "Go to your shop",
  viewApplication: "View application",
  resubmit: "Resubmit",
  sellerSignIn: "Sign in",
  sellerSignInSub:
    "Use the same Google or email you use on dnols.com. You can also continue with the phone number you registered with.",
  signedInTakingYou: "Signed in — taking you to your shop…",
  browseAsBuyer: "Browse as buyer",
  switchToShopping: "Switch to shopping on dnols.com",
  sellerPortal: "Seller portal",
  signedInAs: "Signed in as",
  continueGoogle: "Continue with Google",
  signingIn: "Signing in…",
  orUseEmail: "or use email",
  createAccount: "Create account",
  fullName: "Full name",
  email: "Email",
  password: "Password",
  passwordHint: "At least 6 characters",
  forgotPassword: "Forgot password?",
  backToSignIn: "Back to sign in",
  sendReset: "Send reset link",
  signInEmail: "Sign in with email",
  pleaseWait: "Please wait…",
  enterEmail: "Enter your email.",
  passwordMin: "Password must be at least 6 characters.",
  resetSent: "Password reset email sent. Check your inbox.",
  orUsePhone: "or use phone",
  phoneNumber: "Phone number",
  continuePhone: "Continue with phone",
  newSeller: "New seller?",
  startOnboarding: "Start onboarding",
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
  becomeASeller: "Kuwa muuzaji",
  signIn: "Ingia",
  loading: "Inapakia…",
  splashMotto: "Kuchukua na kupeleka",
  myShop: "Duka langu",
  sellHeroTitle: "Uza kutoka Kariakoo",
  sellHeroSub:
    "Orodhesha duka lako kwenye Dnols. Wanunuzi hulipa kwanza, wanachukua wenyewe, na unalipwa baada ya kukabidhi.",
  sellBrief:
    "Tunathibitisha kila duka — utahitaji NIDA au pasipoti, mahali pa duka Kariakoo, na namba ya malipo ya simu. Ukaguzi mara nyingi huchukua hadi saa 24.",
  sellDraftHint:
    "Rasimu inahifadhiwa otomatiki ukiondoka. Tumia Google au barua pepe ile ile ya dnols.com — akaunti moja ni ya mnunuzi na muuzaji.",
  sameAccountHint:
    "Akaunti moja ya Dnols ni ya mnunuzi na muuzaji. Ingia kwa Google au barua pepe ile ile unayotumia kwenye dnols.com.",
  alreadySeller: "Tayari wewe ni muuzaji?",
  start: "Anza",
  goToShop: "Nenda dukani",
  viewApplication: "Tazama ombi",
  resubmit: "Tuma tena",
  sellerSignIn: "Ingia",
  sellerSignInSub:
    "Tumia Google au barua pepe ile ile ya dnols.com. Unaweza pia kuendelea na namba ya simu uliyosajili.",
  signedInTakingYou: "Umeingia — tunakupeleka dukani…",
  browseAsBuyer: "Nunua kama mnunuzi",
  switchToShopping: "Rudi kununua kwenye dnols.com",
  sellerPortal: "Dirisha la muuzaji",
  signedInAs: "Umeingia kama",
  continueGoogle: "Endelea na Google",
  signingIn: "Inaingia…",
  orUseEmail: "au tumia barua pepe",
  createAccount: "Fungua akaunti",
  fullName: "Jina kamili",
  email: "Barua pepe",
  password: "Nenosiri",
  passwordHint: "Herufi 6 au zaidi",
  forgotPassword: "Umesahau nenosiri?",
  backToSignIn: "Rudi kuingia",
  sendReset: "Tuma kiungo cha kuweka upya",
  signInEmail: "Ingia kwa barua pepe",
  pleaseWait: "Subiri…",
  enterEmail: "Andika barua pepe yako.",
  passwordMin: "Nenosiri liwe na herufi 6 au zaidi.",
  resetSent: "Tumekutumia barua pepe ya kuweka nenosiri upya.",
  orUsePhone: "au tumia simu",
  phoneNumber: "Namba ya simu",
  continuePhone: "Endelea na simu",
  newSeller: "Muuzaji mpya?",
  startOnboarding: "Anza usajili",
};

export type ShopMsg = keyof typeof EN;

export function shopLang(pref: PreferredLanguage | ""): AppLanguage {
  return pref === "english" ? "en" : "sw";
}

export function translate(lang: AppLanguage, key: ShopMsg): string {
  return (lang === "sw" ? SW : EN)[key];
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}

export function shopT(
  pref: PreferredLanguage | "",
  key: ShopMsg,
): string {
  return translate(shopLang(pref), key);
}

export function shopTf(
  pref: PreferredLanguage | "",
  key: ShopMsg,
  vars: Record<string, string | number>,
): string {
  return interpolate(shopT(pref, key), vars);
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
