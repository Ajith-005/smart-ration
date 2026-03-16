import { useState } from "react";
import "./Services.css";
import Header from "./Header";

const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round"
    strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);

const IcoCard     = (p) => <Icon {...p} d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />;
const IcoBox      = (p) => <Icon {...p} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />;
const IcoEdit     = (p) => <Icon {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
const IcoAlert    = (p) => <Icon {...p} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;
const IcoSearch   = (p) => <Icon {...p} d="M21 21l-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z" />;
const IcoUsers    = (p) => <Icon {...p} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const IcoCheck    = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
const IcoFile     = (p) => <Icon {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />;
const IcoArrow    = (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />;
const IcoPhone    = (p) => <Icon {...p} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.07 6.07l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const IcoClock    = (p) => <Icon {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" />;
const IcoMap      = (p) => <Icon {...p} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const IcoChevron  = (p) => <Icon {...p} d="M6 9l6 6 6-6" />;
const IcoStar     = (p) => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;

/* ── Data ── */
const services = [
  {
    id: "registration",
    icon: <IcoCard size={24} />,
    color: "blue",
    badge: "Most Popular",
    title: "New Card Registration",
    desc: "Register your household for a new ration card to begin receiving monthly food allocations.",
    time: "7–14 working days",
    fee: "Free",
    steps: ["Submit application at district office", "Document verification", "Household assessment", "Card issuance"],
  },
  {
    id: "collection",
    icon: <IcoBox size={24} />,
    color: "teal",
    badge: "Monthly",
    title: "Ration Collection",
    desc: "Register and collect your monthly ration allocation at your designated distribution point.",
    time: "Same day",
    fee: "Free",
    steps: ["Search card on portal", "Confirm allocation", "Visit distribution point", "Collect & sign"],
  },
  {
    id: "correction",
    icon: <IcoEdit size={24} />,
    color: "navy",
    badge: "Update",
    title: "Card Correction & Update",
    desc: "Update personal details, change address, or correct errors on your existing ration card.",
    time: "3–7 working days",
    fee: "Free",
    steps: ["Fill correction form", "Attach supporting docs", "Submit to district office", "Receive updated card"],
  },
  {
    id: "grievance",
    icon: <IcoAlert size={24} />,
    color: "amber",
    badge: "Support",
    title: "Grievance Submission",
    desc: "Report issues with distribution, incorrect allocations, or card-related disputes.",
    time: "5–10 working days",
    fee: "Free",
    steps: ["Submit grievance online or in-person", "Case reference issued", "Investigation conducted", "Resolution notified"],
  },
  {
    id: "transfer",
    icon: <IcoMap size={24} />,
    color: "teal",
    badge: "Transfer",
    title: "District Transfer",
    desc: "Transfer your ration card registration to a new district when relocating.",
    time: "10–14 working days",
    fee: "Free",
    steps: ["Apply at new district office", "Submit proof of residence", "Old record archived", "New card issued"],
  },
  {
    id: "status",
    icon: <IcoSearch size={24} />,
    color: "blue",
    badge: "Online",
    title: "Application Status Check",
    desc: "Track the progress of your card application, correction request, or grievance online.",
    time: "Instant",
    fee: "Free",
    steps: ["Enter reference number", "View real-time status", "Download status letter", "Receive SMS updates"],
  },
];

const eligibility = [
  { icon: <IcoUsers size={20} />, color: "blue",  title: "Malaysian Citizens", desc: "Must be a registered Malaysian citizen with a valid MyKad or MyKid." },
  { icon: <IcoCard  size={20} />, color: "teal",  title: "Household Income",   desc: "Household income below RM 5,000 per month or as determined by ministry guidelines." },
  { icon: <IcoMap   size={20} />, color: "navy",  title: "Permanent Resident", desc: "Must have a fixed permanent address in the applying district." },
  { icon: <IcoStar  size={20} />, color: "amber", title: "Not Duplicate",      desc: "Household must not already hold an active ration card in any district." },
];

const documents = [
  { label: "MyKad (original + photocopy)", required: true },
  { label: "Proof of residence (utility bill / tenancy agreement)", required: true },
  { label: "Marriage certificate (if applicable)", required: false },
  { label: "Birth certificates of dependants", required: false },
  { label: "Latest salary slip or income proof", required: true },
  { label: "Completed application form (available at office)", required: true },
  { label: "Passport-sized photographs (2 copies)", required: true },
  { label: "Previous ration card (for correction/transfer)", required: false },
];

const howItWorks = [
  { step: "01", title: "Search Your Card",    desc: "Enter your ration card number on our portal to instantly view your household's allocation details.", icon: <IcoSearch size={22} /> },
  { step: "02", title: "Review Allocation",   desc: "Check which products and quantities are allocated to your household for the current distribution month.", icon: <IcoFile size={22} /> },
  { step: "03", title: "Register Collection", desc: "Confirm your intent to collect by clicking Register. This locks in your slot at the distribution point.", icon: <IcoCheck size={22} /> },
  { step: "04", title: "Visit & Collect",     desc: "Bring your ration card and valid IC to the distribution point on or before the stated date to collect.", icon: <IcoBox size={22} /> },
];

export default function Services() {
  const [activeService, setActiveService] = useState(null);
  const [trackRef, setTrackRef] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackRef.trim()) return;
    setTrackLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setTrackResult({
      ref: trackRef.toUpperCase(),
      service: "New Card Registration",
      status: "In Progress",
      step: 2,
      total: 4,
      steps: ["Application Received", "Document Verification", "Household Assessment", "Card Issuance"],
      lastUpdated: new Date().toLocaleDateString("en-MY", { day:"numeric", month:"long", year:"numeric" }),
    });
    setTrackLoading(false);
  };

  return (
    <div className="services-page">
      {/* <Header activePage="services" /> */}

      {/* ── Hero ── */}
      <section className="svc-hero">
        <div className="svc-hero-inner">
          <div className="svc-eyebrow"><span className="dot" /> Our Services</div>
          <h1 className="svc-hero-title">
            Everything you need,<br /><span>in one place</span>
          </h1>
          <p className="svc-hero-desc">
            From new card registration to monthly collections and grievance
            support — all government ration services available digitally
            and at your local district office.
          </p>
          <div className="svc-hero-pills">
            {["Card Registration", "Ration Collection", "Corrections", "Grievances", "Transfers", "Status Tracking"].map((p, i) => (
              <span key={i} className="svc-pill">{p}</span>
            ))}
          </div>
        </div>
        <svg className="svc-hero-wave" viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 56 C240 0 480 0 720 28 C960 56 1200 8 1440 0 L1440 56 Z" fill="var(--bg)" />
        </svg>
      </section>

      {/* ── How it works ── */}
      <section className="svc-how-section">
        <div className="svc-wrap">
          <div className="svc-section-header center">
            <div className="svc-eyebrow-dark">Simple process</div>
            <h2 className="svc-section-title">How it works</h2>
            <p className="svc-section-desc">Collect your monthly ration in four easy steps.</p>
          </div>
          <div className="how-grid">
            {howItWorks.map((h, i) => (
              <div key={i} className="how-card">
                <div className="how-step-num">{h.step}</div>
                <div className="how-icon">{h.icon}</div>
                <div className="how-title">{h.title}</div>
                <p className="how-desc">{h.desc}</p>
                {i < howItWorks.length - 1 && <div className="how-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services grid ── */}
      <section className="svc-list-section">
        <div className="svc-wrap">
          <div className="svc-section-header">
            <div>
              <div className="svc-eyebrow-dark">What we offer</div>
              <h2 className="svc-section-title">All Services</h2>
            </div>
          </div>
          <div className="svc-grid">
            {services.map((s) => (
              <div
                key={s.id}
                className={`svc-card${activeService === s.id ? " expanded" : ""}`}
                onClick={() => setActiveService(activeService === s.id ? null : s.id)}
              >
                <div className="svc-card-top">
                  <div className={`svc-card-icon ${s.color}`}>{s.icon}</div>
                  <span className={`svc-badge ${s.color}`}>{s.badge}</span>
                </div>
                <div className="svc-card-title">{s.title}</div>
                <p className="svc-card-desc">{s.desc}</p>
                <div className="svc-card-meta">
                  <span className="svc-meta-item"><IcoClock size={13} /> {s.time}</span>
                  <span className="svc-meta-item"><IcoStar size={13} /> {s.fee}</span>
                </div>
                <button className="svc-card-toggle">
                  {activeService === s.id ? "Hide steps" : "View steps"}
                  <IcoChevron size={14} style={{ transform: activeService === s.id ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </button>
                {activeService === s.id && (
                  <div className="svc-steps">
                    {s.steps.map((step, i) => (
                      <div key={i} className="svc-step">
                        <div className="svc-step-num">{i + 1}</div>
                        <span>{step}</span>
                      </div>
                    ))}
                    <a href="/contact" className="svc-apply-btn">
                      Apply Now <IcoArrow size={13} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Track status ── */}
      <section className="svc-track-section">
        <div className="svc-wrap">
          <div className="svc-track-card">
            <div className="svc-track-left">
              <div className="svc-eyebrow-light">Real-time tracking</div>
              <h2 className="svc-track-title">Track your application</h2>
              <p className="svc-track-desc">
                Enter your reference number to instantly check the status of any
                service request — registration, correction, transfer, or grievance.
              </p>
              <form className="track-form" onSubmit={handleTrack}>
                <div className="track-input-wrap">
                  <IcoSearch size={16} className="track-icon" />
                  <input
                    className="track-input"
                    type="text"
                    placeholder="e.g. REF-2025-00123"
                    value={trackRef}
                    onChange={e => setTrackRef(e.target.value)}
                  />
                </div>
                <button className="track-btn" type="submit" disabled={trackLoading}>
                  {trackLoading ? <><span className="btn-spinner" /> Checking…</> : <>Track Status <IcoArrow size={14} /></>}
                </button>
              </form>

              {trackResult && (
                <div className="track-result">
                  <div className="track-result-header">
                    <span className="track-ref">{trackResult.ref}</span>
                    <span className="track-service-label">{trackResult.service}</span>
                  </div>
                  <div className="track-progress-bar">
                    {trackResult.steps.map((s, i) => (
                      <div key={i} className={`track-progress-step${i < trackResult.step ? " done" : i === trackResult.step - 1 ? " active" : ""}`}>
                        <div className="track-dot">
                          {i < trackResult.step ? <IcoCheck size={10} /> : i + 1}
                        </div>
                        <span className="track-step-label">{s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="track-updated">Last updated: {trackResult.lastUpdated}</div>
                </div>
              )}
            </div>
            <div className="svc-track-right" aria-hidden>
              <div className="track-visual">
                <div className="track-vis-ring track-vis-ring-1" />
                <div className="track-vis-ring track-vis-ring-2" />
                <div className="track-vis-center"><IcoSearch size={28} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Eligibility ── */}
      <section className="svc-eligibility-section">
        <div className="svc-wrap">
          <div className="svc-section-header center">
            <div className="svc-eyebrow-dark">Who can apply</div>
            <h2 className="svc-section-title">Eligibility Criteria</h2>
            <p className="svc-section-desc">You must meet all of the following criteria to register for a ration card.</p>
          </div>
          <div className="eligibility-grid">
            {eligibility.map((e, i) => (
              <div key={i} className="eligibility-card">
                <div className={`eligibility-icon ${e.color}`}>{e.icon}</div>
                <div className="eligibility-title">{e.title}</div>
                <p className="eligibility-desc">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Documents ── */}
      <section className="svc-docs-section">
        <div className="svc-wrap svc-docs-grid">
          <div className="svc-docs-text">
            <div className="svc-eyebrow-dark">Be prepared</div>
            <h2 className="svc-section-title">Required Documents</h2>
            <p className="svc-section-desc">
              Ensure you bring all required documents when visiting your district
              office to avoid delays in processing.
            </p>
            <a href="/contact" className="svc-contact-link">
              Need help? Contact us <IcoArrow size={14} />
            </a>
          </div>
          <div className="docs-list-card">
            <div className="docs-list-header">
              <IcoFile size={16} /> Documents Checklist
            </div>
            <ul className="docs-list">
              {documents.map((d, i) => (
                <li key={i} className="doc-item">
                  <span className={`doc-check ${d.required ? "required" : "optional"}`}>
                    {d.required ? <IcoCheck size={12} /> : "—"}
                  </span>
                  <span className="doc-label">{d.label}</span>
                  <span className={`doc-tag ${d.required ? "req" : "opt"}`}>
                    {d.required ? "Required" : "If applicable"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Contact strip ── */}
      <section className="svc-contact-strip">
        <div className="svc-wrap svc-contact-inner">
          <div className="svc-contact-item">
            <div className="svc-contact-icon"><IcoPhone size={18} /></div>
            <div>
              <div className="svc-contact-label">Call Us</div>
              <div className="svc-contact-value">+60 3-8888 9999</div>
            </div>
          </div>
          <div className="svc-contact-divider" />
          <div className="svc-contact-item">
            <div className="svc-contact-icon"><IcoClock size={18} /></div>
            <div>
              <div className="svc-contact-label">Office Hours</div>
              <div className="svc-contact-value">Mon – Fri, 8:00 AM – 5:00 PM</div>
            </div>
          </div>
          <div className="svc-contact-divider" />
          <div className="svc-contact-item">
            <div className="svc-contact-icon"><IcoMap size={18} /></div>
            <div>
              <div className="svc-contact-label">Find an Office</div>
              <div className="svc-contact-value">18,000+ distribution points nationwide</div>
            </div>
          </div>
          <a href="/contact" className="svc-contact-btn">
            Get in Touch <IcoArrow size={14} />
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          © 2025 Public Distribution System &nbsp;·&nbsp;
          <a href="#">Privacy Policy</a> &nbsp;·&nbsp;
          <a href="#">Terms of Use</a> &nbsp;·&nbsp;
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}