import re

# Update buyerController.ts to add deleteNotification
with open('server/controllers/buyerController.ts', 'r') as f:
    content = f.read()

new_delete = """export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    
    const { data: notification } = await supabase.from('notifications').select('user_id').eq('id', id).single();
    if (!notification || notification.user_id !== user_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
"""

content = content + "\n" + new_delete

with open('server/controllers/buyerController.ts', 'w') as f:
    f.write(content)

# Update buyerRoutes.ts
with open('server/routes/buyerRoutes.ts', 'r') as f:
    routes = f.read()

routes = routes.replace("markNotificationRead", "markNotificationRead, deleteNotification")
routes = routes.replace("router.patch('/notifications/:id/read', requireAuth, markNotificationRead);", "router.patch('/notifications/:id/read', requireAuth, markNotificationRead);\nrouter.delete('/notifications/:id', requireAuth, deleteNotification);")

with open('server/routes/buyerRoutes.ts', 'w') as f:
    f.write(routes)

