import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCheckoutSheet } from "../store/checkoutSheet";
import type { PayMethod } from "../lib/checkout";

/** Deep link: /checkout?method=mpesa opens the bottom sheet. */
export function CheckoutPage() {
  const { openPay, openBasket } = useCheckoutSheet();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const method = params.get("method") as PayMethod | null;

  useEffect(() => {
    if (method === "mpesa" || method === "tigo" || method === "airtel") {
      openPay(method);
    } else {
      openBasket();
    }
    nav("/", { replace: true });
  }, [method, openPay, openBasket, nav]);

  return null;
}
