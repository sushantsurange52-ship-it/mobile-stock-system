import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  History,
} from 'lucide-react';

export const StockMovement = () => {
  const [searchParams] = useSearchParams();
  const preselectedMobileId = searchParams.get('mobile_id') || '';
  const { addToast } = useToast();

  const [mobiles, setMobiles] = useState([]);
  const [selectedMobileId, setSelectedMobileId] = useState(preselectedMobileId);
  const [movementType, setMovementType] = useState('IN'); // 'IN' or 'OUT'
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  // Load mobiles list
  const fetchMobiles = async () => {
    try {
      const res = await api.get('/mobiles');
      setMobiles(res.data);
      if (!selectedMobileId && res.data.length > 0) {
        setSelectedMobileId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load mobiles:', err);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const res = await api.get('/stock/transactions');
      setRecentLogs(res.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  useEffect(() => {
    fetchMobiles();
    fetchRecentLogs();
  }, []);

  const selectedMobile = mobiles.find((m) => m.id === selectedMobileId);
  const currentQuantity = selectedMobile ? selectedMobile.quantity : 0;
  const parsedQty = parseInt(quantity, 10) || 0;

  // Compute preview
  const projectedQuantity =
    movementType === 'IN'
      ? currentQuantity + parsedQty
      : currentQuantity - parsedQty;

  const isInvalidOut = movementType === 'OUT' && parsedQty > currentQuantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMobileId) {
      addToast('Please select a mobile phone.', 'error');
      return;
    }

    if (parsedQty <= 0) {
      addToast('Quantity must be greater than zero.', 'error');
      return;
    }

    if (isInvalidOut) {
      addToast(`Insufficient stock! Cannot deduct ${parsedQty} from ${currentQuantity}.`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = movementType === 'IN' ? '/stock/in' : '/stock/out';
      const res = await api.post(endpoint, {
        mobile_id: selectedMobileId,
        quantity: parsedQty,
        note: note.trim() || (movementType === 'IN' ? 'Stock restocked' : 'Sold to customer'),
      });

      addToast(res.data.message || 'Stock updated successfully!', 'success');
      setNote('');
      setQuantity(1);

      // Refresh data
      await fetchMobiles();
      await fetchRecentLogs();
    } catch (err) {
      console.error('Stock adjustment failed:', err);
      addToast(err.response?.data?.error || 'Failed to update stock.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Stock Movement Workbench
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record stock arrivals (IN) or sales/dispatches (OUT) with real-time atomic inventory verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Movement Type Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMovementType('IN')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs border transition ${
                    movementType === 'IN'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  Stock IN (Restock / Arrival)
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('OUT')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs border transition ${
                    movementType === 'OUT'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  Stock OUT (Sale / Dispatch)
                </button>
              </div>
            </div>

            {/* Mobile Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Mobile Device
              </label>
              <select
                value={selectedMobileId}
                onChange={(e) => setSelectedMobileId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-800"
              >
                {mobiles.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand} {m.model} ({m.variant}, {m.color}) — Available: {m.quantity}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity to {movementType === 'IN' ? 'Add' : 'Deduct'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
              />
              {isInvalidOut && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Cannot deduct {parsedQty} units. Only {currentQuantity} units available.
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Note / Reference (optional)
              </label>
              <input
                type="text"
                placeholder={
                  movementType === 'IN'
                    ? 'e.g. Batch shipment PO #441, restocked by supplier'
                    : 'e.g. Customer receipt #1092, store counter sale'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Live Preview Box */}
            {selectedMobile && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedMobile.brand} {selectedMobile.model}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Current Stock: <span className="font-bold text-slate-700">{currentQuantity} units</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Projection:</span>
                  <div
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-sm border ${
                      projectedQuantity < 0
                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                        : projectedQuantity <= selectedMobile.reorderLevel
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {projectedQuantity} Units
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isInvalidOut}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                movementType === 'IN'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Commit Stock {movementType}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Movements Sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Movements</h3>
              </div>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => {
                const isIN = log.type === 'IN';
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {log.mobile?.brand} {log.mobile?.model}
                      </span>
                      <span
                        className={`text-xs font-extrabold ${
                          isIN ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIN ? `+${log.quantity}` : `-${log.quantity}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {log.note || (isIN ? 'Stock In' : 'Stock Out')}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Logged by {log.user?.name || 'Staff'} •{' '}
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/mobiles"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 block text-center"
            >
              ← Back to Mobiles Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
