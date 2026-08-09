import Link from "next/link";

export default function Home() {
  return (
    <section className="home-grid" aria-labelledby="home-heading">
      <article className="panel intro-panel">
        <p className="eyebrow">Welcome to your teaching toolkit</p>
        <h2 id="home-heading">Create polished phoneme activities in minutes</h2>
        <p>
          PhonoTrail Studio helps teachers build Wordle and Word Search tasks,
          preview them in context, and export a classroom-ready HTML file with a
          professional presentation.
        </p>
        <p>
          The experience is shaped around the Assessment 1 — Frontend Design and
          Usability brief, balancing practical lesson prep with a more complete,
          website-like experience for educators.
        </p>
      </article>

      <article className="panel">
        <h3>Teacher workflow</h3>
        <p>Follow this flow when preparing a class activity:</p>
        <div className="quick-links">
          <Link href="/about">Open project overview</Link>
          <Link href="/wordle">Create a Wordle task</Link>
          <Link href="/word-search">Create a Word Search task</Link>
          <Link href="/settings">Adjust theme and preferences</Link>
        </div>
      </article>

      <article className="panel feature-stack">
        <div className="feature-list">
          <div className="feature-card">
            <h3>Rapid prep</h3>
            <p>Generate a task quickly without losing the polished presentation.</p>
          </div>
          <div className="feature-card">
            <h3>Flexible export</h3>
            <p>Download an attractive HTML worksheet that is easy to share or print.</p>
          </div>
          <div className="feature-card">
            <h3>Teacher focus</h3>
            <p>Designed for speech pathology teaching with clear, simple interactions.</p>
          </div>
        </div>
      </article>
    </section>
  );
}
