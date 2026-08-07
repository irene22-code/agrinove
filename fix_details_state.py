import re
with open('src/pages/public/ProductDetails.tsx', 'r') as f:
    content = f.read()

state_replacement = """  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  // Basic mobile check
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
"""

content = re.sub(r'  const \[showInquiryModal, setShowInquiryModal\] = useState\(false\);', state_replacement, content)

content = content.replace("email: string;", "email: string;\n    whatsapp_number?: string;")

with open('src/pages/public/ProductDetails.tsx', 'w') as f:
    f.write(content)
