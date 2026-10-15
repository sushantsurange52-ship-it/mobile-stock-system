import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { LowStockBadge } from '../components/LowStockBadge';
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  ArrowLeftRight,
  AlertCircle,
  Smartphone,
  Check,
  X,
} from 'lucide-react';

export const MobilesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [mobiles, setMobiles] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [onlyLowStock, setOnlyLowStock] = useState(searchParams.get('lowStock') === 'true');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMobile, setEditingMobile] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    variant: '',
    color: '',
    category: 'Smartphone',
    costPrice: '',
    sellingPrice: '',
    quantity: 0,
    reorderLevel: 5,
    supplierId: '',
    imageUrl: '',
  });

  const fetchMobiles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (onlyLowStock) params.lowStock = 'true';

      const res = await api.get('/mobiles', { params });
      setMobiles(res.data);
    } catch (err) {
      console.error('Failed to load mobiles:', err);
      addToast('Failed to fetch mobile phones.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMobiles();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory, onlyLowStock]);

  const handleOpenAddModal = () => {
    setEditingMobile(null);
    setFormData({
      brand: '',
      model: '',
      variant: '',
      color: '',
      category: 'Smartphone',
      costPrice: '',
      sellingPrice: '',
      quantity: 5,
      reorderLevel: 5,
      supplierId: suppliers[0]?.id || '',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mobile) => {
    setEditingMobile(mobile);
    setFormData({
      brand: mobile.brand,
      model: mobile.model,
      variant: mobile.variant,
      color: mobile.color,
      category: mobile.category,
      costPrice: mobile.costPrice,
      sellingPrice: mobile.sellingPrice,
      quantity: mobile.quantity,
      reorderLevel: mobile.reorderLevel,
      supplierId: mobile.supplierId || '',
      imageUrl: mobile.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (editingMobile) {
        // Edit mobile
        await api.put(`/mobiles/${editingMobile.id}`, formData);
        addToast(`${formData.brand} ${formData.model} updated successfully!`, 'success');
      } else {
        // Create mobile
        await api.post('/mobiles', formData);
        addToast(`${formData.brand} ${formData.model} added to inventory!`, 'success');
      }
      setIsModalOpen(false);
      fetchMobiles();
    } catch (err) {
      console.error('Save failed:', err);
      addToast(err.response?.data?.error || 'Failed to save mobile phone.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/mobiles/${id}`);
      addToast('Mobile phone removed from inventory.', 'info');
      setDeleteConfirmId(null);
      fetchMobiles();
    } catch (err) {
      console.error('Delete failed:', err);
      addToast('Failed to delete mobile phone.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mobile Phones Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage devices, retail prices, reorder alerts, and supplier links
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Mobile
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search brand, model, color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Category Pill Tabs & Low Stock Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {['All', 'Smartphone', 'Feature Phone'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition select-none">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span>Low Stock Alerts Only</span>
          </label>
        </div>
      </div>

      {/* Mobiles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Pricing</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading devices...
                  </td>
                </tr>
              ) : mobiles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Smartphone className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No mobile phones found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search filters or add a new mobile phone.
                    </p>
                  </td>
                </tr>
              ) : (
                mobiles.map((mobile) => {
                  const cost = parseFloat(mobile.costPrice);
                  const retail = parseFloat(mobile.sellingPrice);
                  const margin = retail > 0 ? (((retail - cost) / retail) * 100).toFixed(0) : 0;

                  return (
                    <tr key={mobile.id} className="hover:bg-slate-50/80 transition">
                      {/* Device info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {mobile.imageUrl ? (
                            <img
                              src={mobile.imageUrl}
                              alt={mobile.model}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                              {mobile.brand.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{mobile.brand}</span>
                              <span className="font-semibold text-slate-700">{mobile.model}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {mobile.variant} • <span className="text-slate-600">{mobile.color}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {mobile.category}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-900">${retail.toFixed(2)}</p>
                          <p className="text-[11px] text-slate-400">
                            Cost: ${cost.toFixed(2)}{' '}
                            <span className="text-emerald-600 font-medium">({margin}% margin)</span>
                          </p>
                        </div>
                      </td>

                      {/* Stock status */}
                      <td className="py-3.5 px-4">
                        <LowStockBadge
                          quantity={mobile.quantity}
                          reorderLevel={mobile.reorderLevel}
                        />
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-600">
                          {mobile.supplier ? mobile.supplier.name : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick movement */}
                          <button
                            onClick={() => navigate(`/stock-movement?mobile_id=${mobile.id}`)}
                            title="Log Stock IN/OUT"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(mobile)}
                            title="Edit Device"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          {deleteConfirmId === mobile.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(mobile.id)}
                                title="Confirm Delete"
                                className="p-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                title="Cancel"
                                className="p-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(mobile.id)}
                              title="Delete Device"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMobile ? 'Edit Mobile Details' : 'Add New Mobile Phone'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Samsung, Xiaomi"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 15 Pro, Galaxy S24"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Variant *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 256GB / 8GB RAM"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Titanium Gray, Midnight"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Smartphone">Smartphone</option>
                    <option value="Feature Phone">Feature Phone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">No Supplier Assigned</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 650.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 799.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {editingMobile ? 'Current Quantity (Use Stock Movement for Changes)' : 'Initial Quantity'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!editingMobile}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingMobile ? 'Update Mobile' : 'Create Mobile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
