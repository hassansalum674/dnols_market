export type AppLanguage = "en" | "sw";

const EN = {
  english: "English",
  swahili: "Kiswahili",
  chooseLanguage: "Choose your language",
  languageHint:
    "English or Kiswahili. You can change this anytime in Settings.",
  stepOf: "Step {current} of {total}",
  saved: "Saved",
  back: "Back",
  continue: "Continue",
  myAccount: "My Account",
  yourBuyerProfile: "Your buyer profile",
  signInThenSetup:
    "Sign in or create an account, then add a photo and phone number. After you sign in you get your own Dnols ID.",
  signInTitle: "Sign in or create an account",
  signInSubtitle:
    "Use Google or email. Then you can add a photo, a phone number, and see your Dnols ID.",
  continueGoogle: "Continue with Google",
  signingIn: "Signing in…",
  orUseEmail: "or use email",
  signIn: "Sign in",
  createAccount: "Create account",
  fullName: "Full name",
  email: "Email",
  password: "Password",
  forgotPassword: "Forgot password?",
  backToSignIn: "Back to sign in",
  sendReset: "Send reset link",
  signInEmail: "Sign in with email",
  pleaseWait: "Please wait…",
  enterEmail: "Enter your email.",
  passwordMin: "Password must be at least 6 characters.",
  resetSent: "Password reset email sent. Check your inbox.",
  addPhoto: "Add a profile photo",
  photoHint:
    "Take a photo with the camera or pick one from your gallery. If you skip this, we show a coloured letter avatar instead.",
  profilePhoto: "Profile photo",
  camera: "Camera",
  gallery: "Gallery",
  changePhoto: "Change photo",
  remove: "Remove",
  photoError: "Could not save that photo.",
  nameAndPhone: "Your name and phone",
  stallsMayUse:
    "Stalls may use your name and number after you pay — for pickup at Kariakoo or delivery to your location.",
  mobileNumber: "Mobile number",
  phoneInvalid: "Enter a Tanzania mobile number.",
  nameShort: "Enter your name (at least 2 letters).",
  usedAtCheckout: "Used at checkout for mobile money and delivery.",
  saveProfile: "Save profile",
  saving: "Saving…",
  saveFailed: "Could not save your profile.",
  signedInAs: "Signed in as",
  differentAccount: "Sign in with a different account",
  yourId: "Dnols ID",
  idHint:
    "This ID is yours alone. A stall may ask for it at pickup. It is created when you sign in — nobody else has the same one.",
  copyId: "Copy ID",
  copied: "Copied",
  editProfile: "Edit my profile",
  signOut: "Sign out",
  settings: "Settings",
  appearance: "Appearance",
  language: "Language",
  theme: "Theme",
  textSize: "Text size",
  light: "Light",
  dark: "Dark",
  system: "System",
  normal: "Normal",
  large: "Large",
  account: "Account",
  legal: "Legal",
  loading: "Loading…",
  becomeASeller: "Become a seller",
  sameAccountHint:
    "One account is both buyer and seller. Sign in on the seller site with the same Google or email you use here.",
};

const SW: typeof EN = {
  english: "English",
  swahili: "Kiswahili",
  chooseLanguage: "Chagua lugha",
  languageHint:
    "English au Kiswahili. Unaweza kubadilisha baadaye kwenye Mipangilio.",
  stepOf: "Hatua {current} kati ya {total}",
  saved: "Imehifadhiwa",
  back: "Rudi",
  continue: "Endelea",
  myAccount: "Akaunti yangu",
  yourBuyerProfile: "Akaunti yako ya mnunuzi",
  signInThenSetup:
    "Ingia au fungua akaunti, kisha weka picha na namba ya simu. Baada ya kuingia unapata kitambulisho chako cha Dnols.",
  signInTitle: "Ingia au fungua akaunti",
  signInSubtitle:
    "Tumia Google au barua pepe. Kisha unaweza kuweka picha, namba ya simu, na kuona kitambulisho chako.",
  continueGoogle: "Endelea na Google",
  signingIn: "Inaingia…",
  orUseEmail: "au tumia barua pepe",
  signIn: "Ingia",
  createAccount: "Fungua akaunti",
  fullName: "Jina kamili",
  email: "Barua pepe",
  password: "Nenosiri",
  forgotPassword: "Umesahau nenosiri?",
  backToSignIn: "Rudi kuingia",
  sendReset: "Tuma kiungo cha kuweka upya",
  signInEmail: "Ingia kwa barua pepe",
  pleaseWait: "Subiri…",
  enterEmail: "Andika barua pepe yako.",
  passwordMin: "Nenosiri liwe na herufi 6 au zaidi.",
  resetSent: "Tumekutumia barua pepe ya kuweka nenosiri upya.",
  addPhoto: "Weka picha ya akaunti",
  photoHint:
    "Piga picha kwa kamera au chagua kwenye galeria. Ukiruka, tutaonyesha herufi yako ya kwanza.",
  profilePhoto: "Picha ya akaunti",
  camera: "Kamera",
  gallery: "Galeria",
  changePhoto: "Badilisha picha",
  remove: "Ondoa",
  photoError: "Picha haikuweza kuhifadhiwa.",
  nameAndPhone: "Jina na simu",
  stallsMayUse:
    "Baada ya kulipa, duka linaweza kutumia jina na namba yako — kuchukua Kariakoo au kufikishwa.",
  mobileNumber: "Namba ya simu",
  phoneInvalid: "Andika namba ya simu ya Tanzania.",
  nameShort: "Andika jina lako (herufi 2 au zaidi).",
  usedAtCheckout: "Inatumika kulipia na kujifungulia bidhaa.",
  saveProfile: "Hifadhi akaunti",
  saving: "Inahifadhi…",
  saveFailed: "Akaunti haikuweza kuhifadhiwa.",
  signedInAs: "Umeingia kama",
  differentAccount: "Ingia kwa akaunti nyingine",
  yourId: "Kitambulisho cha Dnols",
  idHint:
    "Hiki ni kitambulisho chako peke yako. Duka linaweza kukitaka unapochukua bidhaa. Kinatolewa unapojiunga — hakuna mtu mwingine mwenye kile kile.",
  copyId: "Nakili kitambulisho",
  copied: "Imenakiliwa",
  editProfile: "Hariri akaunti",
  signOut: "Toka",
  settings: "Mipangilio",
  appearance: "Muonekano",
  language: "Lugha",
  theme: "Mandhari",
  textSize: "Ukubwa wa maandishi",
  light: "Nyeupe",
  dark: "Giza",
  system: "Mfumo",
  normal: "Kawaida",
  large: "Kubwa",
  account: "Akaunti",
  legal: "Sheria",
  loading: "Inapakia…",
  becomeASeller: "Kuwa muuzaji",
  sameAccountHint:
    "Akaunti moja ni ya mnunuzi na muuzaji. Ingia kwenye tovuti ya kuuza kwa Google au barua pepe ile ile unayotumia hapa.",
};

export const I18N = { en: EN, sw: SW } as const;
export type Msg = keyof typeof EN;

export function translate(lang: AppLanguage, key: Msg): string {
  return I18N[lang][key] ?? I18N.en[key];
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
