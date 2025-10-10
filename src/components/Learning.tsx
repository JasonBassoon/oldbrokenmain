import { useEffect, useState } from 'react'
import { supabase, type LearningMilestone } from '../lib/supabase'

const categoryLabels: Record<string, string> = {
  security_plus: 'CompTIA Security+',
  tryhackme: 'TryHackMe',
  python: 'Python Programming',
  aws: 'AWS Cloud'
}

export default function Learning() {
  const [milestones, setMilestones] = useState<LearningMilestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMilestones()
  }, [])

  async function fetchMilestones() {
    try {
      const { data, error } = await supabase
        .from('learning_milestones')
        .select('*')
        .order('last_updated', { ascending: false })

      if (error) throw error
      setMilestones(data || [])
    } catch (error) {
      console.error('Error fetching learning milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="learning" className="section section-alt">
        <div className="container">
          <h2 className="section-title">Learning Journey</h2>
          <div className="loading">Loading progress...</div>
        </div>
      </section>
    )
  }

  return (
    <section id="learning" className="section section-alt">
      <div className="container">
        <h2 className="section-title">Continuous Learning</h2>
        <p className="section-subtitle">
          Actively building cybersecurity expertise through certifications and hands-on practice
        </p>

        <div className="learning-grid">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="milestone-card">
              <div className="milestone-header">
                <span className="milestone-category">
                  {categoryLabels[milestone.category] || milestone.category}
                </span>
                <span className={`milestone-status status-${milestone.status}`}>
                  {milestone.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <h3 className="milestone-title">{milestone.title}</h3>
              <p className="milestone-description">{milestone.description}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${milestone.progress_percentage}%` }}
                />
              </div>
              <div className="progress-label">{milestone.progress_percentage}% Complete</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
