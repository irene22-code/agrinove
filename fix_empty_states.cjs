const fs = require('fs');
let content = fs.readFileSync('src/pages/public/CropCalendar.tsx', 'utf8');

// Fix Before You Plant empty state
content = content.replace(
  /<p className="text-sm text-gray-500 italic">Nta makuru mashya ahari ubu\.<\/p>/g,
  '<p className="text-sm text-gray-500 italic">No current advisory available for your selected location and season.</p>'
);

// Fix Agriculture Alerts empty state
// It looks like Alerts is at line 282. Let's check how it's rendered.
