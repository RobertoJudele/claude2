# Architecture Documentation – Running Free Festival Platform

## 1. System Overview

The platform uses a modern **client–server architecture**:

- **Frontend:** React + TypeScript + Material UI  
- **Backend:** FastAPI (Python)  
- **Database:** MySQL (via SQLAlchemy ORM)  
- **Authentication:** Firebase Authentication (JWT-based)  
- **Messaging:** WebSocket (FastAPI + AsyncIO)  
- **Payments:** Stripe (Escrow planned)  
- **CMS (Future):** Webflow for articles & news  
- **Deployment:** Docker, NGINX, GitHub Actions CI/CD  

### High-Level Interaction

React (Frontend)
↓ REST + WebSocket
FastAPI (Backend)
↓
MySQL (Database)
↓
Firebase (Auth) | Stripe (Payments) | Webflow (Articles)


---

## 2. Technology Stack

| Layer        | Tools |
|--------------|-----------------------------------------------|
| Frontend     | React, TypeScript, Material UI, Axios, Zustand |
| Backend      | FastAPI, SQLAlchemy, Pydantic, Uvicorn, WebSocket |
| Database     | MySQL |
| Authentication | Firebase Auth + Firebase Admin SDK |
| Messaging    | WebSocket + AsyncIO |
| Payments     | Stripe Payment Intents (Escrow logic) |
| Deployment   | Docker, Docker Compose, NGINX, GitHub Actions |
| CMS (Future) | Webflow API |

---

## 3. Project Structure

backend/
app/
main.py
models/ # SQLAlchemy ORM classes
schemas/ # Pydantic models (request/response)
routes/ # rides.py, messages.py, auth.py, payments.py
websocket/ # chat manager & ws endpoints

frontend/
src/
pages/
components/
store/ # Zustand state management
api/ # Axios calls
websocket/ # WS connection handler

docker-compose.yml
nginx/default.conf




---

## 4. Database Model Overview

### User
| Field         | Type |
|---------------|------|
| id            | INT (PK) |
| firebase_uid  | STRING |
| name          | STRING |
| email         | STRING |
| profile_pic   | STRING |
| rating        | FLOAT (future feature) |

### Ride
| Field           | Type |
|------------------|------|
| id               | INT (PK) |
| driver_id        | FK(User.id) |
| direction        | ENUM('to_festival','from_festival') |
| start_location   | STRING |
| end_location     | STRING |
| date             | DATE |
| time             | TIME |
| seats_available  | INT |
| price            | DECIMAL |
| notes            | TEXT |
| instant_booking  | BOOLEAN |
| status           | ENUM('open','full','cancelled','completed') |

### RideRequest
| Field           | Type |
|------------------|------|
| id               | INT (PK) |
| ride_id          | FK(Ride.id) |
| passenger_id     | FK(User.id) |
| seats_requested  | INT |
| status           | ENUM('pending','approved','rejected','cancelled') |

### Chat & Message
| Chat Field  | Description        |
|-------------|---------------------|
| chat_id     | Primary key         |
| ride_id     | Optional FK (ride group chat) |
| type        | 'private' or 'ride_group' |

| Message Field | Description |
|---------------|-------------|
| id            | INT (PK) |
| chat_id       | FK(Chat.id) |
| sender_id     | FK(User.id) |
| content       | TEXT |
| timestamp     | DATETIME |

---

## 5. Example API Flow — Create Ride

1. User submits ride form in React.  
2. Frontend sends `POST /rides/create` with Firebase JWT token.  
3. FastAPI verifies JWT using Firebase Admin SDK.  
4. Ride is stored in MySQL with driver linked.  
5. Response returns new ride details to frontend.

---

## 6. Messaging Architecture (WebSocket)

React Chat UI
↕ WebSocket
FastAPI WebSocket Endpoint
↕
Broadcast to connected participants
↕
Save message in MySQL


- Each chat has a `chat_id`.  
- Messages are broadcast in real-time and stored in DB.  
- Chat history is loaded via REST when opening conversation.

---

## 7. Payment System (Stripe Escrow – Sprint 3)

1. Passenger request is approved.  
2. Passenger is redirected to Stripe Checkout.  
3. Payment is created as a **Payment Intent** (money held, not yet released).  
4. After ride completion → driver confirms arrival.  
5. Backend captures payment using `stripe.payment_intents.capture()`.  
6. If canceled → full refund.

---

## 8. Firebase Authentication Flow

React Firebase SDK → User logs in → Receives JWT
↓
JWT sent in Authorization header to backend
↓
FastAPI verifies JWT with Firebase Admin SDK
↓
If valid → user allowed
Else → HTTP 401 Unauthorized


---

## 9. Deployment Workflow

| Component  | Tool |
|------------|------|
| Containers | Docker + Docker Compose |
| Reverse Proxy | NGINX |
| HTTPS | Let's Encrypt + Certbot |
| CI/CD | GitHub Actions (build + deploy on push) |
| Hosting | VPS / Oracle Cloud instance |
| Backups | Cron jobs + mysqldump |

---

## 10. Future Enhancements

- Admin dashboard for user and ride moderation  
- Push/email notifications for new messages or bookings  
- Google Maps / GPS integration for ride routes  
- Multilingual interface (English/Romanian)  
- Report/ban system for unsafe users  
- Image/file sharing in chat  

---



