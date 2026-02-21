export default function InterestsSection() {
  return (
    <section id="interests" className="page-section">
      <div className="container">
        <h1 className="page-title">Interests</h1>
        <div className="section">
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "1.05rem" }}>
            I am deeply interested in mathematical research and its applications in AI systems. 
            Exploring how mathematical foundations power machine learning algorithms, neural networks, 
            and computational intelligence fascinates me.
          </p>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "1.05rem" }}>
            My interests span across linear algebra, optimization theory, probability and statistics, 
            and how these mathematical concepts are applied to build intelligent systems that can 
            learn, reason, and make decisions.
          </p>
          <div className="card">
            <h3>Mathematical Research & AI</h3>
            <p>
              I explore the intersection of pure mathematics and artificial intelligence, 
              focusing on how mathematical research drives innovation in AI systems and 
              how AI challenges inspire new mathematical questions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
