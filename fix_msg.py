import re

with open('server/controllers/messageController.ts', 'r') as f:
    content = f.read()

content = content.replace("is_read: false", "read_at: null")
content = content.replace("is_read: true", "read_at: new Date().toISOString()")

with open('server/controllers/messageController.ts', 'w') as f:
    f.write(content)

