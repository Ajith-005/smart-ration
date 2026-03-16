import "./About.css";
import Header from "./Header";

const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round"
    strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);

const IcoShield  = (p) => <Icon {...p} d="M12 2l7 4v5c0 5.25-3.5 10.14-7 11.5C8.5 21.14 5 16.25 5 11V6l7-4z" />;
const IcoUsers   = (p) => <Icon {...p} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const IcoBox     = (p) => <Icon {...p} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />;
const IcoCheck   = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
const IcoTarget  = (p) => <Icon {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />;
const IcoGlobe   = (p) => <Icon {...p} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />;
const IcoHeart   = (p) => <Icon {...p} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />;
const IcoStar    = (p) => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const IcoArrow   = (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />;
const IcoMail    = (p) => <Icon {...p} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />;
const IcoLi      = (p) => <Icon {...p} d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />;

const stats = [
  { value: "2.4M",  label: "Registered Beneficiaries", icon: <IcoUsers size={22} />,  color: "blue"  },
  { value: "18K",   label: "Distribution Points",       icon: <IcoBox size={22} />,    color: "teal"  },
  { value: "98%",   label: "On-time Delivery Rate",     icon: <IcoCheck size={22} />,  color: "navy"  },
  { value: "2026",  label: "Year Established",          icon: <IcoStar size={22} />,   color: "amber" },
];

const values = [
  { icon: <IcoShield size={22} />, color: "blue",  title: "Integrity",    desc: "We uphold the highest standards of transparency and accountability in every distribution cycle." },
  { icon: <IcoUsers  size={22} />, color: "teal",  title: "Inclusivity",  desc: "Every eligible family, regardless of location or background, deserves equal access to food security." },
  { icon: <IcoHeart  size={22} />, color: "navy",  title: "Compassion",   desc: "People are at the heart of our work. We listen, respond, and continuously improve for communities." },
  { icon: <IcoTarget size={22} />, color: "amber", title: "Precision",    desc: "Accurate records and data-driven processes ensure the right rations reach the right households." },
  { icon: <IcoGlobe  size={22} />, color: "blue",  title: "Reach",        desc: "A nationwide network of district offices and digital tools ensures seamless coverage." },
  { icon: <IcoStar   size={22} />, color: "teal",  title: "Excellence",   desc: "We continuously modernise our systems to deliver faster, smarter public service." },
];

// const timeline = [
//   { year: "1975", title: "Programme Founded",        desc: "The Public Distribution System was established by the Ministry of Domestic Trade to ensure food security for vulnerable households." },
//   { year: "1992", title: "Nationwide Expansion",     desc: "Distribution points expanded to cover all 13 states and 3 federal territories, reaching rural and underserved communities." },
//   { year: "2008", title: "Digital Transformation",   desc: "A centralised database was introduced, replacing paper records and enabling real-time tracking of distributions." },
//   { year: "2018", title: "Ration Register Portal",   desc: "The online portal launched, allowing beneficiaries to view allocations, register collections, and receive notifications." },
//   { year: "2024", title: "Mobile-First Upgrade",     desc: "Full mobile optimisation and real-time distribution tracking rolled out across all districts." },
//   { year: "2025", title: "Open Data Initiative",     desc: "Government transparency reports and allocation statistics published publicly to build citizen trust." },
// ];

const team = [
  { name: "Ajith",  role: "Developer",           dept: "Bsc.cs ( AI )",  initials: "P" },
  { name: "Naren Karthikeyan",role: "Backend Developer", dept: "Bsc.cs ( AI )",       initials: "N" },
  { name: "Vishnu Sabari", role: "UI & UX Developer",          dept: "Bsc.cs ( DS&A )", initials: "N.S" },
  { name: "Prathiyasan", role: "Data Base", dept: "Bsc.cs ( AI )",         initials: "G" },
];

export default function About() {
  return (
    <div className="about-page">
      {/* <Header activePage="about" /> */}

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-eyebrow">
            <span className="dot" /> About Us
          </div>
          <h1 className="about-hero-title">
            Serving the nation<br />
            <span>since 1975</span>
          </h1>
          <p className="about-hero-desc">
            The Ration Register Portal is Malaysia's official public distribution
            management system — connecting millions of households to essential
            food allocations through transparent, accountable governance.
          </p>
          <div className="about-hero-actions">
            <a href="/contact" className="btn-primary">
              Contact Us <IcoArrow size={15} />
            </a>
            <a href="#mission" className="btn-ghost">
              Our Mission
            </a>
          </div>
        </div>
        <svg className="about-hero-wave" viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 56 C240 0 480 0 720 28 C960 56 1200 8 1440 0 L1440 56 Z" fill="var(--bg)" />
        </svg>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats-section">
        <div className="about-wrap">
          <div className="about-stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="about-stat-card">
                <div className={`about-stat-icon ${s.color}`}>{s.icon}</div>
                <div className="about-stat-value">{s.value}</div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="about-mv-section" id="mission">
        <div className="about-wrap about-mv-grid">
          <div className="about-mv-text">
            <div className="section-eyebrow">What drives us</div>
            <h2 className="section-title">Mission &amp; Vision</h2>
            <p className="section-desc">
              We exist to ensure that every eligible Malaysian household receives
              their rightful food allocation — without delay, without corruption,
              and without barriers.
            </p>
            <div className="mv-cards">
              <div className="mv-card">
                <div className="mv-card-label">Our Mission</div>
                <p className="mv-card-text">
                  To deliver a fair, efficient, and transparent public distribution
                  system that upholds food security for all registered beneficiaries
                  across Malaysia.
                </p>
              </div>
              <div className="mv-card">
                <div className="mv-card-label">Our Vision</div>
                <p className="mv-card-text">
                  A Malaysia where no household goes without essential food supplies,
                  supported by a world-class digital distribution infrastructure.
                </p>
              </div>
            </div>
          </div>
          <div className="about-mv-visual">
            <div className="mv-visual-card">
              <div className="mv-visual-rings">
                <div className="ring ring-1" />
                <div className="ring ring-2" />
                <div className="ring ring-3" />
              </div>
              <div className="mv-visual-center">
                <div className="mv-center-icon"><IcoShield size={32} /></div>
                <div className="mv-center-label">Public Trust</div>
              </div>
              {["Transparency", "Accountability", "Efficiency", "Equity"].map((t, i) => (
                <div key={i} className={`mv-orbit-tag tag-${i}`}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values-section">
        <div className="about-wrap">
          <div className="section-header-center">
            <div className="section-eyebrow">What we stand for</div>
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <div className={`value-icon ${v.color}`}>{v.icon}</div>
                <div className="value-title">{v.title}</div>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      {/* <section className="about-timeline-section">
        <div className="about-wrap">
          <div className="section-header-center">
            <div className="section-eyebrow">Our journey</div>
            <h2 className="section-title">50 Years of Service</h2>
          </div>
          <div className="timeline">
            {timeline.map((t, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? "left" : "right"}`}>
                <div className="timeline-content">
                  <div className="timeline-year">{t.year}</div>
                  <div className="timeline-title">{t.title}</div>
                  <p className="timeline-desc">{t.desc}</p>
                </div>
                <div className="timeline-dot" />
              </div>
            ))}
            <div className="timeline-line" />
          </div>
        </div>
      </section> */}

      {/* ── Team ── */}
      <section className="about-team-section">
        <div className="about-wrap">
          <div className="section-header-center">
            <div className="section-eyebrow">Leadership</div>
            <h2 className="section-title">Meet the Team</h2>
          </div>
          <div className="team-grid">
            {team.map((m, i) => (
              <div key={i} className="team-card">
                <div className="team-avatar">{m.initials}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-dept">{m.dept}</div>
                <div className="team-social">
                  <a href="#" className="team-social-btn"><IcoMail size={14} /></a>
                  <a href="#" className="team-social-btn"><IcoLi size={14} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-section">
        <div className="about-wrap">
          <div className="about-cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Ready to get started?</h2>
              <p className="cta-desc">
                Search your ration card number to view your allocations and register
                for collection at your nearest distribution point.
              </p>
              <div className="cta-actions">
                <a href="/" className="btn-primary">Search My Card <IcoArrow size={15} /></a>
                <a href="/contact" className="btn-ghost-light">Contact Support</a>
              </div>
            </div>
            <div className="cta-decoration" aria-hidden>
              <div className="cta-ring cta-ring-1" />
              <div className="cta-ring cta-ring-2" />
              <div className="cta-ring cta-ring-3" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
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