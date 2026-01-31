import { apiFetch } from "./apiClient";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type CartCheckoutItem = {
  sku: string;
  quantity: number;
};

export type CheckoutResponse = {
  checkout_url: string; // keep it simple: always return url
};

/**
 * Create a mock ticket for the current Firebase user.
 */
export async function createTicket(type: string) {
  const ticketData = {
    event_name: "RFF Festival 2025",
    ticket_type: type,
    date: new Date().toISOString(),
    price: type === "Full Festival Pass" ? 100.0 : 60.0,
  };

  // apiFetch returns already-parsed JSON or throws on error
  const data = await apiFetch("/api/tickets/create", {
    method: "POST",
    body: JSON.stringify(ticketData),
  });

  console.log("Ticket created:", data);
  return data;
}

/**
 * Confirm (mock) payment for a given ticket.
 */
// export async function confirmTicketPayment(ticketCode: string) {
//   const data = await apiFetch(`/api/tickets/confirm-payment/${ticketCode}`, {
//     method: "POST",
//   });

//   console.log("Confirm payment response:", data);
//   return data;
// }

/**
 * Get all tickets belonging to the currently authenticated Firebase user.
 */
export async function getMyTickets() {
  const data = await apiFetch("/api/tickets/me");
  console.log("Fetched tickets:", data);
  return data;
}


export async function startCheckout(items: CartCheckoutItem[]): Promise<CheckoutResponse> {
  return apiFetch("/api/payment/checkout-session", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
