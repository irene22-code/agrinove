import re
with open('server/controllers/inquiryController.ts', 'r') as f:
    content = f.read()

content = content.replace("is_read: false", "read_at: null")

with open('server/controllers/inquiryController.ts', 'w') as f:
    f.write(content)
