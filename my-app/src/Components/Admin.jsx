import { useEffect, useState } from "react";
import "./Admin.css";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [distributions, setDistributions] = useState([]);
  const [loadingDist, setLoadingDist] = useState(false);
  const [pendingCompletes, setPendingCompletes] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  // Try restore token on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) setAuthenticated(true);
  }, []);

  const loadDistributions = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setLoadingDist(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/distributions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load distributions");
      setDistributions(data);
    } catch (err) {
      setError(err.message || "Failed to load distributions");
      // if unauthorized, force logout
      if (err.message && err.message.toLowerCase().includes('unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoadingDist(false);
    }
  };

  const markCompleted = async (id) => {
    setError("");
    // optimistic update: mark locally immediately
    setPendingCompletes(prev => [...prev, id]);
    setDistributions(prev => prev.map(d => (d.id === id ? { ...d, completed: true } : d)));
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Unauthorized');
      const res = await fetch(`${apiBase}/api/distributions/${id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        // revert local change
        setDistributions(prev => prev.map(d => (d.id === id ? { ...d, completed: false } : d)));
        throw new Error(data.message || 'Failed to mark completed');
      }
    } catch (err) {
      setError(err.message || 'Failed to mark completed');
    } finally {
      setPendingCompletes(prev => prev.filter(x => x !== id));
    }
  };

  const unmarkCompleted = async (id) => {
    setError("");
    // optimistic update: unmark locally immediately
    setPendingCompletes(prev => [...prev, id]);
    setDistributions(prev => prev.map(d => (d.id === id ? { ...d, completed: false } : d)));
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Unauthorized');
      const res = await fetch(`${apiBase}/api/distributions/${id}/uncomplete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        // revert local change
        setDistributions(prev => prev.map(d => (d.id === id ? { ...d, completed: true } : d)));
        throw new Error(data.message || 'Failed to unmark completed');
      }
    } catch (err) {
      setError(err.message || 'Failed to unmark completed');
    } finally {
      setPendingCompletes(prev => prev.filter(x => x !== id));
    }
  };

  useEffect(() => {
    if (authenticated) loadDistributions();
  }, [authenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('admin_token', data.token);
      setAuthenticated(true);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthenticated(false);
    setDistributions([]);
    setError("");
  };

  return (
    <div className="admin-page container">
      <section className="admin-card card">
        {!authenticated ? (
          <>
            <h2>Admin Login</h2>
            <p className="muted">Sign in with your admin account.</p>

            <form onSubmit={handleLogin} className="admin-form">
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              {error && <p className="error">{error}</p>}

              <div className="actions">
                <button className="btn primary" type="submit">
                  Sign in
                </button>
              </div>
            </form>

            <div className="note muted">
              Admin credentials are restricted. Use the designated admin email.
            </div>
          </>
        ) : (
          <>
            <h2>Admin Console</h2>
            <p className="muted">You are signed in as administrator.</p>

            <div className="admin-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Issued Rations</h3>
                <div>
                  <button className="btn" onClick={() => { setError(""); loadDistributions(); }}>
                    Refresh
                  </button>
                </div>
              </div>

              {loadingDist ? (
                <p className="muted">Loading...</p>
              ) : distributions.length === 0 ? (
                <p className="muted">No distributions found.</p>
              ) : (
                <ul className="blog-list">
                  {distributions.map((d, i) => {
                    const keyId = d.id ?? `idx-${i}`;
                    const expanded = !!expandedItems[keyId];
                    return (
                      <li key={d.id || i} className={`blog-item ${expanded ? 'expanded' : ''}`}>
                        <div className="blog-header" onClick={() => setExpandedItems(prev => ({ ...prev, [keyId]: !prev[keyId] }))}>
                          <div>
                            <div><strong>Card:</strong> {d.cardNumber}</div>
                            <div className="muted"><strong>Month:</strong> {d.month}</div>
                          </div>
                          <div className="header-right">
                            <div className="muted small-time">{new Date(d.issuedAt).toLocaleString()}</div>
                            <div className={`chev ${expanded ? 'open' : ''}`}>▾</div>
                          </div>
                        </div>

                        {expanded && (
                          <div className="blog-body">
                            <div>
                              <strong>Products:</strong>
                              <ul>
                                {(d.products || []).map((p, idx) => (
                                  <li key={idx}>{p.productName || p.name} — {p.quantity}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="completed-control" style={{ marginTop: 8 }}>
                              {d.completed ? (
                                <>
                                  <span className="completed-indicator">✔️ Completed</span>
                                  <button
                                    className="btn undo-btn"
                                    onClick={() => unmarkCompleted(d.id)}
                                    disabled={pendingCompletes.includes(d.id)}
                                    style={{ marginLeft: 8 }}
                                  >
                                    {pendingCompletes.includes(d.id) ? 'Processing…' : 'Undo'}
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn completed-btn"
                                  onClick={() => markCompleted(d.id)}
                                  disabled={pendingCompletes.includes(d.id)}
                                >
                                  {pendingCompletes.includes(d.id) ? 'Processing…' : 'Completed'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="actions">
              <button className="btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
