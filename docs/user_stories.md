# User Stories

This file contains **all user stories** for the Running Free Festival platform, written in English and grouped by feature and role.

---

## Team 1 – Ridesharing Module

### Role: Driver (offers rides)

1. **Post a ride**
   - *As a driver, I want to post a new ride by selecting direction (To or From Festival), departure and arrival location, date and time, so that passengers can find my ride.*

2. **Set ride details**
   - *As a driver, when I create a ride, I want to set available seats, price per seat (or free / shared cost), so that passengers know the expectations.*

3. **Add ride notes**
   - *As a driver, I want to add notes like “cash or Revolut payment”, “only small luggage”, so that I can clarify logistics.*

4. **Manual or instant booking**
   - *As a driver, I want to choose if passengers need my approval to book, or if they can auto-join instantly.*

5. **Receive booking requests**
   - *As a driver, I want to receive notifications when someone requests a seat, so I can approve or reject.*

6. **Manage my rides**
   - *As a driver, I want to view all the rides I’ve posted and see how many seats are confirmed or pending.*

7. **Approve or reject passengers**
   - *As a driver, I want to approve or deny ride requests individually.*

8. **Edit or cancel ride**
   - *As a driver, I want to edit my ride details (time, date) or cancel the ride if needed.*

9. **View approved passengers & chat**
   - *As a driver, after accepting a passenger, I want to see their name and chat with them through internal messaging.*

---

### Role: Passenger (searches and joins rides)

1. **Search rides with filters**
   - *As a passenger, I want to filter rides by direction (To/From Festival), location, date, price, and driver rating.*

2. **View ride details**
   - *As a passenger, I want to see departure time, seats available, price, notes, and the driver's profile.*

3. **Request a seat**
   - *As a passenger, I want to send a booking request for one or more seats to the driver.*

4. **Track request status**
   - *As a passenger, I want to see whether my request is Pending, Approved, or Rejected.*

5. **Chat after approval**
   - *As a passenger, once I am accepted, I want to access a chat with the driver to finalize details like pickup point.*

6. **Cancel booking**
   - *As a passenger, I want to cancel a seat request or approved booking if my plans change.*

---

### Role: General User (Driver or Passenger)

1. **Use existing festival profile**
   - *As a user, I want my festival account profile (name, profile picture) to be used in ridesharing automatically.*

2. **Internal private messaging**
   - *As a user, I want an integrated messaging system rather than giving my personal phone number.*

3. **Ratings and reviews (future)**
   - *As a user, after the ride, I want to leave a rating and short review for the other user (driver or passenger).*

---

## Team 2 – Messaging Module

### Messaging Functionality

1. *As a user, I want to start a conversation for an active ride so I can communicate before the journey.*
2. *As a user, I want to send and receive messages in real time so I can coordinate quickly.*
3. *As a user, I want to see chat history so I remember previous messages.*
4. *As a user, I want a clean chat interface to easily read and send messages.*
5. *As a system, I want to label each message with the sender (driver or passenger) to avoid confusion.*
6. *As a user, I want to get notified when I receive a new message.*

---

### Tech Stack for Messaging

| Layer | Technology Used |
|-------|------------------|
| Backend | FastAPI, WebSockets, SQLAlchemy, Pydantic, asyncio |
| Frontend | React, Axios, WebSocket, Zustand for state |

---

## Lead / DevOps (You)

1. *As a lead, I want to deploy backend, frontend, database, and nginx using Docker Compose.*
2. *As a lead, I want Firebase Authentication to manage users securely.*
3. *As a lead, I want to integrate Stripe for secure payments.*
4. *As a lead, I want to configure HTTPS with NGINX and SSL certificates.*
5. *As a lead, I want Webflow CMS integration so organizers can add articles easily.*
6. *As a lead, I want CI/CD pipelines to auto-deploy on push to main branch.*

---

