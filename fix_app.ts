import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const adminImports = `
import AdminPlantHealth from './pages/admin/AdminPlantHealth';
import AddEditPlantHealth from './pages/admin/AddEditPlantHealth';
`;

const publicImports = `
import PlantHealthGuide from './pages/public/PlantHealthGuide';
import PlantHealthDetails from './pages/public/PlantHealthDetails';
`;

content = content.replace("import AdminMarketPrices from './pages/admin/AdminMarketPrices';", "import AdminMarketPrices from './pages/admin/AdminMarketPrices';\n" + adminImports);
content = content.replace("import { MarketPrices } from './pages/public/MarketPrices';", "import { MarketPrices } from './pages/public/MarketPrices';\n" + publicImports);

const adminRoutes = `
          <Route path="/admin/plant-health" element={<AdminPlantHealth />} />
          <Route path="/admin/plant-health/new" element={<AddEditPlantHealth />} />
          <Route path="/admin/plant-health/:id/edit" element={<AddEditPlantHealth />} />
`;
content = content.replace('<Route path="/admin/market-prices" element={<AdminMarketPrices />} />', '<Route path="/admin/market-prices" element={<AdminMarketPrices />} />\n' + adminRoutes);

const publicRoutes = `
        <Route path="/plant-health" element={<PlantHealthGuide />} />
        <Route path="/plant-health/:slug" element={<PlantHealthDetails />} />
`;
content = content.replace('<Route path="/market-prices" element={<MarketPrices />} />', '<Route path="/market-prices" element={<MarketPrices />} />\n' + publicRoutes);

fs.writeFileSync('src/App.tsx', content);
