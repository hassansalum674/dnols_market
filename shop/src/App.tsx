import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { ServerErrorPage } from "./pages/errors";

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

/** Seller routes for the root Vite (`path: "shop"` under `/`). */
export const shopRoute = {
  path: "shop",
  element: <AppLayout />,
  errorElement: <ServerErrorPage />,
  children: [
    { index: true, element: <TodayPage /> },
    { path: "stock", element: <StockPage /> },
    { path: "orders", element: <OrdersPage /> },
    { path: "profile", element: <ShopPage /> },
    { path: "*", element: <NotFoundPage /> },
  ],
};

/** Leftover package entry. Do not start this Vite — root `npm run dev` serves `/shop`. */
export default function App() {
  return (
    <RouterProvider
      router={createBrowserRouter([{ ...shopRoute, path: "/" }], {
        basename: "/shop",
      })}
    />
  );
}
