import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Search, Activity, Filter, Eye, X, Calendar, ChevronLeft, ChevronRight, Download, Shield } from 'lucide-react';
import { format } from 'date-fns';

export function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (action) params.append('action', action);
      if (entityType) params.append('entity_type', entityType);
      
      let start = '';
      let end = '';
      const now = new Date();
      if (dateRange === 'today') {
         start = new Date(now.setHours(0,0,0,0)).toISOString();
      } else if (dateRange === '7days') {
         start = new Date(now.setDate(now.getDate() - 7)).toISOString();
      } else if (dateRange === '30days') {
         start = new Date(now.setDate(now.getDate() - 30)).toISOString();
      } else if (dateRange === 'custom' && customStartDate) {
         start = new Date(customStartDate).toISOString();
         if (customEndDate) end = new Date(new Date(customEndDate).setHours(23,59,59,999)).toISOString();
      }
      
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);

      const res = await api.get<{ success: boolean; data: any[]; count: number }>(`/admin/audit-logs?${params.toString()}`);
      if (res.success) {
        setLogs(res.data);
        setTotalCount(res.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action, entityType, dateRange, customStartDate, customEndDate]);

  // Debounced Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchLogs();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const actions = [
    'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 
    'UPDATE_SELLER_STATUS', 'UPDATE_USER_ROLE', 'UPDATE_SYSTEM_SETTING',
    'UPDATE_ORDER_STATUS', 'UPDATE_CATEGORY'
  ]; // Common actions, ideally dynamic, but static is okay for UI filters.

  const entities = ['products', 'users', 'sellers', 'system_settings', 'orders', 'categories'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions or entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="">All Actions</option>
              {actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="">All Entities</option>
              {entities.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="flex gap-4 items-center">
            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <span className="text-slate-500">to</span>
            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entity</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Activity className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">{log.users?.full_name || 'Unknown User'}</div>
                          <div className="text-slate-500">{log.users?.email || 'N/A'}</div>
                          {log.users?.role && (
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 mt-1">
                               {log.users.role}
                             </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="font-medium text-slate-700">{log.entity_type}</div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">{log.entity_id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && totalCount > 0 && (
          <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-75" onClick={() => setSelectedLog(null)} />

            <div className="relative inline-block w-full max-w-3xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Audit Log Details
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-slate-500 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Log ID</span>
                    <span className="text-sm font-mono text-slate-800">{selectedLog.id}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Timestamp</span>
                    <span className="text-sm text-slate-800">{format(new Date(selectedLog.created_at), 'PPP p')}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Action</span>
                    <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-800">
                      {selectedLog.action}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Actor</span>
                    <div className="text-sm font-medium text-slate-900">{selectedLog.users?.full_name || 'Unknown User'}</div>
                    <div className="text-xs text-slate-500">{selectedLog.users?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Entity</span>
                    <span className="text-sm text-slate-800 font-medium">{selectedLog.entity_type}</span>
                    <div className="text-xs font-mono text-slate-500 mt-0.5 break-all">{selectedLog.entity_id || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Metadata payload</span>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-emerald-400 font-mono">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
                <p className="mt-2 text-xs text-slate-500 italic flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Sensitive fields (tokens, passwords) are automatically redacted.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
