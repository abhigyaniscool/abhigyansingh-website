export default function AboutSection() {
  return (
    <section id="about" className="page-section">
      <div className="container">
        <h1 className="page-title">About Me</h1>
        <div className="section">
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "1.05rem" }}>
            Hi, I&apos;m Abhigyan Singh — class of 2027 at Lynbrook High School and currently VP of the math club. 
            I have a deep passion for mathematics, particularly in functions, calculus, and discrete mathematics.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
            This site is where I share my mathematical explorations, research, programs, and interests.
            Scroll down to explore more sections, or use the tabs above to navigate.
          </p>
        </div>
      </div>
    </section>
  );
}
