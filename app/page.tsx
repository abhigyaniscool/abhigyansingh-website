export default function HomePage() {
  return (
    <>
      {/* About Me Section */}
      <section id="about" className="page-section">
        <div className="container">
          <h1 className="page-title">About Me</h1>
          <div className="section">
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Hi, I&apos;m Abhigyan Singh — class of 2027 at Lynbrook High School with a curiosity for learning,
              building, and exploring ideas. This site is where I share a bit about myself,
              my research, blogs, programs, and interests.
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              Scroll down to explore more sections, or use the tabs above to jump to Research, Blogs, Programs, or Interests.
              Feel free to reach out if you&apos;d like to connect!
            </p>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section id="research" className="page-section">
        <div className="container">
          <h1 className="page-title">Research</h1>
          <div className="section">
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              This section is for projects, papers, or experiments I&apos;m working on or have
              completed. I&apos;ll add details here as I go.
            </p>
            <div className="card">
              <h3>Coming soon</h3>
              <p>Research projects and write-ups will be listed here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="page-section">
        <div className="container">
          <h1 className="page-title">Blogs</h1>
          <div className="section">
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Thoughts, tutorials, and notes I write from time to time.
            </p>
            <div className="card">
              <h3>Coming soon</h3>
              <p>Blog posts will appear here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="page-section">
        <div className="container">
          <h1 className="page-title">Programs</h1>
          <div className="section">
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Code projects, scripts, and small tools I&apos;ve built or contributed to.
            </p>
            <div className="card">
              <h3>Coming soon</h3>
              <p>Programs and repositories will be linked here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interests Section */}
      <section id="interests" className="page-section">
        <div className="container">
          <h1 className="page-title">Interests</h1>
          <div className="section">
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Topics and hobbies I enjoy exploring outside of school.
            </p>
            <div className="card">
              <h3>Coming soon</h3>
              <p>I&apos;ll list my interests and side projects here.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
