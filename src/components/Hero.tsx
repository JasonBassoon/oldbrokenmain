export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="animated-gradient"></div>
      </div>
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Hi, I'm <span className="gradient-text">Jason</span>
          </h1>
          <h2 className="hero-subtitle-large">
            Aspiring Cybersecurity Professional
          </h2>
          <p className="hero-subtitle">
            Career-changer committed to continuous learning and building real-world security skills.
            Currently pursuing CompTIA Security+ certification while gaining hands-on experience
            through TryHackMe, CS50 Python, and AWS training.
          </p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">View Projects</a>
            <a href="#contact" className="btn btn-secondary">Get In Touch</a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">🛡️</div>
            <div className="stat-number">Security+</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">TryHackMe</div>
            <div className="stat-label">Hands-On Training</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🐍</div>
            <div className="stat-number">CS50 Python</div>
            <div className="stat-label">Programming</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">☁️</div>
            <div className="stat-number">AWS</div>
            <div className="stat-label">Cloud Skills</div>
          </div>
        </div>
      </div>
    </section>
  )
}
