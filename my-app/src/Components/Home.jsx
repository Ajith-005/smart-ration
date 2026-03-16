import { useState } from "react";
import "./Home.css";
import Header from "./Header";
import Carousel from "./Carousel";
import OtpModal from "./OtpModal";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/* ── Icon helper ── */
const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round"
    strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);

const SearchIcon = (p) => <Icon {...p} d="M21 21l-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z" />;
const CardIcon   = (p) => <Icon {...p} d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />;
const CheckIcon  = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
const AlertIcon  = (p) => <Icon {...p} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;
const UsersIcon  = (p) => <Icon {...p} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const BoxIcon    = (p) => <Icon {...p} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM12 22V12M12 12L3.27 7M12 12l8.73-5" />;
const ClockIcon  = (p) => <Icon {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" />;
const FileIcon   = (p) => <Icon {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />;
const ArrowIcon  = (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />;

export default function Home() {
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [data, setData]             = useState(null);
  const [success, setSuccess]       = useState("");

  const handleSearch = async () => {
    if (!cardNumber.trim()) { setError("Please enter a card number"); return; }
    setLoading(true); setError(""); setData(null);
    try {
      const res    = await fetch(`${API_BASE}/api/ration/search/${encodeURIComponent(cardNumber.trim())}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Card not found");
      setData(result);
    } catch (err) { setError(err.message || "An error occurred"); }
    finally       { setLoading(false); }
  };

  const [otpModalOpen, setOtpModalOpen] = useState(false);

  const issueRation = async () => {
    if (!data?.cardNumber) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      const res    = await fetch(`${API_BASE}/api/issue-ration`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cardNumber: data.cardNumber, products: data.products }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Issuing failed");
      setSuccess(result.message || "Ration registered successfully");
    } catch (err) { setError(err.message || "An error occurred"); }
    finally       { setLoading(false); }
  };

  const handleCollectClick = () => {
    // open OTP modal to verify phone before issuing
    setOtpModalOpen(true);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div className="home">

      {/* ── Header (imported separately) ── */}
      {/* <Header activePage="home" /> */}

      {/* ── Hero with embedded Carousel ── */}
      <section className="hero">
        {/* Carousel fills the entire hero background */}
        <Carousel
          interval={6000}
          items={[
            {
              tag: "Latest Update",
              title: "New Distribution Schedule Published",
              desc: "The updated ration distribution schedule for July 2025 is now available. Check your eligibility and plan your visit accordingly.",
              cta: "Check Eligibility",
              ctaHref: "#",
              image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80",
            },
            {
              tag: "Important Notice",
              title: "Carry Valid ID When Collecting Your Ration",
              desc: "All beneficiaries must bring their original Ration Card and a valid government-issued ID to the distribution point.",
              cta: "Learn More",
              ctaHref: "#",
              image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80",
            },
            {
              tag: "Support",
              title: "Need Help? Contact Your Local Office",
              desc: "Our district officers are available Monday–Saturday to assist with card registration, grievances, and special requests.",
              cta: "Find Your Office",
              ctaHref: "#",
              image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80",
            },
          ]}
        />

        {/* Search + stats overlay on top of carousel */}
        <div className="hero-body">

          {/* Left — search */}
          <div className="hero-search-box">
            <div className="hero-eyebrow">
              <span className="dot" />
              Official Portal — 2025
            </div>
            <h1 className="hero-title">
              Access Your<br />
              <span>Ration Entitlements</span><br />
              Instantly
            </h1>
            <p className="hero-desc">
              Fast, transparent access to local ration entitlements and collection.
              Enter your card number to view allocations and register for pickup.
            </p>

            <div className="search-widget">
              <div className="search-label">Search by card number</div>
              <div className="search-row">
                <div className="search-input-wrap">
                  <span className="search-icon"><SearchIcon size={16} /></span>
                  <input
                    id="cardNumber"
                    className="search-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 1234567890"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    onKeyDown={handleKey}
                    aria-label="Ration card number"
                  />
                </div>
                <button className="btn-search" onClick={handleSearch} disabled={loading}>
                  {loading ? "Searching…" : "Search"}
                </button>
              </div>
              <div className="search-hint">Enter the 10-digit number printed on your ration card</div>
              {error && (
                <div className="error-msg">
                  <AlertIcon size={14} /> {error}
                </div>
              )}
            </div>
          </div>

          {/* Right — stats panel */}
          <div className="hero-panel">
            <div className="panel-title">Distribution at a glance</div>
            <div className="stat-list">
              <div className="stat-item">
                <div className="stat-icon teal"><UsersIcon size={18} /></div>
                <div className="stat-info">
                  <div className="stat-value">2.4M</div>
                  <div className="stat-label">Registered Beneficiaries</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon blue"><BoxIcon size={18} /></div>
                <div className="stat-info">
                  <div className="stat-value">18K</div>
                  <div className="stat-label">Distribution Points</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon amber"><ClockIcon size={18} /></div>
                <div className="stat-info">
                  <div className="stat-value">98%</div>
                  <div className="stat-label">On-time Delivery Rate</div>
                </div>
              </div>
            </div>
            <hr className="panel-divider" />
            <div className="panel-notice">
              <strong>Next distribution:</strong> 15 July 2025<br />
              Check your local office schedule for exact timing.
            </div>
          </div>
        </div>

      </section>

      {/* ── Main content ── */}
      <main className="main-content">
        <div className="page-wrap">

          {/* Result card */}
          {data && (
            <section className="result-section">
              <div className="result-card">

                {/* ── Header ── */}
                <div className="result-header">
                  <div className="result-header-inner">
                    <div className="result-header-left">
                      <div className="result-header-icon"><CardIcon size={20} /></div>
                      <div className="result-header-text">
                        <div className="result-title">Ration Card Details</div>
                        <div className="result-subtitle">Public Distribution System — Official Record</div>
                      </div>
                    </div>
                    <div className="result-verified-badge">
                      <CheckIcon size={12} />
                      Verified
                    </div>
                  </div>
                </div>

                {/* ── Meta strip ── */}
                <div className="result-meta-strip">
                  <div className="meta-field">
                    <div className="meta-field-label">Card Holder</div>
                    <div className="meta-field-value">{data.name}</div>
                  </div>
                  <div className="meta-field">
                    <div className="meta-field-label">Card Number</div>
                    <div className="meta-field-value">{data.cardNumber}</div>
                  </div>
                </div>

                {/* ── Products ── */}
                <div className="result-products">
                  <div className="products-heading">Allocated Products</div>
                  <ul className="product-list">
                    {(data.products || []).map((item, i) => (
                      <li key={i} className="product-item">
                        <span className="prod-name">{item.productName}</span>
                        <span className="prod-qty">{item.quantity} kg</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── Footer ── */}
                <div className="result-footer">
                  <button className="btn-collect" onClick={handleCollectClick} disabled={loading}>
                    {loading ? "Processing…" : "Register / Collect Ration"}
                  </button>
                  <OtpModal
                    open={otpModalOpen}
                    onClose={() => setOtpModalOpen(false)}
                    apiBase={API_BASE}
                    cardNumber={data?.cardNumber}
                    onVerified={issueRation}
                  />
                  {success && <span className="success-msg"><CheckIcon size={15} /> {success}</span>}
                  {error   && <span className="footer-error">{error}</span>}
                  <span className="footer-meta-note">
                    <AlertIcon size={12} />
                    Carry your original Ration Card &amp; valid ID when collecting
                  </span>
                </div>

              </div>
            </section>
          )}

          {/* Features */}
          <section className="features-section">
            <div className="section-header">
              <div className="section-eyebrow">Our services</div>
              <h2 className="section-title">What this portal offers</h2>
            </div>
            <div className="features-grid">
              <article className="feature-card">
                <div className="feature-icon blue"><SearchIcon size={20} /></div>
                <div className="feature-title">Fast Lookup</div>
                <p className="feature-desc">Access your ration distribution details instantly using your Ration Card Number. The system allows citizens to quickly verify their monthly allocations without requiring a login, ensuring convenience and accessibility for all users.</p>
              </article>
              <article className="feature-card">
                <div className="feature-icon teal"><FileIcon size={20} /></div>
                <div className="feature-title">Transparent Records</div>
                <p className="feature-desc">All ration distribution records, allocation details, and transaction history are securely maintained and openly accessible. This ensures complete transparency and accountability in the public distribution process.</p>
              </article>
              <article className="feature-card">
                <div className="feature-icon navy"><CheckIcon size={20} /></div>
                <div className="feature-title">Easy Registration</div>
                <p className="feature-desc">New users can quickly register their ration card details and distribution center information through a simple and user-friendly process. Registration enables smoother and faster ration collection at authorized distribution centers.</p>
              </article>
            </div>
          </section>

          {/* Transparency */}
          <section className="transparency-section">
            <div className="section-header">
              <div className="section-eyebrow">Government transparency</div>
              <h2 className="section-title">Public Information & Accountability</h2>
            </div>
            <div className="transparency-grid">
              <div className="info-card">
                <div className="info-card-icon">📊</div>
                <div className="info-card-title">Financial Reports</div>
                <p className="info-card-desc">Citizens can access official financial reports related to public distribution activities. These reports provide insights into budget allocations, expenditure, and operational transparency for the welfare system..</p>
                <a href="#" className="info-card-link">Explore <ArrowIcon size={12} /></a>
              </div>
              <div className="info-card">
                <div className="info-card-icon">📄</div>
                <div className="info-card-title">Public Documents</div>
                <p className="info-card-desc">Important government notices, circulars, policies, and official documentation related to the ration distribution system are available here for public access and verification.</p>
                <a href="#" className="info-card-link">Explore <ArrowIcon size={12} /></a>
              </div>
              <div className="info-card">
                <div className="info-card-icon">📈</div>
                <div className="info-card-title">Regional Statistics</div>
                <p className="info-card-desc">Explore statistical insights and data regarding ration distribution, beneficiary coverage, and regional development indicators. These statistics help promote data-driven governance and informed public awareness.</p>
                <a href="#" className="info-card-link">Explore <ArrowIcon size={12} /></a>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div>
          © 2025 Public Distribution System &nbsp;·&nbsp;
          <a href="#">Privacy Policy</a> &nbsp;·&nbsp;
          <a href="#">Terms of Use</a> &nbsp;·&nbsp;
          <a href="#">Contact</a>
        </div>
      </footer>

    </div>
  );
}