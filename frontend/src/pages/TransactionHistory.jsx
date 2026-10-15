import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  User,
  Calendar,
} from 'lucide-react';

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [mobiles, setMobiles] = useState([]);
  const [selectedMobileId, setSelectedMobileId] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchFilters = async () => {
    try {
      const res = await api.get('/mobiles');
      setMobiles(res.data);
    } catch (err) {
      console.error('Failed to load mobiles:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMobileId) params.mobile_id = selectedMobileId;
      if (selectedType !== 'ALL') params.type = selectedType;

      const res = await api.get('/stock/transactions', { params });
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMobileId, selectedType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Stock Movement Audit Log
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete historical ledger of all stock arrivals, restocks, sales, and adjustments
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Mobile Phone Filter */}
          <div className="w-full sm:w-64">
            <select
              value={selectedMobileId}
              onChange={(e) => setSelectedMobileId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Mobile Models</option>
              {mobiles.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brand} {m.model}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {['ALL', 'IN', 'OUT'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  selectedType === t
                    ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Movements' : t === 'IN' ? 'Stock IN' : 'Stock OUT'}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-medium text-slate-500">
          Showing {transactions.length} record(s)
        </span>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Note / Reason</th>
                <th className="py-3 px-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading audit records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No transactions found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Stock movements logged through the workbench will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIN = tx.type === 'IN';
                  const date = new Date(tx.createdAt);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-800">
                              {date.toLocaleDateString()}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Device */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {tx.mobile ? (
                          <>
                            <span>{tx.mobile.brand} </span>
                            <span className="text-slate-700">{tx.mobile.model}</span>
                            <span className="text-[11px] text-slate-400 block font-normal">
                              {tx.mobile.variant}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Deleted Product</span>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isIN
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isIN ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {isIN ? 'STOCK IN' : 'STOCK OUT'}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-extrabold text-sm ${
                            isIN ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIN ? `+${tx.quantity}` : `-${tx.quantity}`}
                        </span>
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {tx.note || '—'}
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{tx.user?.name || 'System / Seed'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
