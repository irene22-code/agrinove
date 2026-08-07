const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminProducts.tsx', 'utf8');
const modal = `
      {/* Delete Product Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Product</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete this product? This is a destructive action.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setProductToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                Cancel
              </button>
              <button 
                onClick={() => deleteProduct(productToDelete)} 
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('Delete Product Modal')) {
  content = content.replace('    </div>\n  );\n}', modal + '    </div>\n  );\n}');
  fs.writeFileSync('src/pages/admin/AdminProducts.tsx', content);
}
