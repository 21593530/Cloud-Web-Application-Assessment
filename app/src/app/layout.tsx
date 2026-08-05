import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSE3CWA Assessment 1 - Phoneme Activity Builder",
  description:
    "Frontend builder for phoneme-based Wordle and Word Search classroom activities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full app-shell">
        <header className="site-header">
          <div className="shell-inner">
            <p className="eyebrow">2026-CSE3CWA-(OL-2)</p>
            <h1 className="site-title">Assessment 1: Frontend Design and Usability</h1>
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
