import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const themeBootstrapScript = `
  (function () {
    try {
      var match = document.cookie.match(/(?:^|; )cwa-theme=([^;]+)/);
      var saved = match ? decodeURIComponent(match[1]) : null;
      var theme = saved === "dark" || saved === "light" ? saved : "light";
      document.documentElement.setAttribute("data-theme", theme);
    } catch (error) {
      document.documentElement.setAttribute("data-theme", "light");
    }
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhonoTrail Studio - Classroom Activity Builder",
  description:
    "Frontend builder for phoneme-based Wordle and Word Search classroom activities.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full app-shell">
        <header className="site-header">
          <div className="shell-inner">
            <p className="eyebrow">Speech Pathology Teacher Toolkit</p>
            <h1 className="site-title">PhonoTrail Studio</h1>
            <p className="assessment-badge">Built for CSE3CWA Assessment 1</p>
            <nav className="desktop-nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/wordle">Wordle</Link>
              <Link href="/word-search">Word Search</Link>
              <Link href="/settings">Settings</Link>
            </nav>
            <details className="mobile-menu">
              <summary>Menu</summary>
              <div className="mobile-menu-panel">
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
                <Link href="/wordle">Wordle</Link>
                <Link href="/word-search">Word Search</Link>
                <Link href="/settings">Settings</Link>
              </div>
            </details>
          </div>
        </header>

        <main className="page-main">
          <div className="shell-inner">{children}</div>
        </main>

        <footer className="site-footer">
          <div className="shell-inner footer-row">
            <p>Name: Isaac Riley Lambert</p>
            <p>Student Number: 21593530</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
