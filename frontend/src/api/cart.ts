type CartItem = {
  event_id: number;
  event_name: string;
  ticket_type?: string;
  unit_amount: number;
  quantity: number;
};

const CART_KEY = "rff_cart_v1";

export function addToCart(item: Omit<CartItem, "quantity">, qty: number = 1) {
  const raw = localStorage.getItem(CART_KEY);
  const cart: CartItem[] = raw ? JSON.parse(raw) : [];

  const idx = cart.findIndex(
    (x) => x.event_id === item.event_id && (x.ticket_type || "") === (item.ticket_type || "")
  );

  if (idx >= 0) cart[idx].quantity += qty;
  else cart.push({ ...item, quantity: qty });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}
 