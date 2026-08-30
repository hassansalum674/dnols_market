import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckoutSheet } from "../store/checkoutSheet";

/** Deep link: /cart opens the basket bottom sheet. */
export function CartPage() {
  const { openBasket } = useCheckoutSheet();
  const nav = useNavigate();

  useEffect(() => {
    openBasket();
    nav("/", { replace: true });
  }, [openBasket, nav]);

  return null;
}
