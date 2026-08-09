export default function AboutPage() {
  return (
    <section className="panel" aria-labelledby="about-heading">
      <p className="eyebrow">About This Project</p>
      <h2 id="about-heading">Assessment 1 — Frontend Design and Usability</h2>
      <p>
        This is a frontend-only web application designed for Speech Pathology teachers and students,
        with a polished educational experience that focuses on clarity, accessibility, and teaching usability.
      </p>
      <p>
        The experience was built with Next.js, React, TypeScript, and custom CSS styling to create a
        cohesive, responsive interface for classroom activities such as Wordle and Word Search.
      </p>

      <div className="feature-list compact">
        <article className="feature-card">
          <h3>Design Focus</h3>
          <p>Consistent visual language, clear hierarchy, and a modern educator-facing layout.</p>
        </article>
        <article className="feature-card">
          <h3>Usability Focus</h3>
          <p>Simple controls, helpful feedback, and a guided workflow for teachers.</p>
        </article>
        <article className="feature-card">
          <h3>Export Focus</h3>
          <p>Standalone HTML output that can be shared or printed for classroom use.</p>
        </article>
      </div>

      <h3>Student Details</h3>
      <p>Name: Isaac Riley Lambert</p>
      <p>Student Number: 21593530</p>

      <h3>Video Walkthrough</h3>
      <p>
        A short video walkthrough of the site will be embedded here as part of the final submission.
      </p>
      <div className="feature-card video-placeholder" style={{ marginTop: "0.5rem" }}>
        <h3>Video placeholder</h3>
        <p>Submission video will be attached here prior to the due date.</p>
      </div>

      <h3>Submission Note</h3>
      <p>
        This site is intended to feel like a practical educational product rather than a starter template,
        with the page structure and branded experience supporting the assessment brief.
      </p>
    </section>
  );
}
