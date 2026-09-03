export const DESC_MAX = 280;

export type AssistLang = "en" | "sw";

export type DescribeDraft = {
  notes: string;
  name: string;
  category: string;
  condition: string;
  variants: string[];
  language: AssistLang;
};

export type DescribeQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

type BankQ = {
  id: string;
  skipIf: string[];
  en: { prompt: string; options: string[] };
  sw: { prompt: string; options: string[] };
};

const FASHION: BankQ[] = [
  {
    id: "who",
    skipIf: ["women", "wanawake", "men", "wanaume", "kids", "watoto", "unisex"],
    en: {
      prompt: "Who is it for?",
      options: ["Women", "Men", "Kids", "Unisex"],
    },
    sw: {
      prompt: "Ni kwa nani?",
      options: ["Wanawake", "Wanaume", "Watoto", "Wote"],
    },
  },
  {
    id: "fabric",
    skipIf: [
      "kitenge",
      "khanga",
      "ankara",
      "cotton",
      "pamba",
      "denim",
      "leather",
      "ngozi",
      "polyester",
    ],
    en: {
      prompt: "What is the fabric?",
      options: ["Kitenge", "Khanga", "Cotton", "Denim", "Mixed"],
    },
    sw: {
      prompt: "Nguo ni ya nini?",
      options: ["Kitenge", "Khanga", "Pamba", "Denim", "Mchanganyiko"],
    },
  },
  {
    id: "fit",
    skipIf: ["slim", "regular", "loose", "stretch", "fitted"],
    en: {
      prompt: "How does it fit?",
      options: ["Slim", "Regular", "Loose", "Stretch"],
    },
    sw: {
      prompt: "Inafaa vipi?",
      options: ["Nyembamba", "Wastani", "Pana", "Inanyooshwa"],
    },
  },
];

const PHONES: BankQ[] = [
  {
    id: "included",
    skipIf: ["box", "charger", "earbud", "headset"],
    en: {
      prompt: "What is included?",
      options: ["Phone only", "Phone + box", "Phone + charger", "Full set"],
    },
    sw: {
      prompt: "Kinachokuja nacho?",
      options: ["Simu tu", "Simu + boksi", "Simu + chaja", "Seti kamili"],
    },
  },
  {
    id: "battery",
    skipIf: ["battery", "betri"],
    en: {
      prompt: "How is the battery?",
      options: ["Strong", "Average", "Buyer should check"],
    },
    sw: {
      prompt: "Betri iko vipi?",
      options: ["Nzuri", "Wastani", "Mnunuzi akague"],
    },
  },
  {
    id: "looks",
    skipIf: ["scratch", "clean", "mark"],
    en: {
      prompt: "How does it look?",
      options: ["Clean", "Light marks", "Visible wear"],
    },
    sw: {
      prompt: "Inaonekana vipi?",
      options: ["Safi", "Alama ndogo", "Imechakaa kidogo"],
    },
  },
];

const GADGETS: BankQ[] = [
  {
    id: "power",
    skipIf: ["usb", "battery", "solar", "mains"],
    en: {
      prompt: "How does it power?",
      options: ["USB", "Mains", "Battery", "Solar"],
    },
    sw: {
      prompt: "Inatumia umeme gani?",
      options: ["USB", "Umeme wa nyumbani", "Betri", "Jua"],
    },
  },
  {
    id: "use",
    skipIf: ["home", "shop", "travel", "office"],
    en: {
      prompt: "Where is it used?",
      options: ["Home", "Shop", "Travel", "Office"],
    },
    sw: {
      prompt: "Inatumika wapi?",
      options: ["Nyumbani", "Dukani", "Safarini", "Ofisini"],
    },
  },
  {
    id: "looks",
    skipIf: ["new", "scratch", "clean"],
    en: {
      prompt: "How does it look?",
      options: ["Like new", "Light use", "Visible wear"],
    },
    sw: {
      prompt: "Inaonekana vipi?",
      options: ["Kama mpya", "Imetumika kidogo", "Imechakaa kidogo"],
    },
  },
];

const FABRIC: BankQ[] = [
  {
    id: "fabric",
    skipIf: ["kitenge", "khanga", "ankara", "cotton", "pamba"],
    en: {
      prompt: "What fabric is this?",
      options: ["Kitenge", "Khanga", "Ankara", "Cotton", "Mixed"],
    },
    sw: {
      prompt: "Nguo ni ya nini?",
      options: ["Kitenge", "Khanga", "Ankara", "Pamba", "Mchanganyiko"],
    },
  },
  {
    id: "length",
    skipIf: ["meter", "yard", "mita"],
    en: {
      prompt: "How is it sold?",
      options: ["Per metre", "Full piece", "Cut to size"],
    },
    sw: {
      prompt: "Inauzwa vipi?",
      options: ["Kwa mita", "Kipande kizima", "Unakata unavyotaka"],
    },
  },
  {
    id: "use",
    skipIf: ["dress", "shirt", "wrapper", "gift"],
    en: {
      prompt: "What is it for?",
      options: ["Dressmaking", "Wrapper", "Gift", "Everyday wear"],
    },
    sw: {
      prompt: "Inatumika nini?",
      options: ["Kushona gauni", "Kuingia", "Zawadi", "Mavazi ya kila siku"],
    },
  },
];

function haystack(draft: DescribeDraft): string {
  return `${draft.notes} ${draft.name}`.toLowerCase();
}

function bankFor(category: string): BankQ[] {
  if (category === "phones_accessories") return PHONES;
  if (category === "electronics_gadgets") return GADGETS;
  if (category === "fabrics_textiles") return FABRIC;
  return FASHION;
}

export function pickQuestions(draft: DescribeDraft): DescribeQuestion[] {
  const text = haystack(draft);
  const lang = draft.language;
  const out: DescribeQuestion[] = [];
  for (const q of bankFor(draft.category)) {
    if (q.skipIf.some((k) => text.includes(k))) continue;
    const loc = lang === "sw" ? q.sw : q.en;
    out.push({ id: q.id, prompt: loc.prompt, options: loc.options });
    if (out.length === 3) break;
  }
  return out;
}

function conditionLine(condition: string, lang: AssistLang): string {
  const en: Record<string, string> = {
    new: "Brand new",
    used_good: "Used, good condition",
    used_fair: "Used, fair condition",
    refurbished: "Refurbished",
  };
  const sw: Record<string, string> = {
    new: "Mpya",
    used_good: "Imetumika, hali nzuri",
    used_fair: "Imetumika, hali ya wastani",
    refurbished: "Imerekebishwa",
  };
  return (lang === "sw" ? sw : en)[condition] ?? "";
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trim()}…`;
}

function uniqueBits(parts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const bit = p.replace(/\s+/g, " ").trim();
    if (!bit) continue;
    const key = bit.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(bit);
  }
  return out;
}

export function writeDescription(
  draft: DescribeDraft,
  answers: Record<string, string>,
): string {
  const lang = draft.language;
  const notes = draft.notes.replace(/\s+/g, " ").trim();
  const name = draft.name.replace(/\s+/g, " ").trim();
  const title = name || notes;
  const extra =
    notes && name && !name.toLowerCase().includes(notes.toLowerCase())
      ? notes
      : "";
  const chosen = Object.values(answers)
    .map((v) => v.trim())
    .filter(Boolean);
  const sizes = draft.variants.filter(Boolean).join(", ");
  const cond = conditionLine(draft.condition, lang);

  if (lang === "sw") {
    const mid = uniqueBits([extra, ...chosen]).join(", ");
    const bits = uniqueBits([
      title,
      mid,
      cond,
      sizes ? `Vipimo ${sizes}` : "",
      "Chukua Kariakoo au upelekewe baada ya kulipa.",
    ]);
    return clip(bits.join(". ").replace(/\.\./g, "."), DESC_MAX);
  }

  const mid = uniqueBits([extra, ...chosen]).join(", ");
  const bits = uniqueBits([
    title,
    mid,
    cond,
    sizes ? `Sizes ${sizes}` : "",
    "Pickup in Kariakoo or delivery after payment.",
  ]);
  return clip(bits.join(". ").replace(/\.\./g, "."), DESC_MAX);
}
