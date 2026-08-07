import re

with open('server/controllers/categoryController.ts', 'r') as f:
    content = f.read()

# Add standard CRUD for categories
if "export const createCategory" not in content:
    crud = """
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, parent_id, icon_url } = req.body;
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('categories').insert({
      name, slug, description, parent_id, icon_url
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
"""
    content += crud

with open('server/controllers/categoryController.ts', 'w') as f:
    f.write(content)

with open('server/routes/categoryRoutes.ts', 'r') as f:
    routes = f.read()

if "createCategory" not in routes:
    routes = routes.replace("import { getCategories, getCategoryBySlug } from '../controllers/categoryController';", "import { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';\nimport { requireAuth, requireRole } from '../middlewares/authMiddleware';")
    routes += """
router.post('/', requireAuth, requireRole(['admin']), createCategory);
router.put('/:id', requireAuth, requireRole(['admin']), updateCategory);
router.delete('/:id', requireAuth, requireRole(['admin']), deleteCategory);
"""
    
with open('server/routes/categoryRoutes.ts', 'w') as f:
    f.write(routes)
