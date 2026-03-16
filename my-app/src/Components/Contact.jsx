import { useState } from "react";
import "./Contact.css";
import Header from "./Header";

const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round"
    strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);

const IcoMail    = (p) => <Icon {...p} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />;
const IcoPhone   = (p) => <Icon {...p} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.07 6.07l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const IcoMap     = (p) => <Icon {...p} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const IcoClock   = (p) => <Icon {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" />;
const IcoSend    = (p) => <Icon {...p} d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />;
const IcoCheck   = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
const IcoArrow   = (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />;
const IcoFb      = (p) => <Icon {...p} d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />;
const IcoTw      = (p) => <Icon {...p} d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />;
const IcoIn      = (p) => <Icon {...p} d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />;

const TOPICS = [
  "General Enquiry",
  "Ration Card Registration",
  "Distribution Issue",
  "Card Correction / Update",
  "Grievance",
  "Other",
];

export default function Contact() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", topic:"", message:"" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.topic)          e.topic   = "Please select a topic";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setErrors({ submit: data && data.message ? data.message : 'Failed to send message' });
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Contact submit error', err);
      setErrors({ submit: 'Unable to reach server. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <IcoMail size={20} />,
      color: "blue",
      label: "Email Us",
      primary: "support@rationregister.gov",
      secondary: "We respond within 1 business day",
    },
    {
      icon: <IcoPhone size={20} />,
      color: "teal",
      label: "Call Us",
      primary: "+60 3-8888 9999",
      secondary: "Mon – Fri, 8:00 AM – 5:00 PM",
    },
    {
      icon: <IcoMap size={20} />,
      color: "navy",
      label: "Visit Us",
      primary: "Level 5, Federal Government Admin Centre",
      secondary: "62502 Putrajaya, Malaysia",
    },
    {
      icon: <IcoClock size={20} />,
      color: "amber",
      label: "Office Hours",
      primary: "Monday – Friday",
      secondary: "8:00 AM – 5:00 PM (closed public holidays)",
    },
  ];

  return (
    <div className="contact-page">

      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-eyebrow">
            <span className="dot" /> Get in Touch
          </div>
          <h1 className="contact-hero-title">
            How can we <span>help you?</span>
          </h1>
          <p className="contact-hero-desc">
            Reach out to our team for assistance with ration card services,
            distribution queries, or general enquiries.
          </p>
        </div>
        <svg className="contact-hero-wave" viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 56 C240 0 480 0 720 28 C960 56 1200 8 1440 0 L1440 56 Z" fill="var(--bg)" />
        </svg>
      </section>

      {/* ── Info cards ── */}
      <section className="contact-info-section">
        <div className="contact-wrap">
          <div className="contact-info-grid">
            {contactInfo.map((c, i) => (
              <div key={i} className="contact-info-card">
                <div className={`contact-info-icon ${c.color}`}>{c.icon}</div>
                <div className="contact-info-label">{c.label}</div>
                <div className="contact-info-primary">{c.primary}</div>
                <div className="contact-info-secondary">{c.secondary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + sidebar ── */}
      <section className="contact-main-section">
        <div className="contact-wrap contact-cols">

          {/* Form */}
          <div className="contact-form-wrap">
            <div className="contact-form-card">
              {submitted ? (
                <div className="contact-success">
                  <div className="success-icon-wrap">
                    <IcoCheck size={28} />
                  </div>
                  <h2 className="success-title">Message sent!</h2>
                  <p className="success-desc">
                    Thank you for contacting us. Our team will get back to you
                    within 1 business day.
                  </p>
                  <button className="btn-send" onClick={() => { setSubmitted(false); setForm({ name:"",email:"",phone:"",topic:"",message:"" }); }}>
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-card-header">
                    <h2 className="form-card-title">Send us a message</h2>
                    <p className="form-card-sub">Fill in the form below and we'll respond promptly.</p>
                  </div>

                  <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full name <span className="req">*</span></label>
                        <input className={`form-input${errors.name ? " error" : ""}`} type="text" placeholder="e.g. Ahmad bin Ismail" value={form.name} onChange={set("name")} />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email address <span className="req">*</span></label>
                        <input className={`form-input${errors.email ? " error" : ""}`} type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Phone number <span className="opt">(optional)</span></label>
                        <input className="form-input" type="tel" placeholder="+60 1X-XXX XXXX" value={form.phone} onChange={set("phone")} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Topic <span className="req">*</span></label>
                        <select className={`form-input${errors.topic ? " error" : ""}`} value={form.topic} onChange={set("topic")}>
                          <option value="">Select a topic…</option>
                          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.topic && <span className="form-error">{errors.topic}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message <span className="req">*</span></label>
                      <textarea
                        className={`form-input form-textarea${errors.message ? " error" : ""}`}
                        placeholder="Describe your enquiry in detail…"
                        rows={5}
                        value={form.message}
                        onChange={set("message")}
                      />
                      {errors.message && <span className="form-error">{errors.message}</span>}
                    </div>

                    {errors.submit && <div className="form-error submit-error">{errors.submit}</div>}
                    <button className="btn-send" type="submit" disabled={loading}>
                      {loading
                        ? <><span className="btn-spinner" /> Sending…</>
                        : <><IcoSend size={15} /> Send Message</>
                      }
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="contact-sidebar">

            {/* FAQ */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">Common questions</h3>
              <div className="faq-list">
                {[
                  { q: "How do I register a new ration card?", a: "Visit your nearest distribution office with your IC and proof of residence." },
                  { q: "When is the next distribution?", a: "Distribution dates are published monthly. Check the announcements on the home page." },
                  { q: "How do I update my address?", a: "Submit a correction form at your district office with supporting documents." },
                  { q: "Can I collect on behalf of someone?", a: "Yes, with a signed authorization letter and a copy of the card holder's IC." },
                ].map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">Follow us</h3>
              <div className="social-row">
                <a href="#" className="social-btn fb"><IcoFb size={16} /></a>
                <a href="#" className="social-btn tw"><IcoTw size={16} /></a>
                <a href="#" className="social-btn li"><IcoIn size={16} /></a>
              </div>
              <p className="sidebar-note">
                Stay updated with the latest distribution news and announcements.
              </p>
            </div>

          </aside>
        </div>
      </section>

      {/* Footer */}
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

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <Icon
          d="M6 9l6 6 6-6"
          size={15}
          style={{ flexShrink:0, transform: open ? "rotate(180deg)" : "none", transition:"transform .2s" }}
        />
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}