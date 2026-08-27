# Smart Restaurant Ordering System — Final Plan (v3)

> All open decisions from v2 are now locked in below. This is ready to move into database schema design and UI build once you give final approval.

---

## 1. Tech Stack (Decided)

| Layer | Choice |
|---|---|
| Backend | **Python — Django or Flask** |
| Database | **Firebase** (Firestore + Auth + Storage + Realtime — chosen over PostgreSQL/MongoDB for ease of use) |
| Frontend | **React + Tailwind CSS** (TerraElix-style visuals for customer pages, calmer version for dashboards) |
| Deployment | **Deferred — decide later**, not blocking current planning/build work |
| Currency | **BDT (৳ Tk)** — all prices, bills, and payment amounts displayed and stored in Taka |

*Django vs Flask: Django is recommended if you want built-in admin panel, auth, and ORM out of the box. Note: since Firebase (Firestore) is NoSQL, you'll rely less on Django's built-in ORM/admin for data and more on the `firebase-admin` Python SDK to read/write Firestore, use Firebase Auth, and Firebase Storage for food/drink images. Django/Flask still handles your custom business logic (Grok AI calls, weighted rating calculation, weather→dish mapping, bill generation).*

**Why Firebase over PostgreSQL/MongoDB:** Firebase bundles Authentication (login/signup), Storage (food/drink images), and Realtime updates (live table status 🟢/🔴, live order status) into one service — removing three separate problems you'd otherwise solve yourself. It has an official Python SDK (`firebase-admin`) so it still works with your Django/Flask backend. Trade-off: being NoSQL, relational-style reports (e.g. profit/loss joining orders + inventory + payments) take a bit more manual query work than SQL joins, but is manageable at this scale. Firestore also supports transactions, so the table double-booking problem is still solvable.

---

## 2. User Roles (Final)

| # | Role |
|---|------|
| 1 | Customer |
| 2 | Admin (Restaurant Owner + System Admin combined into **one role**) |
| 3 | Kitchen Staff (Chef) |
| 4 | Waiter / Service Staff |
| 5 | Delivery Rider |

*(System Administrator merged into Admin — one account, full access, per your decision.)*

---

## 3. Order Types

1. **Dine-in** — table number attached automatically
2. **Takeaway** — pickup in person
3. **Online/Delivery** — delivered by rider

**Status flow:**
```
Placed → Confirmed → Preparing → Ready
   Dine-in:  Ready → Served → Bill Requested → Paid (cash, in person) → Completed
   Takeaway: Ready → Picked Up → Paid (cash at counter or pre-paid online) → Completed
   Online:   Ready → Out for Delivery → Delivered → Paid (COD or pre-paid online) → Completed
```

---

## 4. Payments (Final)

- **Currency: BDT (Tk)** throughout — menu prices, bills, invoices, reports, all in Taka
- **Digital**: bKash, Nagad, Card (for takeaway/online orders)
- **Cash on Delivery** — supported for online/delivery orders
- **Cash at counter** — supported for takeaway
- **Dine-in**: **offline only** — waiter prints/brings the bill slip, customer pays in person (cash or possibly card reader if you have one physically — no in-app dine-in payment for now)

---

## 5. Admin Roles & Responsibilities (Final)

### 5.1 Dashboard
- Daily/weekly/monthly sales (in Tk)
- Active orders feed (filterable by order type)
- Customer activity monitoring

### 5.2 User Management
- Add/edit/remove customers, riders, waiters, kitchen staff
- Assign roles & permissions, suspend/activate accounts

### 5.3 Menu Management
- Add/edit/delete food & drink items
- Set prices **(in Tk)**
- **Upload and edit food/drink images** — admin can replace/update images anytime
- Categorize items (Pizza, Drinks, Desserts, etc.)
- **Menu displayed to customers in a column/grid layout** (confirmed UI style, not nutrition data)
- Set ingredient list per dish (customer-visible)
- **Manually map weather condition → recommended dish** (e.g. rainy → soup, khichuri) — no AI involved in this specific feature
- Mark items available/unavailable (live to customers)

### 5.4 Inventory Management
- Monitor & update ingredient stock

### 5.5 Order Management
- View/cancel/refund orders, track progress
- Generate/print/download Bill slip (dine-in & takeaway)
- Reply to customer delay-inquiry messages with updated ETA

### 5.6 Table Management
- Add/remove tables, set seat capacity (floor plan setup)
- Live table status: 🟢 Available / 🔴 Reserved-Occupied
- **Reservation = walk-in/immediate seating only** — no future time-slot booking
- Short hold/lock (2–3 min) when a customer is reserving, to prevent double-booking

### 5.7 Staff Management *(optional)*
- Employee profiles, shifts, attendance, performance

### 5.8 Payment Management
- Payment history (Tk), verify digital payments, process refunds, generate invoices

### 5.9 Customer Management
- Profiles, complaints, review responses, loyalty rewards, promotions

### 5.10 Reports & Analytics (AI — Grok free API)
- Sales & profit/loss reports (Tk), popular food prediction, customer behavior analysis
- *Treated as enhancement layer — app must work fully if the free API is rate-limited/down*

### 5.11 System Settings
- Restaurant info, operating hours, taxes/service charges (Tk-based), backups, notifications

### 5.12 AI Features
- Demand forecasting, inventory optimization, menu recommendations

---

## 6. Per-Role Feature Breakdown

### 6.1 Customer
- Browse menu in **column/grid layout**, by category, **with food/drink images**
- View ingredients per dish
- Weather-based recommended dishes (admin-curated)
- Live item availability
- Estimated prep/arrival time (auto, ideally AI/kitchen-generated — not manual per-order chat)
- **Table reservation**: live floor plan view (🟢/🔴), seat counts, reserve for immediate seating
- Place orders: Dine-in / Takeaway / Online — **all prices shown in Tk**
- Pay via bKash/Nagad/card (online/takeaway), or cash (COD/counter), or offline cash for dine-in
- Leave ratings/reviews only after a verified completed order
- See top-rated items first (weighted average, not raw average)
- Message admin/kitchen if order is late; get ETA reply
- Order history
- AI: food recommendations, personalized suggestions, smart chatbot, allergy/dietary flags

### 6.2 Admin
- Full access to all of §5
- AI sales prediction, demand forecasting, customer behavior analytics, business insights

### 6.3 Kitchen Staff / Chef
- Incoming orders (dine-in shows table number)
- Status updates: Preparing → Ready
- Cooking queue + AI order prioritization
- AI-estimated prep time (feeds customer ETA)
- Ingredient usage optimization

### 6.4 Waiter / Service Staff
- View assigned/live table status
- Receive confirmed dine-in orders with table number
- Mark orders Served
- Print/hand over Bill slip, collect payment (cash) in person
- Mark table "needs cleaning" after checkout

### 6.5 Delivery Rider
- Accept delivery requests
- AI route optimization, traffic-aware navigation, delivery time prediction
- Update delivery status, confirm delivery, confirm COD collection

---

## 7. UI / Frontend Direction

- **Brand personality: Fine dining / upscale**
- Customer-facing pages (landing, menu grid, food detail, reservation): TerraElix-style — animated headline reveals, hero imagery, smooth carousels, elegant spacing
- Suggested font direction for fine dining (refined, not playful): consider a serif or refined sans for headings (e.g. a elegant serif like **Playfair Display** or **Cormorant** paired with **Inter** for body text) instead of the original DM Sans — DM Sans reads more casual/wellness-brand. *(Open to your preference — we can decide when we get to actual design.)*
- Admin / Kitchen / Waiter / Rider dashboards: same color palette & component language, calmer motion (simple fade-ins), prioritizing speed/clarity over animation
- Food & drink images are core to the menu — every item needs a clean, consistent image treatment (admin-uploaded, admin-editable)

---

## 8. External Dependencies

- **AI**: Grok free API (non-blocking layer) — used for Reports & Analytics (sales prediction, popular food prediction, customer behavior analysis)
- **Weather API**: needed only to *detect* current weather condition — the dish mapping itself is manual (admin-set), so this can be a simple/free weather API call
- **Firebase**: Auth (login/signup), Firestore (main database), Storage (food/drink images), Realtime updates (table & order status)
- **Payments**: bKash, Nagad, Card, Cash (COD + counter)
- **Notifications**: in-app/push only (no SMS/email for now)
- **Currency**: BDT throughout — no multi-currency needed
- **Deployment**: deferred — to be decided later (Render/Vercel remain options if/when you're ready)

---

## 9. All Decisions — Now Locked ✅

| # | Decision | Final Answer |
|---|----------|---------------|
| 1 | Admin vs SysAdmin | Merged into one Admin role |
| 2 | Weather recommendations | Manual admin mapping (no AI) |
| 3 | Dine-in payment | Offline only, via waiter |
| 4 | Table reservation timing | Immediate/walk-in only |
| 5 | "Food columns" meaning | Grid/column menu layout |
| 6 | Notification channels | In-app/push only |
| 7 | Cash options | COD (online) + cash at counter (takeaway) |
| 8 | Brand personality | Fine dining / upscale |
| 9 | Backend stack | Python (Django recommended) |
| 10 | Database | **Firebase** (Firestore + Auth + Storage + Realtime) |
| 11 | Hosting/Deployment | **Deferred** — decide later (Render/Vercel still options) |
| 12 | Currency | BDT (Tk) throughout |
| 13 | Food/drink images | Required on every item, admin can upload & edit (stored in Firebase Storage) |
| 14 | AI Reports & Analytics | Grok free API |

---

**Next steps (your call):**
1. Confirm Django (vs Flask) for backend
2. Move to **Firestore data structure design** (collections: Users, MenuItems, Categories, Orders, Tables, Reservations, Payments, Reviews, Inventory)
3. Or move straight to **building the first UI page** (likely the Customer menu/landing page, fine-dining styled)
