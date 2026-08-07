export const backendPhase4Doc = `
# Phase 4: Product & Inventory APIs

## 1. Product Management APIs
A comprehensive suite of RESTful endpoints has been developed for product and inventory management.

### Public Endpoints (Accessible by Guests and Buyers)
* \`GET /api/products\`: Retrieves a list of products. Supports rich querying:
  * **Filtering**: By \`category\`, \`min_price\`, \`max_price\`, \`seller_id\`, \`status\`.
  * **Search**: Semantic title search via \`ilike\`.
  * **Relations**: Includes nested seller info (business name, rating) and category info.
* \`GET /api/products/:id\`: Retrieves a single product with full relational data, including product image galleries and reviews.

### Protected Seller Endpoints
* \`POST /api/products\`: Creates a new product. Validates that the requesting seller is verified.
* \`PUT /api/products/:id\`: Updates product details. Validates ownership against \`req.user.sub\`.
* \`DELETE /api/products/:id\`: Deletes a product.
* \`PATCH /api/products/:id/status\`: Updates visibility status (\`active\`, \`inactive\`, \`sold_out\`, \`archived\`).
* \`POST /api/products/:id/images\`: Uploads multipart image data.
  * Utilizes \`multer\` for in-memory file parsing.
  * Streams securely to the Supabase \`product-images\` Storage Bucket.
  * Saves public URLs and metadata into the \`product_images\` relational table.

## 2. Inventory & Dashboard APIs
* \`PATCH /api/products/:id/stock\`: Updates stock quantity. 
  * Automatically writes a permanent, immutable record to the \`audit_logs\` table ensuring full traceability of inventory adjustments.
* \`GET /api/seller/stats\`: Aggregation endpoint powering the Seller Dashboard. Computes:
  * Total, active, low stock (<= 10), and out of stock products.
  * Pending orders and total realized revenue (from paid orders).
  * Unread buyer inquiries.

## 3. Security Implementation
* **Role-Based Routing**: All write operations for products are heavily guarded by the \`requireRole(['seller'])\` middleware.
* **Ownership Enforcement**: The API strictly enforces that a seller can only update, delete, or upload images for products where \`seller_id\` exactly matches the decoded JWT's \`sub\` claim. Admin clients are used safely because ownership checks are manually asserted in the controller logic.

## Next Steps:
With the Product catalog and Inventory engines functional, we are prepared to move to:
* **Buyer APIs**: Favorites and Inquiries.
* **Order Management APIs**: Buyer checkout and Seller fulfillment logic.
`;
