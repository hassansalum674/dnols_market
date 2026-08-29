import { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { CartProvider } from "./store/cart";
import { paths } from "./lib/paths";
import { LandingPage, MarketingNotFoundPage } from "./pages/Landing";
import { ServerErrorPage } from "./pages/errors";

const HomePage = lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.HomePage })),
);
const SearchPage = lazy(() =>
  import("./pages/Search").then((m) => ({ default: m.SearchPage })),
);
const CategoriesPage = lazy(() =>
  import("./pages/Categories").then((m) => ({ default: m.CategoriesPage })),
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

/** Old PWA paths (`/cart`, `/product/:id`, …) → `/app…` */
function RedirectToApp() {
  const loc = useLocation();
  return <Navigate to={`${paths.home}${loc.pathname}${loc.search}${loc.hash}`} replace />;
}

function Root() {
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ServerErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        element: <AppLayout />,
        children: [
          { path: "app", element: <HomePage /> },
          { path: "app/search", element: <SearchPage /> },
          { path: "app/categories", element: <CategoriesPage /> },
          { path: "app/product/:id", element: <ProductPage /> },
          { path: "app/cart", element: <CartPage /> },
          { path: "app/checkout", element: <CheckoutPage /> },
          { path: "app/orders", element: <OrdersPage /> },
          { path: "app/you", element: <YouPage /> },
          { path: "app/*", element: <NotFoundPage /> },
        ],
      },
      { path: "search", element: <RedirectToApp /> },
      { path: "categories", element: <RedirectToApp /> },
      { path: "product/:id", element: <RedirectToApp /> },
      { path: "cart", element: <RedirectToApp /> },
      { path: "checkout", element: <RedirectToApp /> },
      { path: "orders", element: <RedirectToApp /> },
      { path: "you", element: <RedirectToApp /> },
      { path: "*", element: <MarketingNotFoundPage /> },
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
