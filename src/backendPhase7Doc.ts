export const backendPhase7Doc = `
# Phase 7: Admin Panel APIs and Platform Management

## 1. Admin Authentication & Security
* **Role Verification**: A global middleware \`requireRole(['admin'])\` is applied to the \`/api/admin/*\` router, ensuring only highly privileged users can access management endpoints.
* **Audit Logging**: Sensitive operations like updating a seller's verification status, modifying a product's state, or updating system settings automatically write immutable records to the \`audit_logs\` table for security traceability.

## 2. Admin Dashboard & Analytics (\`/api/admin/dashboard\`)
* The dashboard API performs concurrent aggregations across the entire platform, utilizing Supabase's \`{ count: 'exact', head: true }\` for optimal performance.
* Returns real-time metrics for Total Users, Buyers, Sellers, Products, Orders, Categories, Reviews, and Inquiries.

## 3. User & Seller Management
* \`GET /api/admin/users\`: Retrieves the global user roster, sortable and filterable by role.
* \`PATCH /api/admin/users/:id/status\`: Adjusts a user's role (e.g., suspending a user by changing their role).
* \`PATCH /api/admin/sellers/:id/verify\`: A crucial workflow API allowing administrators to transition a seller's status from \`pending\` to \`verified\`, which unlocks their ability to create products on the platform.

## 4. Platform Catalog Management
* **Products**: Admins can view the entire global catalog (\`GET /api/admin/products\`) and forcefully update the status of any product (\`PATCH /api/admin/products/:id/status\`) to \`rejected\` or \`archived\` in response to moderation flags.
* **Categories**:
  * \`GET /api/categories\` is exposed as a public endpoint for the buyer/seller UI.
  * \`POST\`, \`PUT\`, and \`DELETE\` operations on categories are strictly protected under the \`/api/admin/categories\` router.

## 5. System Settings & Configuration (\`/api/admin/settings\`)
* \`GET /api/admin/settings\`: Retrieves dynamic platform configuration (e.g., commission rates, site banners, contact emails).
* \`POST /api/admin/settings\`: Uses a Postgres UPSERT (\`onConflict: 'key'\`) pattern to cleanly manage key-value system parameters.

## Next Steps:
With the entire backend foundation—from authentication to commercial workflows, real-time messaging, and admin operations—complete and production-ready, we are prepared to move to:
* **Phase 8: React Frontend Integration and UI Development**.
`;
