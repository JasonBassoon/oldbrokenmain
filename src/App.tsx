import Hero from './components/Hero'
import Projects from './components/Projects'
import Learning from './components/Learning'
import LifeExperiences from './components/LifeExperiences'
import Contact from './components/Contact'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div className="nav-brand">Portfolio</div>
          <div className="nav-links">
            <a href="#projects">Projects</a>
            <a href="#learning">Learning</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Projects />
        <Learning />
        <LifeExperiences />
        <Contact />
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Cybersecurity Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
