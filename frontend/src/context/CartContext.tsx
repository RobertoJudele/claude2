import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

export type CartItem = {
  sku: string;
  name: string;
  unitAmount: number; // cents
  currency: "eur";
  quantity: number;
};

type State = { items: CartItem[] };
type Action =
  | { type: "LOAD"; state: State }
  | { type: "ADD"; item: Omit<CartItem, "quantity"> }
  | { type: "REMOVE"; sku: string }
  | { type: "SET_QTY"; sku: string; quantity: number }
  | { type: "CLEAR" };

const KEY = "rff_cart_v1";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return action.state;
    case "ADD": {
      const existing = state.items.find(i => i.sku === action.item.sku);
      if (existing) {
        return { items: state.items.map(i => i.sku === action.item.sku ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case "REMOVE":
      return { items: state.items.filter(i => i.sku !== action.sku) };
    case "SET_QTY": {
      const q = Math.max(1, Math.min(99, action.quantity || 1));
      return { items: state.items.map(i => i.sku === action.sku ? { ...i, quantity: q } : i) };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, quantity: number) => void;
  clear: () => void;
  totals: { count: number; subtotal: number; currency?: "eur" };
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as State;
      if (parsed?.items) dispatch({ type: "LOAD", state: parsed });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const totals = useMemo(() => {
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = state.items.reduce((s, i) => s + i.unitAmount * i.quantity, 0);
    return { count, subtotal, currency: state.items[0]?.currency };
  }, [state.items]);

  const value: Ctx = {
    items: state.items,
    add: (item) => dispatch({ type: "ADD", item }),
    remove: (sku) => dispatch({ type: "REMOVE", sku }),
    setQty: (sku, quantity) => dispatch({ type: "SET_QTY", sku, quantity }),
    clear: () => dispatch({ type: "CLEAR" }),
    totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
