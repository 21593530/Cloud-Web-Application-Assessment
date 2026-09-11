"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
  { href: "/settings", label: "Settings" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell-inner">
        <div className="header-row">
          <div>
            <p className="eyebrow">Speech Pathology Teacher Toolkit</p>
            <h1 className="site-title">PhonoTrail Studio</h1>
          </div>

          <nav className="desktop-nav" aria-label="Main navigation">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={isActive ? "active" : ""}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <p className="assessment-badge">Assessment 2: Full-stack extension</p>

        {isMenuOpen ? (
          <div className="mobile-menu-panel" role="menu">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? "active" : ""}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
