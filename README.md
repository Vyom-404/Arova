# Arova

**A modern full-stack storefront for discovering products, managing a personal cart and wishlist, and checking out with Razorpay Test Mode.**

Arova pairs a React storefront with a Node.js and Express API backed by MongoDB. Customer accounts use JWT authentication stored in HTTP-only cookies. Product, wishlist, cart, and order data are served from the API, while React Context keeps cart information in sync across the shopping experience.

## Features

- **Shop:** Browse products, search by name, filter by category, sort by price, and view product details.
- **Save:** Keep a customer-specific wishlist.
- **Cart:** Persist cart items and quantities, validate stock, and share cart state across the client.
- **Checkout:** Review itemized totals, enter shipping details, and use Buy Now to go directly to checkout with a chosen quantity.
- **Payments and orders:** Create Razorpay Test Mode payments, verify signatures on the server, and view saved order details and history.
- **Accounts:** Register, sign in, and manage an authenticated customer account.
- **Interface:** Responsive shopping pages with loading, error, and empty states, plus Arova branding and favicon.

## Contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Frontend routes](#frontend-routes)

## Tech stack

- **API:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Authentication:** bcrypt, JSON Web Tokens, HTTP-only cookies
- **Client:** React, React Router, Context API, Vite, Axios

## Project structure

```text
.
├── config/                 # Razorpay server configuration
├── controllers/            # Customer, product, wishlist, cart, and order handlers
├── middlewares/            # JWT cookie authentication
├── models/                 # Customer, product, separate Cart, and Order schemas
├── routes/                 # Customer, product, wishlist, cart, and order routes
├── utils/                  # JWT creation
├── index.js                # Express app and MongoDB connection
├── client/                 # Vite + React application
│   ├── public/             # Arova favicon
│   └── src/
│       ├── assets/         # Arova brand mark
│       ├── components/     # Navbar, product/cart cards, brand mark, and route guards
│       ├── context/        # Shared cart state
│       ├── pages/          # Store, checkout, order history, and account pages
│       └── services/       # Axios API client and request helpers
├── scripts/seed-products.js # Optional sample product seeder
├── .env.example            # API environment template
└── client/.env.example     # Client environment template
```

## Getting started

### Prerequisites

- Node.js and npm
- MongoDB, either locally or through MongoDB Atlas

### 1. Configure the API

Install the API dependencies and create its environment file:

```bash
npm install
cp .env.example .env
```

Set `MONGO_URI` to your database connection string and replace `JWT_SECRET` with a long, private random value. To enable checkout, add Razorpay **Test Mode** credentials:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_mode_key_secret
```

The API only accepts a key ID beginning with `rzp_test_`. Keep the key secret in the backend `.env`; it is never sent to the browser. The public test Key ID is returned to React only when starting Razorpay Checkout. The API uses Node's built-in `fetch` for Razorpay's Orders API.

Start the API from the repository root:

```bash
npm run dev
```

The API listens on `http://localhost:3002` by default. Use `npm start` to run it without nodemon.

### 2. Configure the client

In a second terminal, install the client dependencies and start Vite:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The client sends API requests with credentials enabled so the browser can store and send the authentication cookie.

### Optional sample products

The product listing reads from MongoDB. To insert the included sample products into the database, run this from the repository root:

```bash
npm run seed:products
```

The script inserts a sample product only when a product with the same name does not already exist. Products can also be added with `POST /products`.

## Environment variables

### API (`.env`)

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | API listening port | `3002` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/shopkart` |
| `JWT_SECRET` | Secret used to sign and verify JWTs | Use a long, random private value |
| `JWT_EXPIRES_IN` | JWT lifetime (optional; defaults to `7d`) | `7d` |
| `NODE_ENV` | Runtime mode; enables secure cookies in production | `development` |
| `CLIENT_URL` | Allowed browser origin for credentialed CORS | `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | Razorpay Test Mode public key ID (`rzp_test_...`) | Set from the Test Mode dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay Test Mode secret; backend only | Set from the Test Mode dashboard |

### Client (`client/.env`)

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the API | `http://localhost:3002` |

Do not commit `.env` files or put production secrets in the client environment. Variables prefixed with `VITE_` are exposed to the browser.

## API reference

All endpoints accept and return JSON. Protected endpoints use the `token` HTTP-only cookie set by a successful login. In Postman, log in first and keep the cookie enabled for subsequent requests. The browser client sends credentials automatically.

### Customer endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Check that the API is running |
| `POST` | `/customers/register` | No | Create a customer account |
| `POST` | `/customers/login` | No | Authenticate and set the `token` cookie |
| `GET` | `/customers/me` | Yes | Return the authenticated customer |
| `POST` | `/customers/logout` | Yes | Clear the authentication cookie |
| `PATCH` | `/customers/change-password` | Yes | Change the authenticated customer's password |

Registration requires `fullName`, `email`, `password`, and `phone`. Passwords must contain at least six characters. Login accepts `email` and `password`.

### Product endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/products` | No | Create a product |
| `GET` | `/products` | No | List products |
| `GET` | `/products/:id` | No | Get one product by MongoDB ID |

Create a product with:

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://example.com/keyboard.jpg",
  "stock": 10
}
```

The product schema requires `name`, `description`, `category`, `image`, `price`, and `stock`. Price must be greater than zero; stock cannot be negative. `createdAt` is generated automatically.

`GET /products` supports these query parameters:

| Query parameter | Example | Behavior |
| --- | --- | --- |
| `search` | `/products?search=keyboard` | Case-insensitive match against product name |
| `category` | `/products?category=Electronics` | Filter by exact category |
| `sort` | `/products?sort=price_asc` | Sort by price ascending; use `price_desc` for descending |

Parameters can be combined, for example `/products?search=phone&category=Electronics`.

### Wishlist endpoints

All wishlist endpoints are protected. The server identifies the customer from the authenticated session; clients do not send a `userId`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/wishlist/:productId` | Add a product; returns `409` if already saved |
| `GET` | `/wishlist` | Return the authenticated customer's populated wishlist and count |
| `DELETE` | `/wishlist/:productId` | Remove a saved product |
| `PATCH` | `/wishlist/:productId/toggle` | Toggle membership; response includes `saved: true` or `saved: false` |

The Customer document stores an array of Product ObjectId references. `GET /wishlist` populates product name, price, category, image, and stock. This keeps product information in the Product collection as the source of truth.

Common wishlist errors are `401` for missing/invalid authentication, `400` for an invalid product ID, `404` for a missing product or unsaved product removal, and `409` when adding a duplicate.

### Cart endpoints

All cart endpoints are protected. Cart data lives in a separate `Cart` collection, linked to the authenticated Customer. Each cart item stores a Product ObjectId reference and a quantity; product details are populated from the Product collection. The Customer schema does not store cart data.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/cart/:productId` | Add a product or increment its quantity |
| `GET` | `/cart` | Return the authenticated customer's populated cart |
| `PATCH` | `/cart/:productId` | Set a cart item's quantity using `{ "quantity": 3 }` |
| `DELETE` | `/cart/:productId` | Remove an item and return the updated cart |

Adding the same product again increments its quantity instead of creating another row. Add and quantity updates are rejected with `400` if the requested quantity exceeds current stock. Invalid product IDs return `400`; missing products or cart items return `404`. Product prices are populated from the current Product document, not copied into the Cart.

The frontend `CartContext` loads the cart once for the protected application and shares it with product cards, the Navbar, and the Cart page. The Navbar count is the total quantity of all cart items. Subtotal is derived as the sum of each current product price multiplied by its quantity; neither value is stored separately in MongoDB.

### Order and payment endpoints

All order endpoints are protected and identify the customer from the JWT cookie. Regular cart checkout sends shipping details; the backend reloads the authenticated customer's cart, obtains current product prices and stock, snapshots item details, and calculates the INR total itself. Buy Now sends a product ID and selected quantity with the shipping details; the backend validates stock and gets the current product price from MongoDB. Razorpay receives the amount in paise. The backend verifies Razorpay's HMAC signature before marking the order `PAID` / `PLACED`. A regular cart order clears the separate Cart document after successful verification; a Buy Now order leaves it unchanged. The Razorpay Key Secret is never exposed to React.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/orders/create-payment-order` | Validate shipping and either cart contents or Buy Now product/quantity; persist an order snapshot and create a Razorpay Test Mode Order |
| `POST` | `/orders/verify-payment` | Verify the signature and mark the order paid/placed; clear the cart only for regular cart checkout |
| `GET` | `/orders` | List only the authenticated customer's orders, newest first |
| `GET` | `/orders/:id` | Fetch one order only if it belongs to the authenticated customer |
| `PATCH` | `/orders/:id/status` | Development-only bonus: advance an owned order one step through CONFIRMED, SHIPPED, and DELIVERED |

The checkout UI is at `/checkout`, confirmation/details at `/order-success/:id` and `/orders/:id`, and history at `/orders`. Test Mode credentials are required for payment creation; use Razorpay's test checkout and never Live Mode credentials for this lab.

## Frontend routes

| Route | Page | Access |
| --- | --- | --- |
| `/login` | Sign in | Guests |
| `/register` | Create an account | Guests |
| `/home` | Customer home | Signed-in customers |
| `/products` | Product catalogue, search, and category filter | Signed-in customers |
| `/products/:id` | Product details | Signed-in customers |
| `/wishlist` | Saved products | Signed-in customers |
| `/cart` | Cart quantities and order summary | Signed-in customers |
| `/checkout` | Shipping details, order review, and Razorpay Test Mode checkout | Signed-in customers |
| `/order-success/:id` | Payment confirmation and order details | Signed-in customers; order owner only |
| `/orders` | Order history | Signed-in customers |
| `/orders/:id` | One order's snapshot and shipping details | Signed-in customers; order owner only |

Product cards can toggle wishlist status and add products to the cart without a page refresh. Product details also offer Buy Now, which asks for a quantity and proceeds to checkout without changing the cart. Wishlist and cart changes are reflected across the app through backend responses and shared cart state. The cart summary itemizes prices and shows progress toward complimentary delivery over ₹1,999. Catalogue, wishlist, and cart pages display loading, error, and empty states.

## HTTP responses

Responses include a JSON `success` flag. Common status codes are `400` for invalid input, `401` for missing/invalid authentication, `404` for a missing route or product, and `409` for duplicate customer email or duplicate wishlist addition.
