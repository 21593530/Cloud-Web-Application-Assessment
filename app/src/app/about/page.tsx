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
      <h2 id="about-backend-heading">Assessment 2 — Backend Implementation and Database Integration</h2>
      <p>
        Assessment 2 builds on this same toolkit with a database behind the scenes for staff. Teachers can
        now save an activity they have built, come back later to load and keep editing it, and remove
        activities they no longer need — all without changing how the Wordle and Word Search builders look
        or feel to use.
      </p>

      <h2 id="about-reporting-heading">Assessment 3 — Data-driven Application and Reporting</h2>
      <p>
        Assessment 3 extends the persisted builders with a dedicated operational dashboard. It connects
        current Wordle and Word Search activities with stored usage events to report activity counts,
        average time on page, the most-used output, generation outcomes, recent records, and seven-day trends.
      </p>
      <p>
        Live and simulated records are labelled clearly, while a Prisma-backed healthcheck and visible warning
        states make the application easier to monitor. Playwright, JMeter, and Lighthouse evidence is used to
        explain reliability, behaviour under load, and accessibility improvements.
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
        <article className="feature-card">
          <h3>Reporting Focus</h3>
          <p>Dashboard summaries connect saved activities with clearly labelled live and simulated usage records.</p>
        </article>
        <article className="feature-card">
          <h3>Observability Focus</h3>
          <p>Database-backed health status and visible warnings make unusual operational states easy to understand.</p>
        </article>
        <article className="feature-card">
          <h3>Verification Focus</h3>
          <p>Playwright, JMeter, and Lighthouse results explain reliability, load behaviour, and accessibility.</p>
        </article>
      </div>

      <h3>Student Details</h3>
      <p>Name: Isaac Riley Lambert</p>
      <p>Student Number: 21593530</p>

      <h3>Video Walkthrough</h3>
      <p>
        A short video walkthrough of the site is embedded here as part of the final submission.
      </p>
      <div className="feature-card" style={{ marginTop: "0.5rem" }}>
        <video
          controls
          preload="metadata"
          style={{ width: "100%", borderRadius: "12px", background: "#000" }}
        >
          <source src="/phonotrailaboutvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <h3>Submission Note</h3>
      <p>
        This site is intended to feel like a practical educational product rather than a starter template,
        with the page structure and branded experience supporting the assessment brief.
      </p>
    </section>
  );
}
