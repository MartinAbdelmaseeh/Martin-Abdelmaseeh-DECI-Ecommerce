# Relay — Full-Stack E-Commerce Platform

A full-stack e-commerce application built for DECI Level 5: authentication and role management, a product catalog with search/filter/sort/pagination and image upload, a cart-to-checkout flow, an admin dashboard, product reviews, store statistics, and an automated welcome-email service — backed by PostgreSQL and MongoDB, fully containerized with Docker.

**Repository:** https://github.com/MartinAbdelmaseeh/Martin-Abdelmaseeh-DECI-Ecommerce.git

---

## Try it in under 2 minutes (Docker)

```bash
git clone https://github.com/MartinAbdelmaseeh/relay-ecommerce.git
cd relay-ecommerce
cp .env.example .env
```

Open `.env` and fill in two values (everything else has a working default):
- `JWT_SECRET` — any long random string
- `MONGO_URI` — a MongoDB Atlas connection string (see [MongoDB setup](#mongodb-setup) below if you don't have one)

```bash
docker compose up --build
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/health

**Demo admin login** (pre-seeded, no setup needed): `admin@relay.demo` / `Admin123!`

---

## What's included

- **Auth & roles** — registration, login, JWT in an httpOnly cookie, customer/admin roles
- **Product catalog** — search, category filter, sort (price/title/date), pagination, image upload (Multer)
- **Cart & checkout** — add/update/remove items, place an order from the cart
- **Order management** — customers see their own order history; admins see and update every order's status
- **Product reviews** — star ratings + comments, one review per user per product, stored in MongoDB
- **Store statistics** — admin dashboard showing user/order counts and revenue, sourced from an independent MongoDB event log
- **Welcome emails** — sent automatically on registration via Nodemailer; works out of the box by logging to the console if no SMTP is configured
- **Automated tests** — 48 Jest + Supertest tests covering auth, products, cart, and orders against a real database
- **Docker** — the whole stack (Postgres + backend + frontend) runs with one command

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Context API, plain CSS with design tokens |
| Backend | Node.js, Express |
| Primary database | PostgreSQL (users, products, carts, orders) |
| Secondary database | MongoDB / Atlas (reviews, statistics — kept independent of Postgres) |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing |
| File uploads | Multer (product images) |
| Email | Nodemailer |
| Testing | Jest, Supertest |
| Containerization | Docker, docker-compose, nginx (serves the built frontend) |

---

## Project structure

```
relay-ecommerce/
├── docker-compose.yml
├── backend/
│   ├── app.js                  # Express app (importable, used by tests)
│   ├── server.js                 # Entry point — starts the app, connects DBs
│   ├── config/                    # Postgres + MongoDB connection setup
│   ├── models/                     # Postgres models (User, Product, Cart, Order)
│   ├── controllers/, routes/, middleware/
│   ├── services/                   # Independent modules, each self-contained:
│   │   ├── email/                    #   welcome email (Nodemailer)
│   │   ├── reviews/                   #   product reviews (MongoDB)
│   │   └── statistics/                 #   admin stats dashboard (MongoDB)
│   ├── tests/                       # Jest + Supertest suite
│   ├── prisma/                      # Prisma schema, migrations, and seed script
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── api/                    # One file per backend resource
    │   ├── context/                  # Auth + Cart state
    │   ├── components/, pages/         # Including pages/admin/ for the dashboard
    └── Dockerfile, nginx.conf
```

---

## MongoDB setup

Reviews and statistics are intentionally on a separate database from the rest of the app. The easiest path is a free MongoDB Atlas cluster:

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free M0 cluster
3. **Database Access** → add a database user (username/password)
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
5. **Connect** → **Drivers** → copy the connection string, and insert your database name before the `?`:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecommerce_db?retryWrites=true&w=majority
   ```
6. Put that in `MONGO_URI` in your `.env`

If MongoDB isn't reachable, the rest of the app (auth, products, cart, orders) still works fully — only `/api/reviews` and `/api/statistics` will return errors until it's connected.

---

## Running without Docker

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, MONGO_URI
npx prisma migrate dev
npm run db:seed
npm start
```

**Frontend** (separate terminal):
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Database Migrations & Seeding

This project uses **Prisma ORM** to manage database schema migrations and seed data.

### 1. Database Migrations
To initialize your database and deploy the schema (along with the necessary PostgreSQL triggers):
```bash
cd backend
npx prisma migrate dev
```

### 2. Seeding Data
To populate the database catalog with 10 default products and create the demo admin account (`admin@relay.demo`):
```bash
cd backend
npm run db:seed
```
*Note: The seeding script is fully idempotent (using Prisma `upsert`) and can be safely executed multiple times without generating duplicate records.*

### 3. Docker Seeding
When running via Docker (`docker compose up`), both migrations and data seeding are automatically handled on container startup via `docker-entrypoint.sh`.

---

## Running the tests

```bash
cd backend
cp .env.example .env.test   # point DATABASE_URL at a separate test database
npm test
```

The test suite provisions its own Postgres test database and schema automatically (`tests/globalSetup.js`) and runs 48 tests across auth, products, cart, and orders — including permission checks (admin vs. customer), edge cases (empty cart checkout, duplicate registration), and SQL-injection-safety on the sort parameter.

---

## Environment variables

See `.env.example` (root, for Docker) and `backend/.env.example` (for running the backend directly) for the full list with descriptions. The email service (`SMTP_*`) is entirely optional — without it, welcome emails are just logged to the console instead of sent.

---

## Known limitations

- **Admin account creation**: the registration endpoint currently accepts an optional `role` field in the request body. The sign-up UI never exposes this (every account created through the form is a customer), but a `role: "admin"` could technically be sent via a direct API request. Fine for local/coursework use; would need to be locked down (e.g. a separate admin-only invite flow) before any real deployment.
- **File uploads** are stored on local disk (bind-mounted into the Docker container), not a cloud storage bucket — fine for local/demo use, not suited to a multi-instance production deployment.

---

## Author

Built by Martin Abdelmaseeh as a DECI Level 5 capstone project.