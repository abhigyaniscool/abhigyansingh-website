export default function AboutPage() {
  return (
    <div className="container">
      <h1 className="page-title">About Me</h1>
      <section className="section">
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          Hi, I&apos;m Abhigyan Singh — a high school student with a curiosity for learning,
          building, and exploring ideas. This site is where I share a bit about myself,
          my research, blogs, programs, and interests.
        </p>
        <p style={{ color: "var(--text-muted)" }}>
          You can use the tabs above to jump to Research, Blogs, Programs, or Interests.
          Feel free to reach out if you&apos;d like to connect!
        </p>
      </section>
    </div>
  );
}
