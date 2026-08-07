export const databaseSchemaDoc = `
# Phase 2: Final Database Architecture & Security Strategy

## 1. Complete Database Schema Overview (PostgreSQL)
AgroMart's final schema implements a robust data model to support a full-scale agricultural marketplace, handling everything from user verification to order processing and system auditing.

### Core Entities & Relationships:
* **\`users\`**: Extends \`auth.users\`. Base table containing role, name, email, and authentication data.
* **\`buyers\`**: 1-to-1 extension of \`users\`. Contains shipping/billing addresses and preferences.
* **\`sellers\`**: 1-to-1 extension of \`users\`. Contains business details, tax ID, verification status, and ratings.
* **\`categories\`**: Hierarchical taxonomy for products (parent/child relationships).
* **\`products\`**: Inventory items relating to sellers and categories.
* **\`product_images\`**: 1-to-M relationship with \`products\` to support image galleries, sorting, and primary image flags.
* **\`favorites\`**: M-to-M junction between \`users\` and \`products\`.
* **\`inquiries\` & \`messages\`**: Secure, threaded messaging system. \`inquiries\` define the thread (buyer, seller, product), and \`messages\` hold the individual chat bubbles.
* **\`orders\` & \`order_items\`**: Transactional core. Tracks payment status, shipping details, and relates to buyers and sellers. \`order_items\` freeze unit prices and quantities at the time of purchase.
* **\`reviews\`**: Buyer feedback on products, enforcing a strict 1-review-per-buyer-per-product rule.
* **\`notifications\`**: In-app user notifications for order updates and messages.
* **\`contact_messages\`**: Public support requests intended for administrators.
* **\`system_settings\`**: JSON-based dynamic configuration store for the admin panel.
* **\`audit_logs\`**: Immutable security logging for tracking critical system actions.

## 2. Supabase Authentication Structure
* **Trigger-Based Provisioning:** The \`handle_new_user\` Postgres trigger listens for new sign-ups in \`auth.users\`. Depending on the requested role, it automatically provisions the base \`public.users\` record, and explicitly provisions either a pending \`public.sellers\` record or a \`public.buyers\` record.

## 3. Row Level Security (RLS) Matrix
Every single table operates under strict Row Level Security (RLS) to enforce multi-tenant isolation.

### Buyer Context
* **Profiles:** Can read and update their own \`users\` and \`buyers\` records.
* **Orders:** Can create orders and view orders where they are the \`buyer_id\`.
* **Messaging:** Can initiate \`inquiries\` and send \`messages\` to threads they belong to.
* **Interaction:** Can leave \`reviews\` and manage their own \`favorites\`.

### Seller Context
* **Profiles:** Can read and update their own \`users\` and \`sellers\` records.
* **Products:** Can insert, update, and delete \`products\` and \`product_images\` *only* if their seller \`status\` is \`verified\`.
* **Orders:** Can view and update (status tracking) \`orders\` where they are the \`seller_id\`.
* **Messaging:** Can respond to \`inquiries\` and send \`messages\` to threads involving their products.

### Admin Context
* **Full Access:** Handled via the \`public.is_admin()\` SQL helper. Admins can bypass restrictions to moderate products, suspend users, update categories, read audit logs, and modify system settings.

## 4. Storage Buckets Strategy
Supabase Storage is partitioned by privacy requirements:

| Bucket Name | Accessibility | Upload Constraints | Usage |
| :--- | :--- | :--- | :--- |
| **\`avatars\`** | Public Read | Authenticated | Profile pictures. |
| **\`product-images\`** | Public Read | Sellers (Verified) | Product gallery assets. |
| **\`verification-docs\`** | Private | Sellers & Admins | Sensitive KYC/KYB documents (Business licenses). |

## 5. Security & Integrity Highlights
1. **Auditing:** The \`audit_logs\` table is append-only for standard users (via backend service role) and read-only for admins.
2. **Cascading Deletions:** \`ON DELETE CASCADE\` is strictly applied (e.g., deleting a product deletes its images and favorites). \`ON DELETE RESTRICT\` is applied to critical financial records (orders cannot be deleted if a product or buyer is removed).
3. **Data Freezing:** The \`order_items\` table captures \`unit_price\` at the exact time of purchase, preventing historical orders from changing if a seller later updates a product's price.
`;
