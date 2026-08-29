import { Outlet } from "react-router-dom";

export function ShopLayout() {
  return <Outlet />;
}

function Stub({ title, line }: { title: string; line: string }) {
  return (
    <div className="shop-stub">
      <h1>{title}</h1>
      <p>{line}</p>
    </div>
  );
}

export function ShopToday() {
  return (
    <Stub
      title="Today"
      line="Stall dashboard stub — payments held in escrow, pickups in Kariakoo."
    />
  );
}

export function ShopStock() {
  return <Stub title="Stock" line="Inventory stub. List kitenge, kicks, and gadgets later." />;
}

export function ShopOrders() {
  return <Stub title="Orders" line="Handover PIN stub. Confirm when the buyer shows the code." />;
}

export function ShopProfile() {
  return <Stub title="Shop" line="Your stall profile stub. Guest buyers never see this tab set." />;
}
