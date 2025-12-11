import { useEffect, useState } from 'react'
import { supabase, type DocumentationStep } from '../lib/supabase'

interface ProjectDocumentationProps {
  projectId: string
}

export default function ProjectDocumentation({ projectId }: ProjectDocumentationProps) {
  const [steps, setSteps] = useState<DocumentationStep[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchDocumentation()
  }, [projectId])

  async function fetchDocumentation() {
    try {
      const { data, error } = await supabase
        .from('project_documentation_steps')
        .select('*')
        .eq('project_id', projectId)
        .order('step_number', { ascending: true })

      if (error) throw error
      setSteps(data || [])
    } catch (error) {
      console.error('Error fetching documentation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="documentation-loading">Loading documentation...</div>
  }

  if (steps.length === 0) {
    return null
  }

  return (
    <div className="project-documentation">
      <button
        className="documentation-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▼' : '▶'} View Detailed Documentation ({steps.length} Steps)
      </button>

      {expanded && (
        <div className="documentation-steps">
          {steps.map((step) => (
            <div key={step.id} className="documentation-step">
              <div className="step-header">
                <span className="step-number">Step {step.step_number}</span>
                <h4 className="step-title">{step.title}</h4>
              </div>

              <div className="step-commands">
                <strong>Commands:</strong>
                <div className="command-list">
                  {step.commands.map((cmd, idx) => (
                    <code key={idx} className="command">{cmd}</code>
                  ))}
                </div>
              </div>

              <div className="step-rationale">
                <strong>Rationale:</strong>
                <p>{step.rationale}</p>
              </div>

              {step.evidence_notes && (
                <div className="step-evidence">
                  <strong>Evidence & Verification:</strong>
                  <p>{step.evidence_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
