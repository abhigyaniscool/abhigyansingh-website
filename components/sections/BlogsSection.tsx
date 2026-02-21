export default function BlogsSection() {
  return (
    <section id="blogs" className="page-section">
      <div className="container">
        <h1 className="page-title">Blogs</h1>
        <div className="section">
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "1.05rem" }}>
            Mathematical proofs, problem-solving techniques, and computational insights.
            Tutorials and notes on mathematical concepts.
          </p>
          <div className="card">
            <h3>Blog Posts</h3>
            <p>Mathematical blog posts and tutorials will appear here.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
