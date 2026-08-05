import Link from "next/link";

export default function Home() {
  return (
    <section className="home-grid" aria-labelledby="home-heading">
      <article className="panel intro-panel">
        <p className="eyebrow">Project Overview</p>
        <h2 id="home-heading">Phoneme Classroom Activity Builder</h2>
        <p>
          This website helps teachers build phoneme-based Wordle and Word Search
          activities, preview them, and download a standalone HTML file for
          classroom use.
        </p>
        <p>
          Assessment 1 focuses on frontend design, usability, accessibility, and
          clean React structure.
        </p>
      </article>

      <article className="panel">
        <h3>Start Here</h3>
        <p>Use these pages in order while we build:</p>
        <div className="quick-links">
          <Link href="/about">About and Submission Info</Link>
          <Link href="/wordle">Build Wordle Activity</Link>
          <Link href="/word-search">Build Word Search Activity</Link>
          <Link href="/settings">Theme and Preferences</Link>
        </div>
      </article>
    </section>
  );
}
