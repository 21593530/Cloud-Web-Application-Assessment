"use client";

import { useState } from "react";

type ThemeMode = "light" | "dark";

const THEME_COOKIE = "cwa-theme";

function readThemeFromCookie(): ThemeMode {
  if (typeof document === "undefined") {
    return "light";
  }

  const match = document.cookie.match(/(?:^|; )cwa-theme=([^;]+)/);
  const saved = match ? decodeURIComponent(match[1]) : null;
  return saved === "dark" ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark") {
      return "dark";
    }

    return readThemeFromCookie();
  });

  const selectTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <section className="settings-grid" aria-labelledby="settings-heading">
      <article className="panel">
        <p className="eyebrow">Settings</p>
        <h2 id="settings-heading">Theme and Preferences</h2>
        <p>
          Choose a theme that fits your classroom context. Your selection is
          saved and automatically reused the next time you open this app.
        </p>

        <div className="theme-option-grid" role="radiogroup" aria-label="Theme choice">
          <div className="theme-card">
            <button
              type="button"
              className={theme === "light" ? "active" : undefined}
              onClick={() => selectTheme("light")}
              role="radio"
              aria-checked={theme === "light"}
            >
              <strong>Light Theme</strong>
              <p className="settings-note">Bright, soft, and classroom-friendly.</p>
              <div className="swatches" aria-hidden="true">
                <span className="swatch" style={{ background: "#eef5ff" }} />
                <span className="swatch" style={{ background: "#2f7edb" }} />
                <span className="swatch" style={{ background: "#e8fff7" }} />
              </div>
            </button>
          </div>

          <div className="theme-card">
            <button
              type="button"
              className={theme === "dark" ? "active" : undefined}
              onClick={() => selectTheme("dark")}
              role="radio"
              aria-checked={theme === "dark"}
            >
              <strong>Dark Theme</strong>
              <p className="settings-note">Focused contrast for longer sessions.</p>
              <div className="swatches" aria-hidden="true">
                <span className="swatch" style={{ background: "#0f1c2c" }} />
                <span className="swatch" style={{ background: "#64adff" }} />
                <span className="swatch" style={{ background: "#153948" }} />
              </div>
            </button>
          </div>
        </div>
      </article>

      <article className="panel" aria-label="Design direction summary">
        <p className="eyebrow">Design Direction</p>
        <h3>Professional + Playful</h3>
        <p>
          The blue-first palette is paired with soft mint highlights so the
          interface feels academic, calm, and still engaging for educational
          use.
        </p>
        <p>
          This is the baseline visual system for all remaining pages in the
          assignment.
        </p>
      </article>
    </section>
  );
}
