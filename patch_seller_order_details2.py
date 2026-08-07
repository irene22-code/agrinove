import re

with open('src/pages/seller/SellerOrderDetails.tsx', 'r') as f:
    content = f.read()

items_replacement = """        <div className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Order Items</h3>
          <ul className="divide-y divide-slate-200">
            {order.order_items?.map((item: any) => {
               const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary)?.url || item.products?.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
               return (
                 <li key={item.id} className="py-4 flex flex-col sm:flex-row justify-between gap-4">
                   <div className="flex items-start gap-4">
                     <div className="h-16 w-16 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex-shrink-0">
                       <img src={primaryImage} alt={item.products?.title} className="h-full w-full object-cover" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-900">{item.products?.title}</p>
                       <p className="text-sm text-slate-500 mt-1">ID: {String(item.product_id).substring(0,8)}</p>
                       {item.products?.category && <p className="text-xs text-slate-500 mt-1">Category: {item.products?.category}</p>}
                       <p className="text-sm text-slate-700 mt-1">Qty: {item.quantity}</p>
                     </div>
                   </div>
                   <div className="text-left sm:text-right">
                     <p className="text-sm text-slate-500">${item.unit_price} each</p>
                     <p className="text-base font-bold text-slate-900 mt-1">${item.subtotal}</p>
                   </div>
                 </li>
               );
            })}
          </ul>
        </div>"""

content = re.sub(r'        <div className="p-6">\s*<h3 className="text-lg font-medium text-slate-900 mb-4">Order Items</h3>.*?<\/div>', items_replacement, content, flags=re.DOTALL)

with open('src/pages/seller/SellerOrderDetails.tsx', 'w') as f:
    f.write(content)
