import re

with open('src/pages/public/ProductDetails.tsx', 'r') as f:
    content = f.read()

contact_buttons = """                {/* Call Seller */}
                <div className="w-full">
                  {product.sellers?.phone_number ? (
                    isMobile ? (
                      <a href={`tel:${product.sellers.phone_number}`} className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        📞 Phone Number: {product.sellers.phone_number}
                      </a>
                    ) : (
                      <button onClick={() => setShowPhoneModal(true)} className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        📞 Phone Number: {product.sellers.phone_number}
                      </button>
                    )
                  ) : null}
                </div>

                {/* WhatsApp */}
                <div className="w-full">
                  {product.sellers?.whatsapp_number || product.sellers?.phone_number ? (
                    <a href={`https://wa.me/${(product.sellers.whatsapp_number || product.sellers.phone_number).replace(/\\+/g, '')}`} target="_blank" rel="noreferrer" className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors border-green-200">
                      💬 WhatsApp: {product.sellers.whatsapp_number || product.sellers.phone_number}
                    </a>
                  ) : (
                    <div className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50">
                      WhatsApp number not available.
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="w-full">
                  {product.sellers?.email ? (
                    <a href={`mailto:${product.sellers.email}`} className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                      📧 Email: {product.sellers.email}
                    </a>
                  ) : (
                    <div className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50">
                      Email not available.
                    </div>
                  )}
                </div>"""

# Remove the old buttons
pattern = r'                \{product\.sellers\?\.phone_number && \(\s*<a href=\{`tel:\$\{product\.sellers\.phone_number\}`\}.*?</button>\s*</button>\s*\{product\.sellers\?\.phone_number.*?</button>\s*\{product\.sellers\?\.email.*?</button>\s*\)\}'
# Wait, the old buttons are simple <a> tags.
old_buttons = r"""                \{product\.sellers\?\.phone_number && \(\s*<a href=\{`tel:\$\{product\.sellers\.phone_number\}`\}.*?</a>\s*\)\}\s*\{product\.sellers\?\.phone_number && \(\s*<a href=\{`https://wa\.me/\$\{product\.sellers\.phone_number.*?\s*WhatsApp\s*</a>\s*\)\}\s*\{product\.sellers\?\.email && \(\s*<a href=\{`mailto:\$\{product\.sellers\.email\}`\}.*?Email\s*</a>\s*\)\}"""

content = re.sub(old_buttons, contact_buttons, content, flags=re.DOTALL)

phone_modal = """
      {showPhoneModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all p-6 text-center">
             <h3 className="text-xl font-bold text-slate-900 mb-2">Seller Phone Number</h3>
             <p className="text-3xl font-extrabold text-emerald-600 mb-6 py-4 bg-slate-50 rounded-xl tracking-wider">{product?.sellers?.phone_number}</p>
             <button onClick={() => setShowPhoneModal(false)} className="w-full px-5 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">Close</button>
          </div>
        </div>
      )}
"""

content = content.replace("    </div>\n  );\n}", phone_modal + "    </div>\n  );\n}")

with open('src/pages/public/ProductDetails.tsx', 'w') as f:
    f.write(content)
