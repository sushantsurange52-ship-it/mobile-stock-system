import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const LowStockBadge = ({ quantity, reorderLevel }) => {
  const isLow = quantity <= reorderLevel;

  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        Low Stock ({quantity} left)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" />
      {quantity} in stock
    </span>
  );
};
