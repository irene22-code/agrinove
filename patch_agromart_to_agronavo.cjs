const fs = require('fs');

const filesToUpdate = [
  'src/pages/public/About.tsx',
  'src/pages/public/Contact.tsx',
  'src/pages/public/CropCalendar.tsx',
  'src/pages/public/PlantHealthGuide.tsx',
  'src/pages/public/PlantHealthDetails.tsx',
  'src/pages/public/ProductListing.tsx',
  'src/pages/public/ProductDetails.tsx',
  'src/pages/public/MarketPrices.tsx',
  'src/components/layout/Footer.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replaceAll('AgroMart', 'AgroNavo');
    
    if (file === 'src/components/layout/Footer.tsx') {
        content = content.replaceAll('emerald-600', 'green-600');
        content = content.replaceAll('emerald-500', 'green-500');
        content = content.replaceAll('emerald-400', 'green-400');
        content = content.replaceAll('emerald-900', 'green-900');
        
        // Wrap text in translations for footer
        // Just keeping it simple for now, maybe translating common things
    }
    
    fs.writeFileSync(file, content);
  }
});
