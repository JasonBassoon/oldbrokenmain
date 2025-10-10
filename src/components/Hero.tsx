export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Cybersecurity Professional
            <span className="gradient-text"> & Developer</span>
          </h1>
          <p className="hero-subtitle">
            Career-changer transitioning from diverse professional backgrounds into cybersecurity.
            Building secure applications while pursuing Security+ certification and hands-on security training.
          </p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">View Projects</a>
            <a href="#contact" className="btn btn-secondary">Get In Touch</a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-number">Security+</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">Python</div>
            <div className="stat-label">Scripting</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">AWS</div>
            <div className="stat-label">Cloud Skills</div>
          </div>
        </div>
      </div>
    </section>
  )
}
