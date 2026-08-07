import re

with open('src/pages/buyer/BuyerOrderDetails.tsx', 'r') as f:
    content = f.read()

new_details = """        {/* Details footer */}
        <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Delivery Address</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">{order.customer_name}</p>
            <p className="text-slate-600 text-sm leading-relaxed">{order.street_address}, {order.sector}</p>
            <p className="text-slate-600 text-sm leading-relaxed">{order.district}, {order.city}</p>
            <p className="text-slate-600 text-sm leading-relaxed">{order.country}</p>
            {order.shipping_address && !order.street_address && (
              <p className="text-slate-600 text-sm leading-relaxed">{order.shipping_address}</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Payment Details</h3>
            <p className="text-sm text-slate-600 mb-1"><span className="font-semibold text-slate-700">Method:</span> {order.payment_method || 'N/A'}</p>
            <p className="text-sm text-slate-600 mb-4"><span className="font-semibold text-slate-700">Status:</span> {order.payment_status}</p>
            
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Seller Details</h3>
            <p className="text-slate-600 font-medium text-sm">{order.sellers?.business_name}</p>
            {order.sellers?.contact_email && <p className="text-sm text-slate-500">{order.sellers.contact_email}</p>}
          </div>
        </div>"""

content = re.sub(r'        \{\/\* Details footer \*\/\}\s*<div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">\s*<div>\s*<h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Shipping Address</h3>\s*<p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">\{order\.shipping_address \|\| \'No address provided\'\}</p>\s*</div>\s*<div>\s*<h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Seller Details</h3>\s*<p className="text-slate-600 font-medium">\{order\.sellers\?\.business_name\}</p>\s*\{order\.sellers\?\.contact_email && <p className="text-sm text-slate-500">\{order\.sellers\.contact_email\}</p>\}\s*</div>\s*</div>', new_details, content, flags=re.DOTALL)

content = content.replace("item.total_price", "item.subtotal")

with open('src/pages/buyer/BuyerOrderDetails.tsx', 'w') as f:
    f.write(content)
