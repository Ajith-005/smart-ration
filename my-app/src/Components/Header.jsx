import { useState, useEffect } from "react";
import "./Header.css";

const Icon = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round"
    strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);

const MenuIcon  = (p) => <Icon {...p} d="M3 12h18M3 6h18M3 18h18" />;
const CloseIcon = (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />;
const AdminIcon = (p) => <Icon {...p} d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zM3 20a9 9 0 0 1 18 0" />;

export default function Header({ activePage = "home" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home",     href: "/",        key: "home"     },
    { label: "Services", href: "/services", key: "services" },
    { label: "About",    href: "/about",    key: "about"    },
    { label: "Contact",  href: "/contact",  key: "contact"  },
  ];

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ── Top utility bar ── */}
      {/* <div className="topbar">
        <div className="topbar-inner">
          <span className="topbar-left">
            <span className="topbar-gov-dot" />
            Ministry of Food &amp; Public Distribution
          </span>
          <span className="topbar-links">
            <a href="#">Help</a>
            <a href="#">Grievances</a>
            <a href="#">Contact</a>
          </span>
        </div>
      </div> */}

      {/* ── Site header ── */}
      <header className="site-header">
        <div className="header-inner">

          {/* Logo */}
          <a href="/" className="site-logo">
            <div className="logo-emblem">RR</div>
            <div className="logo-text">
              <span className="logo-title">Ration Register</span>
              <span className="logo-sub">Public Distribution System</span>
            </div>
          </a>

          {/* Separator */}
          <div className="logo-sep" />

          {/* Desktop nav */}
          <nav className="desktop-nav" aria-label="Main navigation">
            {navLinks.map(({ label, href, key }) => (
              <a
                key={key}
                href={href}
                className={`nav-link${activePage === key ? " active" : ""}`}
              >
                {label}
              </a>
            ))}
            <div className="nav-divider" />
            <a href="/admin" className="nav-link nav-admin">
              <AdminIcon size={13} /> Admin
            </a>
          </nav>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>

        </div>
      </header>

      {/* ── Mobile fullscreen menu ── */}
      {menuOpen && (
        <div className="mobile-menu-overlay">
          <nav className="mobile-menu-body" aria-label="Mobile navigation">
            <div className="mobile-menu-links">
              {navLinks.map(({ label, href, key }) => (
                <a
                  key={key}
                  href={href}
                  onClick={closeMenu}
                  className={`mobile-menu-link${activePage === key ? " active" : ""}`}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="mobile-menu-footer">
              <a href="/admin" className="mobile-admin-btn" onClick={closeMenu}>
                <AdminIcon size={15} /> Admin Panel
              </a>
            </div>
          </nav>
          <div className="mobile-menu-backdrop" onClick={closeMenu} />
        </div>
      )}
    </>
  );
}