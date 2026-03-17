import { useEffect, useState } from "react";
import "./Admin.css";

const Icon = ({ d, size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round"
    strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);

const IcoList      = (p) => <Icon {...p} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />;
const IcoLogout    = (p) => <Icon {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;
const IcoRefresh   = (p) => <Icon {...p} d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />;
const IcoSearch    = (p) => <Icon {...p} d="M21 21l-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z" />;
const IcoCheck     = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
const IcoAlert     = (p) => <Icon {...p} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;
const IcoLock      = (p) => <Icon {...p} d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />;
const IcoMail      = (p) => <Icon {...p} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />;
const IcoUsers     = (p) => <Icon {...p} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const IcoBox       = (p) => <Icon {...p} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />;
const IcoClock     = (p) => <Icon {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" />;
const IcoChevDown  = (p) => <Icon {...p} d="M6 9l6 6 6-6" />;

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Admin() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [distributions, setDistributions] = useState([]);
  const [activeTab, setActiveTab] = useState('distributions');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productShops, setProductShops] = useState([]);
  const [savingShop, setSavingShop] = useState(null);
  const [loadingDist, setLoadingDist]   = useState(false);
  const [pendingCompletes, setPendingCompletes] = useState([]);
  const [searchTerm, setSearchTerm]     = useState("");
  const [filterMonth, setFilterMonth]   = useState("");
  const [filterYear, setFilterYear]     = useState("");

  useEffect(() => {
    if (localStorage.getItem("admin_token")) setAuthenticated(true);
  }, []);

  const loadDistributions = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    setLoadingDist(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/api/distributions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");
      setDistributions(data);
    } catch (err) {
      setError(err.message);
      if (err.message?.toLowerCase().includes("unauthorized")) handleLogout();
    } finally { setLoadingDist(false); }
  };

  const markCompleted = async (id) => {
    setPendingCompletes(p => [...p, id]);
    setDistributions(p => p.map(d => d.id === id ? { ...d, completed: true } : d));
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/api/distributions/${id}/complete`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setDistributions(p => p.map(d => d.id === id ? { ...d, completed: false } : d)); throw new Error(data.message); }
      // reload distributions to reflect server state
      await loadDistributions();
    } catch (err) { setError(err.message); await loadDistributions(); }
    finally { setPendingCompletes(p => p.filter(x => x !== id)); }
  };

  const unmarkCompleted = async (id) => {
    setPendingCompletes(p => [...p, id]);
    setDistributions(p => p.map(d => d.id === id ? { ...d, completed: false } : d));
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/api/distributions/${id}/uncomplete`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setDistributions(p => p.map(d => d.id === id ? { ...d, completed: true } : d)); throw new Error(data.message); }
      // reload distributions to reflect server state
      await loadDistributions();
    } catch (err) { setError(err.message); await loadDistributions(); }
    finally { setPendingCompletes(p => p.filter(x => x !== id)); }
  };

  useEffect(() => { if (authenticated) loadDistributions(); }, [authenticated]);

  useEffect(() => { if (authenticated && activeTab === 'products') loadProducts(); }, [authenticated, activeTab]);

  const loadProducts = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setLoadingProducts(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/products`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load products');
      setProducts(data);
    } catch (err) { setError(err.message); }
    finally { setLoadingProducts(false); }
  };

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', unit: '', quantityPerPerson: 0, fixed: false });

  const addProduct = async (e) => {
    e && e.preventDefault();
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create product');
      setShowAddProduct(false);
      setNewProduct({ name: '', unit: '', quantityPerPerson: 0, fixed: false });
      await loadProducts();
    } catch (err) { setError(err.message); }
  };

  const loadProductShops = async (productId) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}/shops`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load shops');
      setProductShops(data.map(s => ({ ...s })));
    } catch (err) { setError(err.message); }
  };

  const openProduct = (p) => {
    setSelectedProduct(p);
    setProductShops([]);
    loadProductShops(p.id || p._id);
  };

  const saveShopProduct = async (shopId, productId, updates) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setSavingShop(shopId);
    try {
      const res = await fetch(`${API_BASE}/api/shops/${shopId}/products/${productId}`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      // reload shops for product
      await loadProductShops(productId);
    } catch (err) { setError(err.message); }
    finally { setSavingShop(null); }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError("");
    try {
      const res  = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("admin_token", data.token);
      setAuthenticated(true); setEmail(""); setPassword("");
    } catch (err) { setError(err.message); }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAuthenticated(false); setDistributions([]); setError("");
  };

  // Filtered + sorted
  const filtered = distributions
    .filter(d => {
      if (searchTerm && !String(d.cardNumber).toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterMonth && (d.month || "").slice(5, 7) !== filterMonth) return false;
      if (filterYear  && (d.month || "").slice(0, 4) !== filterYear)  return false;
      return true;
    })
    .sort((a, b) => a.month === b.month
      ? new Date(b.issuedAt) - new Date(a.issuedAt)
      : b.month?.localeCompare(a.month));

  const years = [...new Set(distributions.map(d => (d.month || "").slice(0, 4)))].filter(Boolean);
  const total      = distributions.length;
  const completed  = distributions.filter(d => d.completed).length;
  const pending    = total - completed;

  // History grouping: group filtered distributions by month
  const historyGroups = filtered.reduce((acc, d) => {
    const m = d.month || 'Unknown';
    if (!acc[m]) acc[m] = [];
    acc[m].push(d);
    return acc;
  }, {});
  const historyMonths = Object.keys(historyGroups).sort((a,b) => b.localeCompare(a));

  // ── Login screen ──
  if (!authenticated) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="login-logo">
            <div className="login-emblem">RR</div>
            <div>
              <div className="login-brand-title">Ration Register</div>
              <div className="login-brand-sub">Admin Portal</div>
            </div>
          </div>

          <h1 className="login-heading">Welcome back</h1>
          <p className="login-sub">Sign in to access the admin console.</p>

          {error && (
            <div className="alert-error">
              <IcoAlert size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: "relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#aab0bc" }}>
                  <IcoMail size={15} />
                </span>
                <input
                  className="form-input"
                  type="email"
                  style={{ paddingLeft: 38 }}
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#aab0bc" }}>
                  <IcoLock size={15} />
                </span>
                <input
                  className="form-input"
                  type="password"
                  style={{ paddingLeft: 38 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="btn-login" type="submit">Sign in to Console</button>
          </form>

          <div className="login-note">
            Admin credentials are restricted. Contact your system administrator for access.
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="admin-page admin-dashboard">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-emblem">RR</div>
          <div className="sidebar-brand">
            <span className="sidebar-title">Ration Register</span>
            <span className="sidebar-sub">Admin Console</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`sidebar-link ${activeTab === 'distributions' ? 'active' : ''}`} onClick={() => setActiveTab('distributions')}>
            <IcoList size={16} /> Distributions
          </button>
          <button className={`sidebar-link ${activeTab === 'beneficiaries' ? 'active' : ''}`} onClick={() => setActiveTab('beneficiaries')}>
            <IcoUsers size={16} /> Add New user
          </button>
          <button className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <IcoBox size={16} /> Products
          </button>
          <button className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <IcoClock size={16} /> History
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <IcoLogout size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">

        {/* Top bar */}
        <div className="admin-topbar">
          <div className="topbar-page-title">Distribution Management</div>
          <div className="topbar-right">
            {error && (
              <span style={{ color:"#dc2626", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
                <IcoAlert size={14} /> {error}
              </span>
            )}
            <div className="admin-badge">
              <div className="admin-avatar">A</div>
              Administrator
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-card-icon blue"><IcoList size={20} /></div>
              <div className="stat-card-info">
                <div className="stat-card-value">{total}</div>
                <div className="stat-card-label">Total Distributions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon teal"><IcoCheck size={20} /></div>
              <div className="stat-card-info">
                <div className="stat-card-value">{completed}</div>
                <div className="stat-card-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon amber"><IcoClock size={20} /></div>
              <div className="stat-card-info">
                <div className="stat-card-value">{pending}</div>
                <div className="stat-card-label">Pending</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon navy"><IcoUsers size={20} /></div>
              <div className="stat-card-info">
                <div className="stat-card-value">
                  {total > 0 ? Math.round((completed / total) * 100) : 0}%
                </div>
                <div className="stat-card-label">Completion Rate</div>
              </div>
            </div>
          </div>
          {/* Product details modal / drawer */}
          {selectedProduct && (
            <div className="product-drawer">
              <div className="product-drawer-header">
                <div>
                  <div style={{ fontWeight:700 }}>{selectedProduct.name}</div>
                  <div style={{ fontSize:13, color:'#6b7280' }}>{selectedProduct.unit} · {selectedProduct.quantityPerPerson} per person</div>
                </div>
                <div>
                  <button className="btn-logout" onClick={() => setSelectedProduct(null)}>Close</button>
                </div>
              </div>
              <div style={{ padding:12 }}>
                {productShops.length === 0 ? (
                  <div style={{ fontSize:13, color:'#6b7280' }}>No shops found carrying this product.</div>
                ) : (
                  <table className="dist-table" style={{ width:'100%' }}>
                    <thead>
                      <tr>
                        <th>Shop</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productShops.map(shop => {
                        const item = (shop.inventory || []).find(it => String(it.productId) === String(selectedProduct.id) || String(it.productId) === String(selectedProduct._id));
                        if (!item) return null;
                        return (
                          <tr key={shop.id}>
                            <td>{shop.name || shop.title || `Shop ${shop.id}`}</td>
                            <td>
                              <input type="number" defaultValue={item.price || 0} onChange={(e) => { item._editedPrice = Number(e.target.value); }} />
                            </td>
                            <td>
                              <input type="number" defaultValue={item.stock || 0} onChange={(e) => { item._editedStock = Number(e.target.value); }} />
                            </td>
                            <td>
                              <button className="btn-complete" disabled={savingShop === shop.id} onClick={() => {
                                const updates = {};
                                if (typeof item._editedPrice !== 'undefined') updates.price = item._editedPrice;
                                if (typeof item._editedStock !== 'undefined') updates.stock = item._editedStock;
                                saveShopProduct(shop.id, selectedProduct.id || selectedProduct._id, updates);
                              }}>{savingShop === shop.id ? 'Saving…' : 'Save'}</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Table card or tab content */}
          {activeTab === 'distributions' && (
            <div className="table-card">
              {/* existing distributions table follows... */}
              <div className="table-card-header">
                <div>
                  <div className="table-card-title">Issued Rations</div>
                  <div className="table-card-subtitle">
                    {filtered.length} of {total} records
                  </div>
                </div>

                <div className="table-filters">
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#aab0bc", pointerEvents:"none" }}>
                      <IcoSearch size={14} />
                    </span>
                    <input
                      className="filter-input"
                      style={{ paddingLeft: 32 }}
                      placeholder="Search card number…"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                    <option value="">All months</option>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                      <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>
                    ))}
                  </select>
                  <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                    <option value="">All years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button className="btn-refresh" onClick={() => { setError(""); loadDistributions(); }}>
                    <IcoRefresh size={14} /> Refresh
                  </button>
                </div>
              </div>

              {loadingDist ? (
                <div className="table-loading">
                  <div className="spinner" /> Loading distributions…
                </div>
              ) : filtered.length === 0 ? (
                <div className="table-empty">
                  <div className="table-empty-icon">📭</div>
                  <div style={{ fontWeight:600, color:"#374151", marginBottom:4 }}>No records found</div>
                  <div style={{ fontSize:13 }}>Try adjusting your filters or refresh the list.</div>
                </div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table className="dist-table">
                    <thead>
                      <tr>
                        <th>Card Number</th>
                        <th>Month</th>
                        <th>Issued At</th>
                        <th>Products</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(d => (
                        <tr key={d.id}>
                          <td><span className="td-card-num">{d.cardNumber}</span></td>
                          <td><span className="td-month">{d.month}</span></td>
                          <td><span className="td-time">{new Date(d.issuedAt).toLocaleString()}</span></td>
                          <td>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                              {(d.products || []).map((p, i) => (
                                <span key={i} className="product-chip">
                                  {p.productName || p.name} · {p.quantity}{p.unit ? ` ${p.unit}` : ""}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            {d.completed
                              ? <span className="badge-completed"><IcoCheck size={11} /> Completed</span>
                              : <span className="badge-pending"><IcoClock size={11} /> Pending</span>
                            }
                          </td>
                          <td>
                            {d.completed ? (
                              <button className="btn-undo" onClick={() => unmarkCompleted(d.id)} disabled={pendingCompletes.includes(d.id)}>
                                {pendingCompletes.includes(d.id) ? "Processing…" : "Undo"}
                              </button>
                            ) : (
                              <button className="btn-complete" onClick={() => markCompleted(d.id)} disabled={pendingCompletes.includes(d.id)}>
                                {pendingCompletes.includes(d.id) ? "Processing…" : "Mark Complete"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="table-footer">
                <span>Showing {filtered.length} of {total} distributions</span>
                <span>{completed} completed · {pending} pending</span>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="table-card">
              <div className="table-card-header">
                <div>
                  <div className="table-card-title">Products</div>
                  <div className="table-card-subtitle">Manage product definitions and per-shop inventory</div>
                </div>
                <div className="table-filters">
                  <button className="btn-refresh" onClick={() => { setError(""); loadProducts(); }}>
                    <IcoRefresh size={14} /> Refresh
                  </button>
                  <button className="btn-complete" onClick={() => setShowAddProduct(true)} style={{ marginLeft: 8 }}>
                    Add Product
                  </button>
                </div>
              </div>

              {loadingProducts ? (
                <div className="table-loading"><div className="spinner" /> Loading products…</div>
              ) : products.length === 0 ? (
                <div className="table-empty">
                  <div className="table-empty-icon">📦</div>
                  <div style={{ fontWeight:600, color:"#374151", marginBottom:4 }}>No products found</div>
                  <div style={{ fontSize:13 }}>Add products to the `products` collection to manage them here.</div>
                </div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table className="dist-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Unit</th>
                        <th>Quantity/Person</th>
                        <th>Fixed</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} onClick={() => openProduct(p)} style={{ cursor: 'pointer' }}>
                          <td>{p.name}</td>
                          <td>{p.unit}</td>
                          <td>{p.quantityPerPerson}</td>
                          <td>{p.fixed ? 'Yes' : 'No'}</td>
                          <td><button className="btn-complete" onClick={(e) => { e.stopPropagation(); openProduct(p); }}>View Shops</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="table-footer">
                <span>{products.length} products</span>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="table-card">
              <div className="table-card-header">
                <div>
                  <div className="table-card-title">History</div>
                  <div className="table-card-subtitle">Browse distributions by month and year</div>
                </div>
                <div className="table-filters">
                  <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                    <option value="">All months</option>
                    {[["Jan","01"],["Feb","02"],["Mar","03"],["Apr","04"],["May","05"],["Jun","06"],["Jul","07"],["Aug","08"],["Sep","09"],["Oct","10"],["Nov","11"],["Dec","12"]].map(([label,val]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                    <option value="">All years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button className="btn-refresh" onClick={() => { setError(""); loadDistributions(); }}>
                    <IcoRefresh size={14} /> Refresh
                  </button>
                </div>
              </div>

              <div style={{ padding: 12 }}>
                {historyMonths.length === 0 ? (
                  <div className="table-empty">
                    <div className="table-empty-icon">📭</div>
                    <div style={{ fontWeight:600, color: "#374151", marginBottom:4 }}>No history records</div>
                    <div style={{ fontSize:13 }}>Adjust filters or refresh to view history.</div>
                  </div>
                ) : (
                  historyMonths.map(month => (
                    <div key={month} style={{ marginBottom: 14, border: '1px solid #eef2f7', borderRadius:6 }}>
                      <div style={{ padding:10, background:'#f8fafc', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontWeight:600 }}>{month} — {historyGroups[month].length} record{historyGroups[month].length>1 ? 's':''}</div>
                        <div style={{ fontSize:13, color:'#6b7280' }}>{new Date(month + '-01').toLocaleString(undefined, { month:'long', year:'numeric' })}</div>
                      </div>
                      <div style={{ padding:10 }}>
                        <table className="dist-table" style={{ width:'100%' }}>
                          <thead>
                            <tr>
                              <th>Card Number</th>
                              <th>Issued At</th>
                              <th>Products</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyGroups[month].map(d => (
                              <tr key={d.id}>
                                <td>{d.cardNumber}</td>
                                <td>{new Date(d.issuedAt).toLocaleString()}</td>
                                <td>
                                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                    {(d.products || []).map((p, i) => <span key={i} className="product-chip">{p.productName || p.name} · {p.quantity}</span>)}
                                  </div>
                                </td>
                                <td>{d.completed ? 'Completed' : 'Pending'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
            {showAddProduct && (
              <div className="product-drawer">
                <div className="product-drawer-header">
                  <div>
                    <div style={{ fontWeight:700 }}>Add Product</div>
                  </div>
                  <div>
                    <button className="btn-logout" onClick={() => setShowAddProduct(false)}>Close</button>
                  </div>
                </div>
                <div style={{ padding:12 }}>
                  <form onSubmit={addProduct}>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input className="form-input" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Unit</label>
                      <input className="form-input" value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity per person</label>
                      <input className="form-input" type="number" value={newProduct.quantityPerPerson} onChange={e => setNewProduct(p => ({ ...p, quantityPerPerson: Number(e.target.value) }))} />
                    </div>
                    <div className="form-group">
                      <label style={{ display:'flex', gap:8, alignItems:'center' }}><input type="checkbox" checked={newProduct.fixed} onChange={e => setNewProduct(p => ({ ...p, fixed: e.target.checked }))} /> Fixed quantity</label>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn-complete" type="submit">Create</button>
                      <button type="button" className="btn-undo" onClick={() => setShowAddProduct(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}