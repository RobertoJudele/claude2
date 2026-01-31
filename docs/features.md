# Features

This document describes the **functional** and **non-functional** features of the Running Free Festival platform.

---

## 1. Functional Features

### 1.1 Ticket & Festival Information
- View lineup, artists, schedules, and event rules.
- View available ticket types (General, VIP, Day Pass, etc.).
- (Planned) Purchase tickets using Stripe.
- (Future) Download ticket in PDF / QR code.

---

### 1.2 Team 1 – Ridesharing System

#### Core Ride Management
- Drivers can **publish a ride** with:
  - Direction: *To Festival* or *From Festival*
  - Departure & arrival location
  - Date & time
  - Available seats
  - Price per seat (or free / shared costs)
  - Notes (e.g. “Payment cash/Revolut”, “Only small luggage”)

- Drivers can **edit or cancel** published rides.
- Drivers can view all **their posted rides** with live seat status.
  
#### Seat Reservation & Approval
- Passengers can **search for rides** using filters:
  - Direction, location, date, price, driver rating
- Passengers can **request 1 or more seats**.
- Driver can **approve or reject** each request.
- Option for **instant booking without approval** (configurable by driver).

#### Negotiation & Communication
- Once a ride is approved → **automatic chat opens** between driver & passenger.
- Passenger and driver can **negotiate pickup point**.
- Driver can **confirm final pickup point**.

#### Payments & Safety (Future but in backlog)
- Stripe-powered **escrow system**:
  - Passenger pays → money held.
  - Payment released to driver when trip is confirmed completed.
- **Driver & passenger confirmation** at start/end of ride.
- **Ratings and reviews** after trip.

---

### 1.3 Team 2 – Messaging System

####  Messaging Types
| Type | Description |
|------|-------------|
| 1-to-1 chat | User ↔ User |
| Ride group chat | Driver + approved passengers |
| Future | Admin ↔ User support chat |

#### ➤ Chat Features
- Send and receive **real-time messages (WebSocket)**.
- Chat created automatically when:
  - Passenger is accepted in a ride OR
  - Two users manually start a conversation (future feature)
- **Message history** is stored in DB and loaded on chat open.
- Sender identity is visible (Driver/Passenger + username).
- **Notifications** for new unread messages.

---

### 1.4 Articles / CMS (Future)
- Admins can post articles/interviews/news using **Webflow CMS**.
- Articles fetched via Webflow API or exported as HTML.

---

### 1.5 Admin / DevOps Features
- Dockerized backend, frontend, database.
- NGINX reverse proxy for HTTPS and routing.
- CI/CD deployment pipeline (GitHub Actions).
- Firebase for authentication & JWT verification.
- Stripe for test-mode payments.

---

## 2. Non-Functional Features

| Category | Description |
|----------|-------------|
| Performance | API responses <200 ms, WebSocket stable at 50+ users |
| Security | Firebase auth, Stripe secure payments, HTTPS |
| Scalability | Docker microservice architecture |
| Reliability | Auto-reconnect WebSocket, DB backups |
| UX | Mobile-first responsive design (MUI) |
| Maintainability | Modular project structure, clear API docs |

---


