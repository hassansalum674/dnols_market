import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AppErrorPage, ServerErrorPage } from "./pages/errors";
import {
  RedirectLegacyProductEdit,
  RedirectLegacyProductNew,
} from "./pages/productRedirects";
import { ShopProvider } from "./shopData";
import { AuthProvider } from "./store/auth";
import { InstallAppPrompt } from "./components/InstallApp";

const SellLandingPage = lazy(() =>
  import("./pages/SellLanding").then((m) => ({ default: m.SellLandingPage })),
);
const SignInPage = lazy(() =>
  import("./pages/SignIn").then((m) => ({ default: m.SignInPage })),
);
const OnboardingPage = lazy(() =>
  import("./pages/Onboarding").then((m) => ({ default: m.OnboardingPage })),
);
const PendingReviewPage = lazy(() =>
  import("./pages/PendingReview").then((m) => ({
    default: m.PendingReviewPage,
  })),
);
const RejectedPage = lazy(() =>
  import("./pages/Rejected").then((m) => ({ default: m.RejectedPage })),
);
const DemoApprovePage = lazy(() =>
  import("./pages/Rejected").then((m) => ({ default: m.DemoApprovePage })),
);
const DemoRejectPage = lazy(() =>
  import("./pages/Rejected").then((m) => ({ default: m.DemoRejectPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.DashboardPage })),
);
const DashboardRedirect = lazy(() =>
  import("./pages/DashboardRedirect").then((m) => ({
    default: m.DashboardRedirect,
  })),
);
const ProductFormPage = lazy(() =>
  import("./pages/ProductForm").then((m) => ({ default: m.ProductFormPage })),
);
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <SellLandingPage />,
    errorElement: <AppErrorPage />,
  },
  { path: "/signin", element: <SignInPage />, errorElement: <AppErrorPage /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/onboarding/:step", element: <OnboardingPage /> },
  { path: "/pending", element: <PendingReviewPage /> },
  { path: "/rejected", element: <RejectedPage /> },
  { path: "/demo/approve", element: <DemoApprovePage /> },
  { path: "/demo/reject", element: <DemoRejectPage /> },
  { path: "/dashboard", element: <DashboardRedirect /> },
  { path: "/products/new", element: <RedirectLegacyProductNew /> },
  { path: "/products/:id/edit", element: <RedirectLegacyProductEdit /> },
  {
    path: "/stall",
    element: <AppLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "stock", element: <StockPage /> },
      { path: "products/new", element: <ProductFormPage /> },
      { path: "products/:id/edit", element: <ProductFormPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  /* Legacy routes — redirect to stall paths */
  {
    path: "/today",
    element: <AppLayout />,
    children: [{ index: true, element: <TodayPage /> }],
  },
  {
    path: "/stock",
    element: <AppLayout />,
    children: [{ index: true, element: <StockPage /> }],
  },
  {
    path: "/orders",
    element: <AppLayout />,
    children: [{ index: true, element: <OrdersPage /> }],
  },
  {
    path: "/shop",
    element: <AppLayout />,
    children: [{ index: true, element: <ShopPage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <InstallAppPrompt />
        <RouterProvider router={router} />
      </ShopProvider>
    </AuthProvider>
  );
}
