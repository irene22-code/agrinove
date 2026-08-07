export const backendPhase5Doc = `
# Phase 5: Buyer APIs and Order Management

## 1. Buyer Profile & Dashboard APIs
The Buyer experience is now supported by a dedicated suite of APIs managing preferences, profiles, and interactions.

### Buyer Endpoints (\`/api/buyer\`)
* \`PUT /profile\`: Updates the buyer's profile (name, phone, farm size, location).
* \`GET /stats\`: Aggregates dashboard statistics (Total Orders, Active Orders, Favorites Count, Unread Notifications) allowing a rich client-side dashboard experience.
* \`GET /favorites\`: Retrieves the buyer's saved/wishlisted products, including nested product details and images.
* \`POST /favorites\`: Adds a product to the buyer's wishlist.
* \`DELETE /favorites/:id\`: Removes a product from the wishlist, validating ownership before deletion.
* \`GET /inquiries\`: Fetches all product inquiries sent by the buyer to sellers.
* \`GET /notifications\`: Retrieves all system notifications (order updates, etc.) for the user.
* \`PATCH /notifications/:id/read\`: Marks a specific notification as read.

## 2. Order Management & Checkout Flow
A robust order management system has been implemented enabling direct buyer-to-seller transactions.

### Order Endpoints (\`/api/orders\`)
* \`POST /\` (Checkout): Creates a new order. 
  * Accepts the seller ID, total amount, shipping address, and an array of order items.
  * Inserts the master order record and cascades inserts into \`order_items\`.
  * Automatically provisions a real-time Notification for the seller that a new order has arrived.
* \`GET /buyer\`: Retrieves all orders placed by the authenticated buyer, including seller business names.
* \`GET /seller\`: Retrieves all orders received by the authenticated seller, including buyer names.
* \`GET /:id\`: Retrieves granular order details (items, pricing, shipping info). Protected dynamically to ensure only the participating buyer or seller can view the invoice.
* \`PATCH /:id/status\`: Allows the Seller to progress the order through fulfillment states (\`pending\` -> \`confirmed\` -> \`processing\` -> \`shipped\` -> \`delivered\`). Triggers an automatic notification to the buyer upon status change.
* \`PATCH /:id/cancel\`: Allows the Buyer to cancel the order, but strictly only if the status is still \`pending\`. Triggers a notification to the seller.

## 3. Security Implementation
* **Role Verification**: Routes are strictly partitioned using the \`requireRole(['buyer'])\` and \`requireRole(['seller'])\` middlewares.
* **Data Isolation**: Controllers manually assert ownership. For example, an order cancellation checks that \`req.user.sub === order.buyer_id\`.
* **Transactional Integrity**: Order creation handles both the master record and the line items, acting as the foundation for the checkout flow without requiring immediate online payment (acting as a direct connection/invoice system).

## Next Steps:
The core commercial loop (List -> Discover -> Order -> Fulfill) is fully operational. We are now ready to implement:
* **Phase 6: Messaging System**: Real-time buyer/seller communication and chat APIs.
`;
