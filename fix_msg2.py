import re

with open('server/controllers/messageController.ts', 'r') as f:
    content = f.read()

new_mark = """export const markAllMessagesRead = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { inquiry_id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    
    const { error } = await supabase.from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('inquiry_id', inquiry_id)
      .is('read_at', null)
      .neq('sender_id', user_id);
      
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};"""

content = content + "\n" + new_mark

with open('server/controllers/messageController.ts', 'w') as f:
    f.write(content)

with open('server/routes/messageRoutes.ts', 'r') as f:
    routes = f.read()

routes = routes.replace("markMessageRead,", "markMessageRead, markAllMessagesRead,")
routes = routes.replace("router.patch('/:message_id/read', requireAuth, markMessageRead);", "router.patch('/:message_id/read', requireAuth, markMessageRead);\nrouter.patch('/inquiry/:inquiry_id/read', requireAuth, markAllMessagesRead);")

with open('server/routes/messageRoutes.ts', 'w') as f:
    f.write(routes)
