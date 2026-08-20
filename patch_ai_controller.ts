import fs from 'fs';
const file = 'server/controllers/agromartAIController.ts';
let content = fs.readFileSync(file, 'utf8');

// Add a helper at the top to extract user id from auth header
const helper = `
import jwt from 'jsonwebtoken';

function getUserIdFromReq(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || '';
        const decoded: any = jwt.verify(token, jwtSecret);
        return decoded.sub || null;
    } catch(e) {
        return null;
    }
}
`;

content = content.replace("export const handleChat", helper + "\nexport const handleChat");

// Patch handleChat
content = content.replace(
  "const { message, conversationId, attachments = [], context, userId } = req.body;",
  "const { message, conversationId, attachments = [], context } = req.body;\n        const userId = getUserIdFromReq(req);"
);

// Patch getConversations
content = content.replace(
  "const { userId } = req.query;",
  "const userId = getUserIdFromReq(req);"
);

// Patch getConversation
content = content.replace(
  "const userId = req.query.userId;",
  "const userId = getUserIdFromReq(req);"
);

// Patch deleteConversation
content = content.replace(
  "const userId = req.query.userId;",
  "const userId = getUserIdFromReq(req);"
);

fs.writeFileSync(file, content);
