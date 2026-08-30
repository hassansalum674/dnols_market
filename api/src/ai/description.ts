import { generateJsonText, textProviderConfigured } from "./providers.js";

export type DescriptionLanguage = "en" | "sw";

export type DescriptionAction = "write" | "improve" | "questions";

export type DescriptionInput = {
  action: DescriptionAction;
  language: DescriptionLanguage;
  productName: string;
  category: string;
  condition: string;
  draft?: string;
  voiceTranscript?: string;
  answers?: Record<string, string>;
};

export type DescriptionResult = {
  description?: string;
  questions?: string[];
  provider: string;
  language: DescriptionLanguage;
};

const MAX_CHARS = 200;

function templateDescription(input: DescriptionInput): string {
  const source = (
    input.voiceTranscript ||
    input.draft ||
    input.productName
  ).trim();
  const bits = [
    source,
    input.condition !== "new" ? input.condition.replace("_", " ") : "",
    input.category.replace(/_/g, " "),
  ].filter(Boolean);
  const text = bits.join(" · ");
  return text.slice(0, MAX_CHARS);
}

function templateQuestions(input: DescriptionInput): string[] {
  const qs = [
    "What material or build quality should buyers know?",
    "Any size, color, or variant details?",
    "What makes this item worth the price?",
  ];
  if (input.language === "sw") {
    return [
      "Bidhaa hii imetengenezwa kwa nini (nyenzo/ubora)?",
      "Kuna ukubwa, rangi, au aina gani?",
      "Kwa nini mnunuzi achague bidhaa hii?",
    ];
  }
  return qs;
}

export async function assistDescription(
  input: DescriptionInput,
): Promise<DescriptionResult> {
  if (!textProviderConfigured()) {
    if (input.action === "questions") {
      return {
        questions: templateQuestions(input),
        provider: "template",
        language: input.language,
      };
    }
    return {
      description: templateDescription(input),
      provider: "template",
      language: input.language,
    };
  }

  const langLabel = input.language === "sw" ? "Swahili" : "English";
  const context = [
    `Product name: ${input.productName}`,
    `Category: ${input.category}`,
    `Condition: ${input.condition}`,
    input.draft ? `Seller draft: ${input.draft}` : "",
    input.voiceTranscript ? `Voice transcript: ${input.voiceTranscript}` : "",
    input.answers
      ? `Extra details: ${Object.entries(input.answers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (input.action === "questions") {
    const { data, provider } = await generateJsonText(
      `You help Tanzanian marketplace sellers list products. Return JSON {"questions":["..."]} with 2-3 short follow-up questions in ${langLabel} to improve a listing description. Questions should ask for material, size, condition details, or unique selling points. No markdown.`,
      context,
    );
    const questions = Array.isArray(data.questions)
      ? (data.questions as string[])
      : templateQuestions(input);
    return {
      questions: questions.slice(0, 3),
      provider,
      language: input.language,
    };
  }

  const task =
    input.action === "improve"
      ? `Improve the seller's draft into a concise marketplace description in ${langLabel}.`
      : `Write a concise marketplace description in ${langLabel} from the seller's notes or voice transcript.`;

  const { data, provider } = await generateJsonText(
    `${task} Max ${MAX_CHARS} characters. Plain text only in the description field. Return JSON {"description":"..."}. Mention material, fit, or key selling points when known. Friendly tone for buyers in Dar es Salaam.`,
    context,
  );

  const description = (
    typeof data.description === "string"
      ? data.description
      : templateDescription(input)
  ).slice(0, MAX_CHARS);

  return {
    description,
    provider,
    language: input.language,
  };
}
