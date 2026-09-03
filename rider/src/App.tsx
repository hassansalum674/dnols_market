import { lazy } from "react";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AuthProvider } from "./store/auth";
import { I18nProvider } from "./store/i18n";
import { InstallAppPrompt } from "./components/InstallApp";

const DeliveriesPage = lazy(() =>
  import("./pages/Deliveries").then((m) => ({ default: m.DeliveriesPage })),
);
const ActiveDeliveryPage = lazy(() =>
  import("./pages/ActiveDelivery").then((m) => ({
    default: m.ActiveDeliveryPage,
  })),
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DeliveriesPage /> },
      { path: "delivery/:orderId", element: <ActiveDeliveryPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <InstallAppPrompt />
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nProvider>
  );
}
