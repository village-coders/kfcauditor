import React, { useState, useMemo, useEffect } from 'react';
import {
  PackagePlus,
  Search,
  Trash2,
  ArrowLeft,
  LayoutDashboard,
  CheckSquare,
  Square,
  X,
  Save,
  Filter,
  Loader2
} from 'lucide-react';
import { useAuditPortal } from '../../context/AuditPortalContext';
import { useToast } from '../../context/ToastContext';
import { HFA_APPROVED_PRODUCTS } from '../../data/hfaApprovedProducts';
import { PRODUCT_CATEGORIES } from '../../data/kfcAuditData';
import { apiRequest } from '../../services/apiClient';

export function ProductListScreen() {
  const {
    selectedAudit,
    setActiveScreen,
    addProductsToAudit,
    removeProductFromAudit,
    updateProductComment
  } = useAuditPortal();
  const toast = useToast();

  const [categoryFilter, setCategoryFilter] = useState('0');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState('0');
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [visibleLimit, setVisibleLimit] = useState(80);

  // Comment field (#MsgC1)
  const [commentText, setCommentText] = useState(selectedAudit?.productComment || '');
  const [catalogProducts, setCatalogProducts] = useState(HFA_APPROVED_PRODUCTS);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProductsFromBackend() {
      setIsLoadingCatalog(true);
      try {
        const res = await apiRequest('/products');
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled && list.length > 0) {
          const mapped = list.map((p, idx) => ({
            id: p._id || p.id || idx + 1,
            name: p.name || '',
            supplier: p.supplier || p.manufacturer || '',
            category: p.category || 'Ambient',
            categoryId:
              p.category === 'Frozen' ? '1' : p.category === 'Chilled' ? '2' : '3'
          }));
          setCatalogProducts(mapped);
        }
      } catch {
        // Offline fallback to local HFA_APPROVED_PRODUCTS
      } finally {
        if (!cancelled) setIsLoadingCatalog(false);
      }
    }
    loadProductsFromBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (msg) => {
    toast.success(msg);
  };

  // Filter the HFA Approved KFC Products
  const filteredCatalog = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    return catalogProducts.filter((item) => {
      const matchesCat = modalCategory === '0' || item.categoryId === modalCategory;
      const matchesText =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });
  }, [modalSearch, modalCategory, catalogProducts]);

  if (!selectedAudit) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600 mb-4">No active audit selected.</p>
        <button
          onClick={() => setActiveScreen('AUDIT_LIST')}
          className="px-4 py-2 bg-[#064e2b] text-white rounded-xl text-sm font-semibold cursor-pointer"
        >
          Back To Audit List
        </button>
      </div>
    );
  }

  const openCatalogWithFilters = (e) => {
    if (e) e.preventDefault();
    setModalCategory(categoryFilter);
    setModalSearch(searchKeyword);
    setVisibleLimit(80);
    setShowSelectModal(true);
  };

  const toggleProductCheckbox = (id) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCatalogSubmit = () => {
    if (selectedProductIds.size === 0) {
      setShowSelectModal(false);
      return;
    }
    const chosen = catalogProducts.filter((p) => selectedProductIds.has(p.id));
    addProductsToAudit(selectedAudit.appId, chosen);
    setSelectedProductIds(new Set());
    setShowSelectModal(false);
    showToast(`${chosen.length} product(s) added to Audit #${selectedAudit.appId}.`);
  };

  const handleDeleteProduct = (productName) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      removeProductFromAudit(selectedAudit.appId, productName);
      showToast(`Removed "${productName}".`);
    }
  };

  const handleUpdateComment = (e) => {
    e.preventDefault();
    updateProductComment(selectedAudit.appId, commentText);
    showToast('Product comment updated successfully.');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        {/* Top Emerald Header */}
        <div className="bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">Product List</h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Audit ID: <span className="font-mono font-semibold">{selectedAudit.appId}</span> &bull; Store:{' '}
              <span className="font-semibold">{selectedAudit.storeName}</span> ({selectedAudit.storeId})
            </p>
          </div>
          <span className="text-xs bg-white/15 backdrop-blur-xs border border-white/20 px-3 py-1 rounded-full font-semibold">
            {selectedAudit.products.length} Selected
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80">
          <form
            onSubmit={openCatalogWithFilters}
            className="flex flex-col md:flex-row md:items-end justify-between gap-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search 725 HFA approved products..."
                    className="flex-1 h-10 px-3.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                  />
                  <button
                    type="submit"
                    className="px-4 h-10 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setModalCategory('0');
                setModalSearch('');
                setShowSelectModal(true);
              }}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              {isLoadingCatalog ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PackagePlus className="w-4 h-4" />
              )}
              {isLoadingCatalog ? 'Loading Products...' : `Select Product (${catalogProducts.length})`}
            </button>
          </form>
        </div>

        <div className="p-4 sm:p-5 space-y-6">
          {/* Selected Products List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Selected Audit Products ({selectedAudit.products.length})
            </h3>

            {/* Mobile Cards (< sm) */}
            <div className="space-y-2.5 sm:hidden">
              {selectedAudit.products.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-500 border border-slate-200 rounded-2xl bg-slate-50/50">
                  No products selected yet. Tap <strong>Select Product</strong> above to choose from the HFA approved products.
                </div>
              ) : (
                selectedAudit.products.map((prod, idx) => (
                  <div
                    key={`${prod.name}-${idx}`}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {idx + 1}. {prod.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{prod.supplier}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.name)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-xl shrink-0 cursor-pointer"
                      aria-label={`Delete ${prod.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table (sm+) */}
            <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-2xl">
              <table id="fsfsf" className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#064e2b] text-white text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Supplier</th>
                    <th className="py-3 px-3 text-center w-24">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedAudit.products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No products selected yet. Click <strong>Select Product</strong> above to choose from the HFA Approved KFC products.
                      </td>
                    </tr>
                  ) : (
                    selectedAudit.products.map((prod, idx) => (
                      <tr key={`${prod.name}-${idx}`} className="hover:bg-emerald-50/40">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{prod.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{prod.supplier}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comment Section */}
          <form onSubmit={handleUpdateComment} className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="block text-xs sm:text-sm font-bold text-slate-800">Comment</label>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter any product inspection comments or observations..."
              className="w-full p-3.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
            />
            <div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Update Comment
              </button>
            </div>
          </form>

          {/* Bottom Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveScreen('AUDIT_LIST')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back To Audit List
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('DASHBOARD')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              Back To Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Select Product (#myModal9 with #kfc 725 Products table) */}
      {showSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#064e2b] text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm sm:text-base">
                  Select HFA Approved KFC Products
                </h4>
                <p className="text-[11px] text-emerald-200">
                  Showing {Math.min(visibleLimit, filteredCatalog.length)} of {filteredCatalog.length} matching products ({selectedProductIds.size} checked)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSelectModal(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Category Bar */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5">
              <div className="flex items-center gap-1.5 sm:w-52">
                <Filter className="w-4 h-4 text-[#064e2b] shrink-0" />
                <select
                  value={modalCategory}
                  onChange={(e) => {
                    setModalCategory(e.target.value);
                    setVisibleLimit(80);
                  }}
                  className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => {
                    setModalSearch(e.target.value);
                    setVisibleLimit(80);
                  }}
                  placeholder="Filter by product name or supplier..."
                  className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const visibleIds = filteredCatalog.slice(0, visibleLimit).map((p) => p.id);
                  setSelectedProductIds((prev) => {
                    const next = new Set(prev);
                    visibleIds.forEach((id) => next.add(id));
                    return next;
                  });
                }}
                className="h-9 px-3.5 bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-xl shrink-0 cursor-pointer"
              >
                Check Visible
              </button>
            </div>

            {/* Scrollable Table (#kfc) */}
            <div className="flex-1 overflow-y-auto">
              <table id="kfc" className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-[#064e2b] text-white sticky top-0 z-10 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Select</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3 w-24">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.slice(0, visibleLimit).map((item) => {
                    const isChecked = selectedProductIds.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => toggleProductCheckbox(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            className="text-[#064e2b] focus:outline-none"
                            aria-label={`Select ${item.name}`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#064e2b]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{item.supplier}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2 py-0.5 text-[11px] rounded-full bg-slate-100 text-slate-700 font-medium">
                            {item.category}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {visibleLimit < filteredCatalog.length && (
                <div className="p-3 text-center bg-slate-50 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setVisibleLimit((prev) => prev + 120)}
                    className="px-4 py-2 bg-[#064e2b] text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Load More Products ({filteredCatalog.length - visibleLimit} remaining)
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#064e2b]">
                {selectedProductIds.size} product(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSelectModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCatalogSubmit}
                  className="px-5 py-2 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
