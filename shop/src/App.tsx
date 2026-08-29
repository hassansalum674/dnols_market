import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { ServerErrorPage } from "./pages/errors";
import { ShopProvider } from "./shopData";

const TodayPage = lazy(() =>
  import("./pages/Today").then((m) => ({ default: m.TodayPage })),
);
const StockPage = lazy(() =>
  import("./pages/Stock").then((m) => ({ default: m.StockPage })),
);
const OrdersPage = lazy(() =>
  import("./pages/Orders").then((m) => ({ default: m.OrdersPage })),
);
const ShopPage = lazy(() =>
  import("./pages/Shop").then((m) => ({ default: m.ShopPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFoundPage })),
);

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ServerErrorPage />,
      children: [
        { index: true, element: <TodayPage /> },
        { path: "stock", element: <StockPage /> },
        { path: "orders", element: <OrdersPage /> },
        { path: "profile", element: <ShopPage /> },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: "/shop" },
);

export default function App() {
  return (
    <ShopProvider>
      <RouterProvider router={router} />
    </ShopProvider>
  );
}
