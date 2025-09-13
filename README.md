# Almuetasim API

This is the backend for **Almuetasim**, a minimal e-commerce platform specialized in selling water filters, replacement parts, and providing installation and maintenance services. It powers the online store, manages products, categories, orders, warranties, and customer interactions.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Commands](#commands)
- [Git Hooks](#git-hooks)

---

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, create a `.env` file from the `.env.example` file and fill in the required environment variables.

Finally, run the development server:

```bash
pnpm run start:dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Project Overview

**Almuetasim** is a minimal e-commerce solution for water filter products. It allows customers to browse products and categories, search and filter items (price, filter type, flow rate, lifetime, etc.), and contact support.

Future enhancements will support order management, payments, and product warranty activation. The platform is designed to be **scalable**, **secure**, and **easy to use**.

---

## Features

- **Product Catalog:** Browse products by categories (filters, replacement parts, dispensers). View detailed product pages with specs and certifications.
- **Search & Filtering:** Search products by text and filter by price, filter levels, and other attributes (flow rate, lifetime, compatibility).
- **Contact & Support:** Customers can reach out for inquiries, troubleshooting, or installation requests.
- **Warranty Activation (Planned):** Customers can activate product warranties by scanning a QR code or entering the serial number with proof of purchase.
- **Orders (Planned):** Create, manage, and track customer orders.
- **Cart & Checkout (Planned):** Add products to cart, checkout, and choose payment methods.
- **Payments (Planned):** Integrate with local payment gateways for card, wallet, or cash-on-delivery.

---

## User Roles

- **Guest/Visitor:** Can browse products, categories, and search/filter items. Can contact support.
- **Registered Customer:** Can place orders, manage cart, activate warranties, and request installation/maintenance.
- **Admin:** Can manage products, categories, orders, warranties, and user accounts.

---

## Database Schema

- **Users:** `id`, `name`, `email`, `password_hash`, `phone`, `address`, `role`, `created_at`, `updated_at`
- **Products:** `id`, `category_id`, `name`, `description`, `price`, `image_url`, `status`, `filter_type`, `flow_rate`, `lifetime`, `compatibility`, `created_at`, `updated_at`
- **Categories:** `id`, `name`, `description`, `created_at`, `updated_at`
- **Orders (Planned):** `id`, `user_id`, `status`, `total_price`, `payment_status`, `shipping_address`, `created_at`, `updated_at`
- **OrderItems (Planned):** `id`, `order_id`, `product_id`, `quantity`, `price`
- **Warranty (Planned):** `id`, `product_id`, `user_id`, `serial_number`, `purchase_date`, `activation_date`, `expiry_date`, `status`, `created_at`, `updated_at`
- **ContactMessages:** `id`, `user_id?`, `name`, `email`, `phone`, `message`, `created_at`

---

## API Documentation

The API documentation is generated using **Swagger** and is available at:

```
/docs
```

---

## Commands

- `pnpm install`: Install dependencies
- `pnpm run build`: Build the project
- `pnpm run lint`: Lint the codebase
- `pnpm run lint:fix`: Fix linting errors

---

## Git Hooks

This project uses Husky and lint-staged to automatically lint and format code before commits:

- **Pre-commit hook:** Runs ESLint and Prettier on staged files
- **Commit rejection:** Commits will be rejected if there are linting errors that can't be automatically fixed
