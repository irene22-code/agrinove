import re
with open('server/controllers/productController.ts', 'r') as f:
    content = f.read()

new_upload = """export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files provided' });
    }

    const supabase = getAdminSupabaseClient();
    
    // Check ownership
    const { data: product } = await supabase.from('products').select('seller_id').eq('id', id).single();
    if (!product || product.seller_id !== seller_id) { 
      return res.status(403).json({ success: false, error: 'Unauthorized to add images to this product' });
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
      const fileName = `${id}/${Date.now()}_${sanitizedName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      
      const { data: imageRec, error: dbError } = await supabase.from('product_images').insert({
        product_id: id,
        url: publicUrl,
        is_primary: i === 0, // First uploaded image is primary
        alt_text: file.originalname
      }).select().single();
      
      if (dbError) throw dbError;
      uploadedImages.push(imageRec);
    }

    res.status(201).json({ success: true, data: uploadedImages });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const uploadProductImage = async.*?res\.status\(400\)\.json\(\{ success: false, error: error\.message \}\);\s*\}\s*\};', new_upload, content, flags=re.DOTALL)

with open('server/controllers/productController.ts', 'w') as f:
    f.write(content)
