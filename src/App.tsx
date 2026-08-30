import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { CartProvider } from "./store/cart";
import { CheckoutSheetProvider } from "./store/checkoutSheet";
import { AuthProvider } from "./store/auth";
import { ServerErrorPage } from "./pages/errors";

const HomePage = lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.HomePage })),
);
const SearchPage = lazy(() =>
  import("./pages/Search").then((m) => ({ default: m.SearchPage })),
);
const ProductPage = lazy(() =>
  import("./pages/Product").then((m) => ({ default: m.ProductPage })),
);
const CartPage = lazy(() =>
  import("./pages/Cart").then((m) => ({ default: m.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("./pages/Checkout").then((m) => ({ default: m.CheckoutPage })),
);
const OrdersPage = lazy(() =>
  import("./pages/Orders").then((m) => ({ default: m.OrdersPage })),
);
const YouPage = lazy(() =>
  import("./pages/You").then((m) => ({ default: m.YouPage })),
);
const SettingsPage = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.SettingsPage })),
);
const SignInPage = lazy(() =>
  import("./pages/SignIn").then((m) => ({ default: m.SignInPage })),
);
const TermsPage = lazy(() =>
  import("./pages/Terms").then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/Privacy").then((m) => ({ default: m.PrivacyPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFoundPage })),
);
const ShopLayout = lazy(() =>
  import("./pages/shop").then((m) => ({ default: m.ShopLayout })),
);
const ShopToday = lazy(() =>
  import("./pages/shop").then((m) => ({ default: m.ShopToday })),
);
const ShopStock = lazy(() =>
  import("./pages/shop").then((m) => ({ default: m.ShopStock })),
);
const ShopOrders = lazy(() =>
  import("./pages/shop").then((m) => ({ default: m.ShopOrders })),
);
const ShopProfile = lazy(() =>
  import("./pages/shop").then((m) => ({ default: m.ShopProfile })),
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "product/:id", element: <ProductPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "you", element: <YouPage /> },
      { path: "you/settings", element: <SettingsPage /> },
      { path: "signin", element: <SignInPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      {
        path: "shop",
        element: <ShopLayout />,
        children: [
          { index: true, element: <ShopToday /> },
          { path: "stock", element: <ShopStock /> },
          { path: "orders", element: <ShopOrders /> },
          { path: "profile", element: <ShopProfile /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CheckoutSheetProvider>
          <RouterProvider router={router} />
        </CheckoutSheetProvider>
      </CartProvider>
    </AuthProvider>
  );
}
