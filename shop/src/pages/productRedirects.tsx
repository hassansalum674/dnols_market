import { Navigate, useParams } from "react-router-dom";
import { productEditPath } from "../lib/productRoutes";

export function RedirectLegacyProductNew() {
  return <Navigate to="/stall/products/new" replace />;
}

export function RedirectLegacyProductEdit() {
  const { id = "" } = useParams();
  return <Navigate to={productEditPath(id)} replace />;
}
