import { useEffect, useState } from 'react'
import { supabase, type LifeExperience } from '../lib/supabase'

export default function LifeExperiences() {
  const [experiences, setExperiences] = useState<LifeExperience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExperiences()
  }, [])

  async function fetchExperiences() {
    try {
      const { data, error } = await supabase
        .from('life_experiences')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setExperiences(data || [])
    } catch (error) {
      console.error('Error fetching life experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="experience" className="section">
        <div className="container">
          <h2 className="section-title">Life Experience</h2>
          <div className="loading">Loading experiences...</div>
        </div>
      </section>
    )
  }

  return (
    <section id="experience" className="section">
      <div className="container">
        <h2 className="section-title">Life Experience</h2>
        <p className="section-subtitle">
          Diverse background bringing unique perspectives and transferable skills to cybersecurity
        </p>

        <div className="timeline">
          {experiences.map((exp) => (
            <article key={exp.id} className="timeline-item">
              <div className="timeline-marker" />
              <div className="timeline-content">
                <div className="timeline-header">
                  <h3 className="timeline-title">{exp.title}</h3>
                  <span className="timeline-period">{exp.time_period}</span>
                </div>
                <span className="timeline-category">{exp.category}</span>
                <p className="timeline-description">{exp.content}</p>

                {exp.transferable_skills.length > 0 && (
                  <div className="skills-tags">
                    <strong>Transferable Skills:</strong>
                    <div className="tags">
                      {exp.transferable_skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
