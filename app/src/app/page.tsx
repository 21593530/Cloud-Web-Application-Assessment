import Link from "next/link";

export default function Home() {
  return (
    <section className="home-page" aria-labelledby="home-heading">
      <article className="panel home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Teacher workspace</p>
          <h2 id="home-heading">Build phoneme activities that are easy to teach and easy to reuse.</h2>
          <p>
            PhonoTrail Studio helps educators create Wordle and Word Search tasks,
            store them in a database-backed workflow, and export polished classroom-ready worksheets.
          </p>
          <div className="home-hero-actions">
            <Link href="/wordle" className="primary-cta">
              Open Wordle builder
            </Link>
            <Link href="/word-search" className="secondary-cta">
              Open Word Search builder
            </Link>
          </div>
        </div>

        <aside className="home-hero-panel" aria-label="Quick start panel">
          <p className="panel-kicker">Quick start</p>
          <div className="home-quick-list">
            <Link href="/about">View project overview</Link>
            <Link href="/wordle">Create a Wordle task</Link>
            <Link href="/word-search">Create a Word Search task</Link>
            <Link href="/settings">Adjust theme settings</Link>
          </div>
        </aside>
      </article>

      <div className="home-lower-grid">
        <article className="panel home-overview">
          <p className="eyebrow">What it supports</p>
          <h3>Everything a speech-path teaching session needs</h3>
          <ul className="home-feature-list">
            <li>
              <span className="feature-bullet">01</span>
              <div>
                <strong>Saved activities</strong>
                <p>Create, revisit, and update lesson tasks through a reliable database workflow.</p>
              </div>
            </li>
            <li>
              <span className="feature-bullet">02</span>
              <div>
                <strong>Validated API</strong>
                <p>Shared Zod contracts support safe create, update, and delete actions.</p>
              </div>
            </li>
            <li>
              <span className="feature-bullet">03</span>
              <div>
                <strong>Accessible practice</strong>
                <p>Keyboard-friendly interaction and clear status feedback support classroom use.</p>
              </div>
            </li>
          </ul>
        </article>

        <article className="panel home-summary">
          <p className="eyebrow">Build flow</p>
          <h3>From idea to export in one workflow</h3>
          <div className="mini-stat-stack">
            <div className="mini-stat">
              <strong>Wordle</strong>
              <span>Phoneme targeting, clueing, and difficulty settings</span>
            </div>
            <div className="mini-stat">
              <strong>Word Search</strong>
              <span>Grid setup, reverse matching, and printable export</span>
            </div>
            <div className="mini-stat">
              <strong>Export</strong>
              <span>Download a classroom-ready HTML file in one click</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
