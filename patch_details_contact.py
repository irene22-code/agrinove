import re

with open('src/pages/public/ProductDetails.tsx', 'r') as f:
    content = f.read()

contact_state = """  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  // Basic mobile check
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
"""

content = re.sub(r'  const \[showInquiryModal, setShowInquiryModal\] = useState\(false\);', contact_state, content)

contact_buttons = """                {/* Call Seller */}
                <div className="w-full">
                  {product.sellers?.phone_number ? (
                    isMobile ? (
                      <a href={`tel:${product.sellers.phone_number}`} className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        📞 Phone Number: <br/>{product.sellers.phone_number}
                      </a>
                    ) : (
                      <button onClick={() => setShowPhoneModal(true)} className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        📞 Phone Number: <br/>{product.sellers.phone_number}
                      </button>
                    )
                  ) : null}
                </div>

                {/* WhatsApp */}
                <div className="w-full">
                  {product.sellers?.whatsapp_number || product.sellers?.phone_number ? (
                    <a href={`https://wa.me/${(product.sellers.whatsapp_number || product.sellers.phone_number).replace(/\\+/g, '')}`} target="_blank" rel="noreferrer" className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors border-green-200">
                      💬 WhatsApp: <br/>{product.sellers.whatsapp_number || product.sellers.phone_number}
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
                      📧 Email: <br/>{product.sellers.email}
                    </a>
                  ) : (
                    <div className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50">
                      Email not available.
                    </div>
                  )}
                </div>"""

content = re.sub(r'                \{product\.sellers\?\.phone_number && \(\s*<a href=\{`tel:\$\{product\.sellers\.phone_number\}`\}.*?</button>\s*\{product\.sellers\?\.phone_number.*?</button>\s*\{product\.sellers\?\.phone_number.*?</button>\s*\{product\.sellers\?\.email.*?</button>\s*\)\}', contact_buttons, content, flags=re.DOTALL)

# Wait, the regex replacement string needs to match the actual code correctly.
# Let's replace the whole section starting from <button ... Send Inquiry to the end of the email link.
