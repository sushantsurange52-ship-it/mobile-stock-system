import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  ArrowLeftRight,
  History,
  Truck,
  PlusCircle,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Mobiles Catalog', to: '/mobiles', icon: Smartphone },
    { name: 'Stock Movement', to: '/stock-movement', icon: ArrowLeftRight },
    { name: 'Transaction History', to: '/transactions', icon: History },
    { name: 'Suppliers', to: '/suppliers', icon: Truck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Management
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Action Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 border border-indigo-100">
            <h4 className="text-xs font-bold text-slate-900 mb-1">Quick Action</h4>
            <p className="text-xs text-slate-500 mb-3">
              Need to add fresh inventory or restock an existing model?
            </p>
            <NavLink
              to="/stock-movement"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Log Movement
            </NavLink>
          </div>
        </div>

        {/* System info footer */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
          <p className="font-medium text-slate-600">Mobile Stock Pro</p>
          <p>PostgreSQL 18 & Prisma ORM</p>
        </div>
      </aside>
    </>
  );
};
