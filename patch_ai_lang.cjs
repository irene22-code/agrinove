const fs = require('fs');

let content = fs.readFileSync('src/components/ai/AgroMartAI.tsx', 'utf8');

if (!content.includes('useLanguage')) {
  content = content.replace(
    "import { Send, X, MessageSquare, Bot, Mic, Loader2, Trash2, Paperclip, Plus } from 'lucide-react';",
    "import { Send, X, MessageSquare, Bot, Mic, Loader2, Trash2, Paperclip, Plus } from 'lucide-react';\nimport { useLanguage } from '../../contexts/LanguageContext';"
  );
  
  content = content.replace(
    "export function AgroMartAI() {",
    "export function AgroMartAI() {\n  const { t } = useLanguage();"
  );
  
  content = content.replace("placeholder=\"Ask AgroNavo AI...\"", "placeholder={t('ai.ask')}");
  content = content.replace("AgroMart AI is thinking...", "{t('ai.thinking')}");
}

fs.writeFileSync('src/components/ai/AgroMartAI.tsx', content);
