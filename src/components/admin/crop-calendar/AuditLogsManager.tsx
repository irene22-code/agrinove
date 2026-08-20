
import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

export function AuditLogsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    const fetchItems = async () => {
      try {
        const data = await api.get<any[]>('/admin/crop-calendar/audit-logs');
        setItems(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchItems();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Audit Logs</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Record Type</th>
              <th className="px-4 py-3 text-left">Record ID</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : 
             items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">
                   <span className={`px-2 py-1 rounded text-xs font-medium ${item.action === 'DELETE' ? 'bg-red-100 text-red-800' : item.action === 'CREATE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                     {item.action}
                   </span>
                </td>
                <td className="px-4 py-3">{item.record_type}</td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono truncate max-w-[200px]">{item.record_id}</td>
                <td className="px-4 py-3">{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
