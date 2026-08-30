import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PayMethod } from "../lib/checkout";
import type { Order } from "../types";

export type CheckoutSheetStep = "closed" | "basket" | "pay" | "waiting" | "success";

type CheckoutSheetState = {
  step: CheckoutSheetStep;
  method: PayMethod;
  order: Order | null;
  openBasket: () => void;
  openPay: (method: PayMethod) => void;
  goBack: () => void;
  close: () => void;
  setStep: (step: CheckoutSheetStep) => void;
  setMethod: (method: PayMethod) => void;
  setOrder: (order: Order | null) => void;
};

const Ctx = createContext<CheckoutSheetState | null>(null);

export function CheckoutSheetProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<CheckoutSheetStep>("closed");
  const [method, setMethod] = useState<PayMethod>("mpesa");
  const [order, setOrder] = useState<Order | null>(null);

  const close = useCallback(() => {
    setStep("closed");
    setOrder(null);
  }, []);

  const openBasket = useCallback(() => {
    setOrder(null);
    setStep("basket");
  }, []);

  const openPay = useCallback((m: PayMethod) => {
    setMethod(m);
    setOrder(null);
    setStep("pay");
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => {
      if (s === "pay") return "basket";
      if (s === "basket") return "closed";
      return s;
    });
  }, []);

  const value = useMemo(
    () => ({
      step,
      method,
      order,
      openBasket,
      openPay,
      goBack,
      close,
      setStep,
      setMethod,
      setOrder,
    }),
    [step, method, order, openBasket, openPay, goBack, close],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCheckoutSheet(): CheckoutSheetState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("CheckoutSheetProvider missing");
  return ctx;
}
