export const backendPhase3Doc = `
# Phase 3: Backend API Development (Part 1 - Authentication)

## 1. Backend Infrastructure Setup
The Express server environment has been successfully configured and structured for scalability.

### Directory Structure Implemented:
* **\`server/\`**
  * **\`config/\`**: Contains Supabase admin client initialization logic securely consuming service role keys.
  * **\`controllers/\`**: Contains route handlers containing business logic (\`authController.ts\`).
  * **\`middlewares/\`**: Contains Express middlewares (\`authMiddleware.ts\`).
  * **\`routes/\`**: Contains Express Router definitions mapping endpoints to controllers (\`authRoutes.ts\`).
  * **\`server.ts\`** (Root): Express app instantiation, global middleware (CORS, JSON), and dynamic route mounting.

## 2. Supabase Integration
* **Anon Client**: Utilized in the auth controller for public actions like \`signUp\` and \`signInWithPassword\`. This securely delegates hashing and credential management to Supabase Auth.
* **Admin Client**: Initialized via \`getAdminSupabaseClient()\` using the \`SUPABASE_SERVICE_ROLE_KEY\`. It bypasses RLS and is used strictly for internal backend data aggregation (e.g., aggregating buyer/seller profile data).

## 3. Authentication System Architecture
We have implemented a robust RESTful Authentication API wrapping Supabase Auth.

### Endpoints Created:
* **\`POST /api/auth/register/buyer\`**
  * Accepts: \`email\`, \`password\`, \`full_name\`.
  * Action: Registers via Supabase Auth, embedding \`full_name\` and \`role: 'buyer'\` into \`user_metadata\`. The Postgres Database Trigger automatically provisions the \`public.users\` and \`public.buyers\` records.
* **\`POST /api/auth/register/seller\`**
  * Accepts: \`email\`, \`password\`, \`full_name\`, \`business_name\`.
  * Action: Registers via Supabase Auth, embedding metadata. The trigger automatically creates a pending \`public.sellers\` record.
* **\`POST /api/auth/login\`**
  * Accepts: \`email\`, \`password\`.
  * Action: Authenticates via Supabase, returning the JWT session token.
* **\`POST /api/auth/logout\`**
  * Provides a standardized endpoint for clients to call when destroying their local session.
* **\`GET /api/auth/profile\`** (Protected)
  * Utilizes the \`requireAuth\` middleware to parse and verify the JWT.
  * Aggregates base \`users\` data with role-specific (\`buyers\` or \`sellers\`) data using the Admin client to return a unified profile payload.

## 4. Security Middlewares
* **\`requireAuth\`**: Express middleware that intercepts requests, extracts the \`Bearer\` token from the \`Authorization\` header, and securely verifies it against the \`JWT_SECRET\` utilizing the \`jsonwebtoken\` library. It attaches the decoded JWT payload to \`req.user\` for downstream controllers.
* **\`requireRole(roles)\`**: Role-Based Access Control (RBAC) middleware generator. Validates that the authenticated user possesses the required role (e.g., \`requireRole(['seller', 'admin'])\`) before allowing access to protected routes.

## Next Steps:
With Authentication fully established, we can now proceed to build the protected resource APIs:
* **Product APIs**: CRUD operations for inventory.
* **Seller Dashboard APIs**: Analytics and order fulfillment.
* **Buyer APIs**: Cart, Favorites, and Checkout.
`;
