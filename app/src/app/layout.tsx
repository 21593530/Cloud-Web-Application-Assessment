import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Baloo_2, Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
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

const baloo = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "PhonoTrail Studio - Backend & Database Integration",
  description:
    "Full-stack builder for phoneme-based Wordle and Word Search classroom activities, backed by a database and validated API.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("cwa-theme")?.value;
  const initialTheme = savedTheme === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full app-shell">
        <SiteHeader />

        <main className="page-main">
          <div className="shell-inner">{children}</div>
        </main>

        <footer className="site-footer">
          <div className="shell-inner footer-row">
            <p>Name: Isaac Riley Lambert</p>
            <p>Student Number: 21593530</p>
            <p>Assessment 2 · Backend Implementation and Database Integration</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
