import { Navigate } from "react-router-dom";
import { DASHBOARD_PATH } from "../lib/shopRoutes";

export function DashboardRedirect() {
  return <Navigate to={DASHBOARD_PATH} replace />;
}
