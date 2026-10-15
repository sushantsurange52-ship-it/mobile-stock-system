import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { StatCard } from '../components/StatCard';
import {
  DollarSign,
  Smartphone,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-medium text-rose-600 mb-2">{error || 'Something went wrong'}</p>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, topBrands, recentTransactions } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock valuation, brand distributions, and supply alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/stock-movement"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
          >
            Log Movement
          </Link>
          <Link
            to="/mobiles"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition"
          >
            View Catalog
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stock Valuation (Retail)"
          value={`$${summary.totalRetailValue.toLocaleString()}`}
          subtitle={`Cost base: $${summary.totalCostValue.toLocaleString()}`}
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Total Units in Stock"
          value={summary.totalStockUnits.toLocaleString()}
          subtitle={`Across ${summary.totalMobiles} unique models`}
          icon={PackageCheck}
          color="emerald"
        />
        <StatCard
          title="Low Stock Alerts"
          value={summary.lowStockCount}
          subtitle={
            summary.lowStockCount > 0
              ? 'Units below reorder threshold'
              : 'All stocks at healthy levels'
          }
          icon={AlertTriangle}
          color={summary.lowStockCount > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Active Suppliers"
          value={summary.totalSuppliers}
          subtitle="Wholesale vendors configured"
          icon={Smartphone}
          color="violet"
        />
      </div>

      {/* Low stock alert banner */}
      {summary.lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Action Needed: {summary.lowStockCount} phone model(s) are running low!
              </p>
              <p className="text-xs text-amber-700">
                Their inventory has fallen below the designated reorder threshold.
              </p>
            </div>
          </div>
          <Link
            to="/mobiles?lowStock=true"
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition whitespace-nowrap shadow-sm"
          >
            Review Low Stock
          </Link>
        </div>
      )}

      {/* Analytics Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Distribution Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Stock by Brand</h2>
              <p className="text-xs text-slate-500">Top 5 brands sorted by available inventory units</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Live DB Aggregation
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBrands} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="brand"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(val) => [`${val} Units`, 'Quantity']}
                />
                <Bar
                  dataKey="quantity"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Movements</h2>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                All
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const isIN = tx.type === 'IN';
                return (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isIN ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isIN ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {tx.mobile?.brand} {tx.mobile?.model}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isIN ? 'Stock In' : 'Stock Out'} • {tx.note || 'Movement'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isIN ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIN ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/transactions"
              className="w-full py-2 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 block"
            >
              View Full Transaction Audit Log →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
