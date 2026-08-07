import re

with open('src/pages/buyer/BuyerOrderDetails.tsx', 'r') as f:
    content = f.read()

items_replacement = """        {/* Order Items */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Items in Order</h3>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => {
               const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary)?.url || item.products?.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
               return (
                 <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 gap-4">
                   <div className="flex items-start gap-4">
                     <div className="h-20 w-20 bg-white rounded border border-slate-200 overflow-hidden flex-shrink-0">
                       <img src={primaryImage} alt={item.products?.title} className="h-full w-full object-cover" />
                     </div>
                     <div>
                       <Link to={`/products/${item.product_id}`} className="font-bold text-slate-900 hover:text-emerald-600 line-clamp-1 text-lg">
                         {item.products?.title}
                       </Link>
                       <p className="text-sm text-slate-600 line-clamp-2 mt-1">{item.products?.description}</p>
                       <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                         {item.products?.category && <span className="bg-slate-200 px-2 py-0.5 rounded-full">{item.products?.category}</span>}
                         {item.products?.brand && <span>Brand: <span className="font-medium text-slate-700">{item.products?.brand}</span></span>}
                         <span>ID: <span className="font-mono">{String(item.product_id).substring(0,8)}</span></span>
                       </div>
                       {item.products?.sellers && (
                          <div className="mt-1 text-xs text-slate-500">
                            Seller: <span className="font-medium text-emerald-700">{item.products.sellers.business_name}</span>
                          </div>
                       )}
                     </div>
                   </div>
                   <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end">
                     <div>
                       <p className="text-sm text-slate-500">${item.unit_price} each × {item.quantity}</p>
                       <p className="font-bold text-slate-900 text-lg mt-1">${item.subtotal}</p>
                     </div>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>"""

content = re.sub(r'        \{\/\* Order Items \*\/\}\s*<div className="p-6 border-b border-slate-200">.*?<\/div>\s*<\/div>', items_replacement, content, flags=re.DOTALL)

with open('src/pages/buyer/BuyerOrderDetails.tsx', 'w') as f:
    f.write(content)
