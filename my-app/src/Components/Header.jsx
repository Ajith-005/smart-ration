import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  const toggleMenu = () => setIsOpen((s) => !s);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeMenu();
    }

    function onClickOutside(e) {
      if (
        isOpen &&
        navRef.current &&
        !navRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClickOutside);
    };
  }, [isOpen]);

  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="header__brand" onClick={closeMenu}>
          <span className="logo-mark" aria-hidden>
            RR
          </span>
          <span className="logo-text">Ration Register</span>
        </Link>

        <nav
          ref={navRef}
          className={`header__nav ${isOpen ? "header__nav--open" : ""}`}
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `header__link ${isActive ? "header__link--active" : ""}`
              }
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <Link to="/admin" className="header__cta" onClick={closeMenu}>
            Admin
          </Link>

          <button
            ref={toggleRef}
            className={`header__toggle ${isOpen ? "header__toggle--open" : ""}`}
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            aria-label="Toggle menu"
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
