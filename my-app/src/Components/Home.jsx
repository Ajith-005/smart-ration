import { useState } from "react";
import "./Home.css";

export default function Home() {
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    if (!cardNumber.trim()) {
      setError("Please enter card number");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/ration/search/${encodeURIComponent(
          cardNumber.trim()
        )}`
      );
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Card not found");
      }

      setData(result);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!data || !data.cardNumber) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/issue-ration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber: data.cardNumber, products: data.products }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Issuing failed");
      setSuccess(result.message || "Ration registered successfully");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="title">Ration Register Portal</h1>
          <p className="subtitle">
            Fast, transparent access to local ration entitlements and collection.
            Search your card to view allocations and register for collection.
          </p>

          <div className="search-inline" role="search">
            <label htmlFor="cardNumber" className="visually-hidden">
              Card number
            </label>
            <input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Card number"
              placeholder="Enter card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <button onClick={handleSearch} disabled={loading} className="btn">
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {error && <p className="error">{error}</p>}
        </div>
        <div className="hero-visual" aria-hidden>
          <div className="card-visual">
            <div className="chip" />
            <div className="card-lines">
              <span />
              <span />
            </div>
          </div>
        </div>
      </header>

      <main>
        {data && (
          <section className="result card">
            <h2>Ration Details</h2>
            <div className="result-grid">
              <div>
                <p className="muted">Card Holder</p>
                <p className="strong">{data.name}</p>
              </div>
              <div>
                <p className="muted">Card Number</p>
                <p className="strong">{data.cardNumber}</p>
              </div>
            </div>

            <h3>Products</h3>
            <ul className="product-list">
              {(data.products || []).map((item, i) => (
                <li key={i}>
                  <span className="prod-name">{item.productName}</span>
                  <span className="prod-qty">{item.quantity}</span>
                </li>
              ))}
            </ul>

            <div className="actions">
              <button className="btn primary" onClick={handleIssue} disabled={loading}>
                {loading ? "Processing…" : "Register / Collect"}
              </button>
              {success && <p className="muted" style={{ color: "green" }}>{success}</p>}
              {error && <p className="error">{error}</p>}
            </div>
          </section>
        )}

        <section className="features">
          <h2>What we offer</h2>
          <div className="features-grid">
            <article className="feature">
              <h3>Fast Lookup</h3>
              <p>Find ration allocations using only the card number.</p>
            </article>
            <article className="feature">
              <h3>Transparent Records</h3>
              <p>Official documents and allocation history are visible.</p>
            </article>
            <article className="feature">
              <h3>Simple Registration</h3>
              <p>Register quickly for collection at your local distribution point.</p>
            </article>
          </div>
        </section>

        <section className="transparency card">
          <h2>Transparansi Pemerintah</h2>
          <div className="card-grid">
            <div className="info-card">
              <h3>Laporan Keuangan</h3>
              <p>Dokumen laporan keuangan daerah</p>
            </div>
            <div className="info-card">
              <h3>Dokumen Publik</h3>
              <p>Informasi dan dokumen resmi</p>
            </div>
            <div className="info-card">
              <h3>Statistik Daerah</h3>
              <p>Data dan statistik pembangunan</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
