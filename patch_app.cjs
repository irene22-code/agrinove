const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "import { AuthProvider } from './contexts/AuthContext';",
  "import { AuthProvider } from './contexts/AuthContext';\nimport { LanguageProvider } from './contexts/LanguageContext';"
);

content = content.replace(
  "<AuthProvider>",
  "<LanguageProvider>\n    <AuthProvider>"
);

content = content.replace(
  "</AuthProvider>",
  "</AuthProvider>\n    </LanguageProvider>"
);

fs.writeFileSync('src/App.tsx', content);
