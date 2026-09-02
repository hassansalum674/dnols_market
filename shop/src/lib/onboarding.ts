import type { OnboardingDraft } from "../types";
import {
  isValidTzPhone,
  validateMobileMoneyNumber,
  validateNida,
} from "./validation";

export const TOTAL_STEPS = 6;

export function emptyDraft(): OnboardingDraft {
  return {
    currentStep: 1,
    step1: {
      shopName: "",
      categories: [],
      profilePhoto: null,
      description: "",
    },
    step2: {
      street: "",
      stallNumber: "",
      floor: "",
      blockName: "",
      landmark: "",
    },
    step3: {
      primaryPhone: "",
      whatsappSame: true,
      whatsappPhone: "",
      language: "english",
    },
    step4: {
      legalName: "",
      nidaNumber: "",
      idFront: null,
      idBack: null,
      selfieWithId: null,
    },
    step5: {
      provider: "",
      mobileMoneyNumber: "",
      accountName: "",
    },
    step6: {
      openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
      openingTime: "08:00",
      closingTime: "18:00",
      closedOnHolidays: true,
    },
    submittedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export function stepTitle(step: number): string {
  const titles = [
    "Shop Identity",
    "Location in Kariakoo",
    "Contact",
    "Owner Identity & Trust",
    "Payout",
    "Shop Hours",
  ];
  return titles[step - 1] ?? "";
}

export function validateStep(draft: OnboardingDraft, step: number): string | null {
  switch (step) {
    case 1: {
      if (!draft.step1.shopName.trim()) return "Shop name is required.";
      if (draft.step1.categories.length === 0) return "Pick at least one category.";
      if (draft.step1.categories.length > 2) return "Maximum 2 categories.";
      if (!draft.step1.profilePhoto) return "Shop profile photo is required.";
      if (draft.step1.description.length > 120)
        return "Description must be 120 characters or less.";
      return null;
    }
    case 2: {
      if (!draft.step2.street.trim()) return "Street / lane name is required.";
      if (!draft.step2.stallNumber.trim()) return "Stall or shop number is required.";
      if (!draft.step2.floor) return "Floor is required.";
      if (draft.step2.landmark.length > 80)
        return "Landmark hint must be 80 characters or less.";
      return null;
    }
    case 3: {
      if (!isValidTzPhone(draft.step3.primaryPhone))
        return "Enter a valid +255 phone number.";
      if (
        !draft.step3.whatsappSame &&
        !isValidTzPhone(draft.step3.whatsappPhone)
      )
        return "Enter a valid WhatsApp number.";
      return null;
    }
    case 4: {
      if (!draft.step4.legalName.trim()) return "Full legal name is required.";
      if (!validateNida(draft.step4.nidaNumber))
        return "NIDA number must be exactly 20 digits.";
      if (!draft.step4.idFront) return "ID photo (front) is required.";
      if (!draft.step4.idBack) return "ID photo (back) is required.";
      if (!draft.step4.selfieWithId) return "Selfie holding ID is required.";
      return null;
    }
    case 5: {
      if (!draft.step5.provider) return "Select a mobile money provider.";
      if (
        !validateMobileMoneyNumber(
          draft.step5.mobileMoneyNumber,
          draft.step5.provider,
        )
      )
        return "Mobile money number doesn't match the selected provider.";
      if (!draft.step5.accountName.trim()) return "Account name is required.";
      if (
        draft.step5.accountName.trim().toLowerCase() !==
        draft.step4.legalName.trim().toLowerCase()
      )
        return "Account name must match your legal name on ID.";
      return null;
    }
    case 6: {
      if (draft.step6.openDays.length === 0) return "Select at least one open day.";
      return null;
    }
    default:
      return null;
  }
}
