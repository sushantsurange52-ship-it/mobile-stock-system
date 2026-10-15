import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
    violet: {
      bg: 'bg-violet-50 text-violet-600',
      border: 'border-violet-100',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
