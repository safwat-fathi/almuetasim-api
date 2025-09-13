# Almuetasim API Documentation — MVP

> Backend stack: **NestJS (Node.js)**, **PostgreSQL**, **TypeORM**
> Frontend: **Next.js (App Router)** (not part of API but relevant to behavior expectations)
> Supporting infra for MVP: Redis (optional, caching & queues), S3-compatible object storage (images / receipts), SMTP for emails.

---

## 1. Project Overview

**Almuetasim** is a minimal e-commerce API designed for a company selling water filters, replacement parts, and offering installation/maintenance services. The MVP focuses on the core flows needed to go live:

- Product catalog (products, parts, variants).
- Browse categories, filters, search.
- Contact (leads) and basic admin visibility.
- Cart persistence (anonymous + logged in).
- Checkout skeleton (collect address & create an order record) — payment integration postponed.
- User accounts (B2C + B2B support via roles).
- Warranty activation (product-specific, via order id + serial).
- Installation/maintenance booking scheduling.
- Basic admin endpoints for product CRUD and order management.

This document describes data models, endpoints, DTOs, authentication, validation, error handling, and implementation notes tuned for NestJS + TypeORM.

---

# 2. Authentication & Security

### 2.1 Strategy

- **JWT** access tokens (short-lived, e.g., 15m) + refresh tokens (longer, e.g., 30d).
- Store refresh tokens hashed in DB (or a token store such as Redis) to allow revocation.
- Use HTTPS for all endpoints.
- Passwords hashed with bcrypt/argon2 (argon2 preferred if available).
- RBAC: roles `customer`, `b2b`, `technician`, `admin`. Use NestJS Guards for role checks.

### 2.2 Auth Endpoints (overview)

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password` (send reset email)
- `POST /auth/reset-password` (token-based)

### 2.3 Security Best Practices

- Validate all inputs with DTOs + class-validator.
- Rate limit public endpoints (search, warranty activation) to prevent abuse.
- CSRF not required for pure API if using Authorization header and CORS strict origin allowlist.
- Log suspicious warranty activations for manual review.

---

# 3. Data Models (Core — simplified)

> Use TypeORM entities. Fields indicate DB columns and high-level types.

### 3.1 User

```ts
User {
  id: number;            // PK
  name: string;
  email: string;         // unique
  password_hash: string;
  role: 'customer'|'b2b'|'technician'|'admin';
  company?: string;      // for B2B
  phone?: string;
  created_at: Date;
  updated_at: Date;
}
```

### 3.2 Address

```ts
Address {
  id: number;
  user_id: number;       // nullable for guest-saved addresses
  name: string;          // "Home", "Office"
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
}
```

### 3.3 Category

```ts
Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  created_at: Date;
}
```

### 3.4 Product

```ts
Product {
  id: number;
  sku: string;                   // unique SKU
  title: string;
  description: string;
  specs: json;                   // e.g., { type: 'RO', flow_lph: 2, certifications: ['NSF'] }
  certification_tags: string[];  // e.g., ["NSF", "ISO"]
  warranty_months: number;       // e.g., 12
  lifetime_months?: number;      // recommended replacement interval
  images: string[];              // S3 urls
  category_id: number;
  is_part: boolean;              // true for replacement parts
  created_at: Date;
  updated_at: Date;
}
```

### 3.5 Variant (optional, recommended for SKUs & serial handling)

```ts
Variant {
  id: number;
  product_id: number;
  sku: string;           // variant SKU
  price_cents: number;
  stock_qty: number;
  serial_prefix?: string; // optional prefix for serials if tracked
}
```

### 3.6 Order

```ts
Order {
  id: number;
  order_number: string; // human-friendly
  user_id?: number;     // nullable for guest orders
  items: json;          // [{product_id, variant_id?, qty, price_cents}]
  shipping_address: json;
  billing_amount_cents: number;
  status: 'created'|'pending'|'paid'|'fulfilled'|'cancelled';
  created_at: Date;
  updated_at: Date;
}
```

### 3.7 WarrantyRecord

```ts
WarrantyRecord {
  id: number;
  order_id?: number;
  product_id: number;
  serial_number: string;
  activated_by_user_id?: number;
  activated_at: Date;
  expires_at: Date;
  proof_url?: string;      // uploaded receipt or image
  source: 'checkout'|'qr'|'manual';
  metadata: json;          // e.g., { ip, user_agent }
}
```

### 3.8 Subscription (for future)

```ts
Subscription {
  id: number;
  user_id: number;
  variant_id: number;
  interval_months: number;
  next_charge_date: Date;
  status: 'active'|'paused'|'cancelled';
}
```

### 3.9 InstallationBooking

```ts
InstallationBooking {
  id: number;
  order_id: number;
  user_id: number;
  scheduled_at: Date;
  technician_id?: number;
  status: 'scheduled'|'assigned'|'completed'|'cancelled';
  notes?: string;
  report_photos?: string[]; // urls
}
```

---

# 4. API Endpoints (MVP)

> All JSON. Use standard HTTP status codes. Include pagination for list endpoints: `?page=1&limit=20`. Use consistent error shape:

```json
{ "statusCode": 400, "message": "Validation failed", "errors": [...] }
```

---

## 4.1 Authentication

### `POST /auth/signup`

- **Body**:

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role?": "customer|b2b"
}
```

- **Validations**: email format, password min length.
- **Success**: `201 Created`

```json
{
  "user": { "id": 1, "name": "...", "email": "...", "role": "customer" },
  "access_token": "jwt",
  "refresh_token": "jwt"
}
```

### `POST /auth/login`

- **Body**: `{ "email": "string", "password": "string" }`
- **Success**: `200 OK` same response shape as signup.

### `POST /auth/refresh`

- **Body**: `{ "refresh_token": "string" }`
- **Success**: `200 OK` new tokens.

### `POST /auth/logout`

- **Auth**: Bearer (access token)
- **Body**: `{ "refresh_token": "string" }`
- **Action**: revoke refresh token server-side.
- **Success**: `204 No Content`.

---

## 4.2 Products & Categories

### `GET /products`

- **Query params**:
  - `q` (text search)
  - `category` (slug or id)
  - `type` (e.g., RO, Carbon, UV) — part of `specs.type`
  - `cert` (certification tag)
  - `min_price`, `max_price` (cents)
  - `page`, `limit`, `sort` (`price_asc`, `price_desc`, `relevance`)

- **Behavior**: Postgres full-text search & filters. Use `ILIKE` or trigram for partial matching.
- **Success**: `200 OK`

```json
{
  "data": [
    /* product list */
  ],
  "meta": { "page": 1, "limit": 20, "total": 123 }
}
```

### `GET /products/:id`

- **Success**: `200 OK` product with `specs`, `images`, `variants`.

### `POST /products` (Admin)

- **Auth**: Bearer, role `admin`
- **Body**: `CreateProductDto` (`title`, `description`, `specs`, `category_id`, `warranty_months`, `is_part`, `images?`, `variants?`)
- **Success**: `201 Created` created product.

### `PATCH /products/:id` (Admin)

- Update allowed fields.

### `DELETE /products/:id` (Admin)

- Soft delete recommended (mark inactive).

### `GET /categories`

- Returns nested categories.

---

## 4.3 Search & Filters

- `GET /search?q=...&filters...` (alias to /products with more search-specific features).
- Search uses Postgres full-text index on `title`, `description`, `specs->>type`, and `certification_tags`. For fuzzy search enable trigram extension.

---

## 4.4 Cart (MVP: server-side persisted skeleton)

### `POST /cart` (create/update cart)

- **Body**:

```json
{
  "cart_id?": "string",
  "items": [{ "product_id": 1, "variant_id?": 2, "qty": 2 }]
}
```

- If `cart_id` provided, merge; if not, create and return `cart_id` cookie to client.
- For logged-in users, cart persists on user record.

### `GET /cart/:cart_id` or `GET /cart` (if logged in)

- Get current cart.

### `DELETE /cart/:cart_id/items/:item_id`

- Remove item.

**Note:** Cart is a temporary object persisted in DB or Redis for quick lookup. For MVP, DB persistence is acceptable.

---

## 4.5 Checkout (skeleton — no payment provider in MVP)

### `POST /checkout`

- **Auth**: optional (guest checkout allowed)
- **Body**:

```json
{
  "cart_id": "string",
  "shipping_address": { /* Address DTO */ },
  "billing_address?": { /* ... */ },
  "fulfillment_method": "delivery" | "pickup",
  "notes?": "string",
  "request_installation?": true|false,
  "preferred_installation_slot?": "2025-09-27T10:00:00Z"
}
```

- **Behavior**:
  - Validate stock.
  - Reserve items (decrement or mark reserved).
  - Create `Order` with status `created`.
  - If `request_installation` true, create `InstallationBooking` in `scheduled` or `pending`.
  - Return `order` object and `next_step` (e.g., `payment_intent` placeholder or `awaiting_payment`).

- **Success**: `201 Created`

**Payment integration**: later via `POST /payments/confirm` or webhook listener.

---

## 4.6 Warranty Activation

### `POST /warranty/activate`

- **Auth**: optional (allow activation without account by providing order info)
- **Body**:

```json
{
  "order_number?": "string",
  "order_id?": 123,
  "product_id": 45,
  "serial_number": "SN-123456",
  "proof_url?": "https://s3/receipt.jpg",
  "email?": "user@example.com"
}
```

- **Validation logic**:
  - Ensure `product_id` exists.
  - If `order_id` or `order_number` provided, verify the product is in that order and order belongs to email (if provided) — reduces fraud.
  - Calculate `expires_at = now + product.warranty_months`.
  - Insert WarrantyRecord with metadata (IP, user agent).
  - Rate-limit per IP/serial to prevent abuse.

- **Success**: `201 Created` with `warranty` details:

```json
{
  "warranty_id": 999,
  "product_id": 45,
  "serial_number": "SN-123456",
  "activated_at": "2025-09-13T11:00:00Z",
  "expires_at": "2026-09-13T11:00:00Z"
}
```

- **Admin endpoints**:
  - `GET /admin/warranties` (searchable by serial/order/product)
  - `PATCH /admin/warranties/:id` (revoke/adjust)

**QR flow**: QR encodes `product_sku` + `serial` or a unique activation token. QR route maps to frontend page which calls this endpoint.

---

## 4.7 Installation / Maintenance Booking

### `POST /bookings`

- **Auth**: Bearer token (recommended)
- **Body**:

```json
{
  "order_id": 123,
  "user_id?": 1, // optional if derived from auth
  "scheduled_at": "2025-09-25T09:00:00Z",
  "notes?": "call before arriving"
}
```

- **Behavior**:
  - Check technician availability (simple: check for conflicting `InstallationBooking`).
  - Create booking with status `scheduled`.
  - Notify admin/technician via notification queue.

- **Success**: `201 Created`.

### Technician actions (mobile-friendly):

- `PATCH /bookings/:id/assign` — admin assigns technician.
- `PATCH /bookings/:id/status` — `assigned` / `completed` with optional `report_photos`.

---

## 4.8 Contact / Leads

### `POST /contact`

- **Body**:

```json
{ "name": "string", "email": "string", "phone?": "string", "message": "string", "is_b2b_lead?": boolean }
```

- Stores lead and notifies sales via email/CRM webhook.
- Admin: `GET /admin/leads`.

---

## 4.9 Admin endpoints (protected, role=admin)

- Product CRUD (`/admin/products`)
- Orders list & update (`/admin/orders`)
- Warranties list/search (`/admin/warranties`)
- Bookings management (`/admin/bookings`)
- User management (`/admin/users`)

Prefer the admin panel to be in the same Next.js app under protected route `/admin` or a separate admin app.

---

# 5. DTOs & Validation (examples in NestJS)

Example DTO using `class-validator`:

```ts
export class CreateProductDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsNumber() category_id: number;
  @IsOptional() @IsNumber() warranty_months?: number;
  @IsOptional() @IsBoolean() is_part?: boolean;
  @IsOptional() @IsArray() images?: string[];
  @IsOptional() specs?: any;
}
```

Apply global validation pipe in NestJS:

```ts
app.useGlobalPipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
);
```

---

# 6. Pagination, Sorting, Filtering Conventions

- Pagination: `?page=1&limit=20`. Respond with `meta: { total, page, limit }`.
- Sorting: `?sort=price_asc` or `sort=created_at_desc`.
- Filters: use clear parameter names; for arrays use comma-separated or repeated params: `?cert=NSF,ISO` or `?cert=NSF&cert=ISO`.
- Date/time in ISO 8601 UTC.

---

# 7. Error Handling & Response Shapes

- Success: 2xx with JSON resource or `{ "data": ..., "meta": {...} }`.
- Errors: consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation Failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

- Common codes:
  - `400` bad request / validation
  - `401` unauthorized
  - `403` forbidden (role mismatch)
  - `404` not found
  - `409` conflict (duplicate SKU)
  - `429` too many requests (rate limit)
  - `500` server error

---

# 8. Implementation Notes (NestJS + TypeORM specifics)

### 8.1 TypeORM Recommendations

- Use explicit migrations via `typeorm` or `typeorm-extensions`. Commit migration files in repo.
- Avoid `synchronize: true` in production.
- Use `QueryRunner` in complex migrations when altering large tables.
- Consider using `typeorm-paginate` or write your own pagination using `LIMIT/OFFSET` or `keyset pagination` for larger tables.

### 8.2 Transactions & Concurrency

- Order creation (reserve stock) must be transactional: create order + decrement stock in same DB transaction.
- Use `SELECT ... FOR UPDATE` when checking and decrementing stock to avoid oversell.
- For high concurrency, consider optimistic locking or a Redis-backed reservation queue.

### 8.3 File Uploads

- Images/proofs: upload directly from client to S3 (presigned URL) to avoid overloading API; persist S3 keys in DB.
- Validate file types & sizes in backend when receiving proof URLs.

### 8.4 Background Jobs

- Use Redis + BullMQ for:
  - Sending email/SMS
  - Subscription triggers
  - Booking notifications

- Workers can be separate NestJS processes reading from queues.

---

# 9. Observability & Monitoring (MVP minimum)

- Request logging (Pino recommended with NestJS adapter).
- Error tracking: Sentry.
- Basic metrics: response latency, error rates (Prometheus + Grafana or SaaS).
- DB backups: daily snapshots, retention policy (e.g., 30 days).
- Alerts: job failures, high error rate, disk usage.

---

# 10. Rate Limiting & Abuse Prevention

- Public endpoints like `POST /warranty/activate`, `POST /auth/login`, `GET /search` should have rate limits (e.g., 100 req/min per IP or more granular).
- For `warranty/activate` additionally:
  - Limit activations per serial.
  - Throttle attempts per IP.
  - Flag suspicious patterns for manual review.

---

# 11. Deployment & Infra (MVP)

- Containerize app with Docker.
- Use managed Postgres (e.g., RDS / Cloud SQL) for reliability.
- Redis managed instance for queues/caching.
- S3-compatible storage (AWS S3, DigitalOcean Spaces).
- CI: run tests, migrations, build, and deploy.
- Zero-downtime deploys recommended.

---

# 12. Migration & Versioning

- Expose API versioning in path: `/api/v1/...` to allow iterative changes.
- Use migration files to evolve DB; always run migrations in staging and test restores.

---

# 13. Example Workflows

### 13.1 Typical Purchase (guest)

1. Client creates cart (`POST /cart`) → receives `cart_id`.
2. User adds items.
3. Client calls `POST /checkout` with `cart_id` and `shipping_address`.
4. API creates `Order` status `created` and returns `order` details + `next_step`.
5. Admin fulfills or payment flow integrated later.

### 13.2 Warranty Activation via QR

1. User scans QR → frontend shows product details & activation form prefilled with `product_id`.
2. Frontend calls `POST /warranty/activate` with `serial_number` and optional `order_number`.
3. Server validates and creates `WarrantyRecord`, returns confirmation.

### 13.3 Booking Installation at Checkout

- Customer selects `request_installation: true` during checkout → `InstallationBooking` created with `scheduled_at` suggested; admin assigns technician.

---

# 14. Roadmap for APIs beyond MVP (brief)

- Payment integration endpoints & webhooks (`/payments/*`).
- Subscriptions and billing (webhooks, retry logic).
- Advanced search (ElasticSearch).
- B2B quoting & PO endpoints.
- Partner API for technicians.

---

# 15. Appendix: Sample Requests & Responses

### Create Product (Admin)

**Request**

```http
POST /api/v1/admin/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Ultra RO 5-stage",
  "description": "Reverse osmosis system...",
  "category_id": 3,
  "specs": { "type": "RO", "flow_lph": 200, "materials": ["stainless"], "compatibility": ["Model-A"] },
  "warranty_months": 24,
  "is_part": false
}
```

**Response**
`201 Created`

```json
{
  "id": 12,
  "sku": "UF-RO-5-001",
  "title": "Ultra RO 5-stage",
  "description": "...",
  "warranty_months": 24
}
```

### Activate Warranty

**Request**

```http
POST /api/v1/warranty/activate
Content-Type: application/json

{
  "order_number": "WF-20250913-001",
  "product_id": 12,
  "serial_number": "SN-UF-0001",
  "email": "customer@example.com"
}
```

**Response**
`201 Created`

```json
{
  "warranty_id": 45,
  "product_id": 12,
  "serial_number": "SN-UF-0001",
  "activated_at": "2025-09-13T11:00:00Z",
  "expires_at": "2027-09-13T11:00:00Z"
}
```

---

# 16. Final Notes & Recommendations

- The proposed API design is intentionally pragmatic for the MVP: keep search in Postgres, payments out of the MVP scope (but design order model to accept payment metadata later), and implement warranty activation as a low-friction flow (order id + serial).
- Use TypeORM migrations and transactions for critical flows (orders, stock).
- Keep admin endpoints protected and build admin UI in Next.js for convenience.
- Start with direct DB-backed carts; move to Redis if performance needs grow.
- Instrument early: logging and error tracking will prevent operational surprises.
