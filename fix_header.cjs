const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

content = content.replace(
  "const [categories, set{t('nav.categories')}]",
  "const [categories, setCategories]"
);

// We should also verify what else got replaced mistakenly.
// E.g., `Categories` in `Menu className="h-4 w-4 mr-1" /> Categories` is what we wanted.

fs.writeFileSync('src/components/layout/Header.tsx', content);
