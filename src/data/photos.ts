/** Square product crops. Random picsum seeds look like landscapes, not a store. */
const crop = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=800&q=70`;

const BY_SEED: Record<string, string> = {
  "dnols-kitenge-maxi": crop("photo-1594633313593-bab3825d0caf"),
  "dnols-khanga-pair": crop("photo-1610030469983-98e550d6193c"),
  "dnols-dashiki-gold": crop("photo-1489980557514-251d61ba3f22"),
  "dnols-ankara-blazer": crop("photo-1594938298603-c8148c4dae35"),
  "dnols-leso-wrap": crop("photo-1531123897727-8f129e1688ce"),
  "dnols-sneakers-white": crop("photo-1542291026-7eec264c27ff"),
  "dnols-slides-black": crop("photo-1603487742131-4160ec999306"),
  "dnols-canvas-navy": crop("photo-1549298916-b41d501d3772"),
  "dnols-kitenge-tote": crop("photo-1590874103328-eac38a941379"),
  "dnols-backpack-charcoal": crop("photo-1553062407-98eeb64c6a31"),
  "dnols-belt-tan": crop("photo-1624222247344-550fb60583c2"),
  "dnols-cap-dsm": crop("photo-1588850561407-73954769d4d4"),
  "dnols-phone-a15": crop("photo-1511707171634-5f897ff02aa9"),
  "dnols-feature-phone": crop("photo-1585060544812-6b45742d762f"),
  "dnols-tws-black": crop("photo-1590658268037-6bf12165a8df"),
  "dnols-powerbank-20k": crop("photo-1601972602237-8c79280b3da6"),
  "dnols-charger-33w": crop("photo-1583863788434-e58a36330cf0"),
  "dnols-cable-usbc": crop("photo-1587825140708-dfaf72ae4b04"),
  "dnols-bt-speaker": crop("photo-1608043152269-423dbba4e7e1"),
  "dnols-amfm-radio": crop("photo-1598488035139-bdbb2231ce04"),
  "dnols-led-32": crop("photo-1593359676879-2a543ea1856f"),
  "dnols-mouse-wl": crop("photo-1527864550417-7fd91fc51a46"),
  "dnols-kb-mini": crop("photo-1587829741301-dc798b83add3"),
  "dnols-solar-21w": crop("photo-1509391366360-2e959784a276"),
};

const FALLBACK = crop("photo-1441986300917-64674bd600d8");

export function productPhoto(seed: string): string {
  return BY_SEED[seed] ?? FALLBACK;
}
