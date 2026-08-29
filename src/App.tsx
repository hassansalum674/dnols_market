import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { CartProvider } from "./store/cart";
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
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
