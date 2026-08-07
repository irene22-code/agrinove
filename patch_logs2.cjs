const fs = require('fs');

// Patch AdminBuyers
let buyers = fs.readFileSync('src/pages/admin/AdminBuyers.tsx', 'utf8');
buyers = buyers.replace(
  'const handleDelete = async (id: string) => {',
  'const handleDelete = async (id: string) => { console.log("Delete clicked in AdminBuyers"); console.log("Buyer id:", id);'
);
buyers = buyers.replace(
  'const res = await api.delete',
  'console.log("Sending delete request to API for buyer", id); const res = await api.delete'
);
fs.writeFileSync('src/pages/admin/AdminBuyers.tsx', buyers);

// Patch AdminSellers
let sellers = fs.readFileSync('src/pages/admin/AdminSellers.tsx', 'utf8');
sellers = sellers.replace(
  'const handleDelete = async (id: string) => {',
  'const handleDelete = async (id: string) => { console.log("Delete clicked in AdminSellers"); console.log("Seller id:", id);'
);
sellers = sellers.replace(
  'const res = await api.delete',
  'console.log("Sending delete request to API for seller", id); const res = await api.delete'
);
fs.writeFileSync('src/pages/admin/AdminSellers.tsx', sellers);

// Patch AdminUsers
let users = fs.readFileSync('src/pages/admin/AdminUsers.tsx', 'utf8');
users = users.replace(
  'const handleDeleteUser = async (id: string) => {',
  'const handleDeleteUser = async (id: string) => { console.log("Delete clicked in AdminUsers"); console.log("User id:", id);'
);
users = users.replace(
  'await api.delete(`/admin/users/${id}`);',
  'console.log("Sending delete request to API for user", id); await api.delete(`/admin/users/${id}`); console.log("API request successful");'
);
fs.writeFileSync('src/pages/admin/AdminUsers.tsx', users);

// Patch Backend Routes
let routes = fs.readFileSync('server/routes/adminRoutes.ts', 'utf8');
routes = routes.replace(
  "router.delete('/users/:id', deleteUser);",
  "router.delete('/users/:id', (req, res, next) => { console.log('Admin route reached: DELETE /users/:id', req.params.id); next(); }, deleteUser);"
);
fs.writeFileSync('server/routes/adminRoutes.ts', routes);

// Patch Backend Controller
let controller = fs.readFileSync('server/controllers/adminController.ts', 'utf8');
controller = controller.replace(
  "export const deleteUser = async (req: Request, res: Response) => {\n  try {",
  "export const deleteUser = async (req: Request, res: Response) => {\n  console.log('Deleting user in controller, id:', req.params.id);\n  try {"
);
fs.writeFileSync('server/controllers/adminController.ts', controller);

