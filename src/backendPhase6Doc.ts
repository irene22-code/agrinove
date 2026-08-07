export const backendPhase6Doc = `
# Phase 6: Messaging System & Real-time Communication

## 1. Inquiry System (\`/api/inquiries\`)
The inquiry system serves as the foundation for communication threads, linking a buyer, a seller, and a specific product.
* \`POST /\`: Initiates a new product inquiry. (Buyer only). Automatically creates the first message in the thread and dispatches a notification to the seller.
* \`GET /\`: Fetches all inquiries. Automatically filtered by role; returns buyer's inquiries if the requester is a buyer, or seller's inquiries if a seller. Retrieves nested product and user details.
* \`GET /:id\`: Retrieves detailed inquiry metadata. Strictly verifies that the requester is a participant (either the buyer or the seller).
* \`PATCH /:id/status\`: Updates the inquiry status (\`pending\`, \`read\`, \`responded\`, \`closed\`). Access is restricted to the thread participants.

## 2. Messaging API (\`/api/messages\`)
Handles individual chat bubbles within an inquiry thread.
* \`GET /inquiry/:inquiry_id\`: Retrieves the chronological message history for a specific inquiry thread. Includes the sender's full name. Access is strictly controlled to thread participants.
* \`POST /inquiry/:inquiry_id\`: Sends a new message in the thread. Automatically toggles the inquiry status (e.g., to \`responded\` or \`pending\`) based on the sender's role, and dispatches a notification to the counterparty.
* \`PATCH /:message_id/read\`: Marks a specific message as read. Validates that the requester is a thread participant and ensures a user cannot mark their own messages as read.
* \`DELETE /:message_id\`: Deletes a message. Strictly verifies that the requester is the original sender.

## 3. Real-time Infrastructure & Notifications
* **Notifications**: Integrated directly into the message sending flow. When a message is sent or an inquiry is created, a record is inserted into the \`notifications\` table targeting the recipient.
* **Real-time Preparedness**: The schema for \`messages\`, \`inquiries\`, and \`notifications\` is fully prepared for Supabase Realtime subscriptions. Clients can subscribe to \`postgres_changes\` events on these tables using their Supabase Anon Keys to receive instantaneous UI updates as new records are inserted by the backend APIs.

## Next Steps:
With the entire commercial and communication lifecycle completed, we are now ready to implement:
* **Phase 7: Admin Panel APIs and Platform Management**: System settings, moderation, and auditing.
`;
