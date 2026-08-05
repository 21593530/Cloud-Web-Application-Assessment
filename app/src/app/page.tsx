import Link from "next/link";

export default function Home() {
  return (
    <section className="home-grid" aria-labelledby="home-heading">
      <article className="panel intro-panel">
        <p className="eyebrow">Welcome to Your Builder</p>
        <h2 id="home-heading">Design Engaging Phoneme Activities in Minutes</h2>
        <p>
          PhonoTrail Studio helps teachers create phoneme-based Wordle and Word
          Search activities, preview each one, and export a standalone classroom
          HTML file.
        </p>
        <p>
          The experience is designed to feel simple during lesson prep while
          still supporting clear phoneme hints and accessibility needs.
        </p>
      </article>

      <article className="panel">
        <h3>Teacher Workflow</h3>
        <p>Follow this flow when preparing a class activity:</p>
        <div className="quick-links">
          <Link href="/about">Open Project Overview</Link>
          <Link href="/wordle">Create a Wordle Task</Link>
          <Link href="/word-search">Create a Word Search Task</Link>
          <Link href="/settings">Adjust Theme and Preferences</Link>
        </div>
      </article>
    </section>
  );
}
