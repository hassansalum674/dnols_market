import { FLOORS } from "../types";
import type { OnboardingDraft } from "../types";

export function formatStallAddress(step2: OnboardingDraft["step2"]): string {
  const floor = FLOORS.find((f) => f.id === step2.floor)?.label;
  const parts = [
    step2.stallNumber.trim() ? `Stall ${step2.stallNumber.trim()}` : "",
    step2.street.trim(),
    floor ? `${floor} floor` : "",
    step2.blockName.trim(),
    step2.landmark.trim(),
    "Kariakoo",
  ].filter(Boolean);
  return parts.join(", ");
}
