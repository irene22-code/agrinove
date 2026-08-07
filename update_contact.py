import re

with open('src/pages/public/Contact.tsx', 'r') as f:
    content = f.read()

# Add import
if "import { api }" not in content:
    content = content.replace("import { CheckCircle } from 'lucide-react';", "import { CheckCircle } from 'lucide-react';\nimport { api } from '../../lib/api';")

# Add formData state
if "const [formData" not in content:
    content = content.replace("const [isSubmitted, setIsSubmitted] = useState(false);", "const [isSubmitted, setIsSubmitted] = useState(false);\n  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {\n    setFormData({ ...formData, [e.target.id]: e.target.value });\n  };")

# Replace handleSubmit
new_handle_submit = """const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post<{success: boolean}>('/contact', formData);
      if (res.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Failed to send message.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };"""

content = re.sub(r'const handleSubmit = \(e: React\.FormEvent\) => \{.*?\}, 1000\);\s*\};', new_handle_submit, content, flags=re.DOTALL)

# Update inputs to use formData
content = content.replace('id="name" className=', 'id="name" value={formData.name} onChange={handleChange} className=')
content = content.replace('id="email" className=', 'id="email" value={formData.email} onChange={handleChange} className=')
content = content.replace('id="subject" className=', 'id="subject" value={formData.subject} onChange={handleChange} className=')
content = content.replace('id="message" rows={4} className=', 'id="message" rows={4} value={formData.message} onChange={handleChange} className=')

with open('src/pages/public/Contact.tsx', 'w') as f:
    f.write(content)
