import { useEffect, useState } from 'react'
import { supabase, type DocumentationStep } from '../lib/supabase'

interface ProjectDocumentationProps {
  projectId: string
}

export default function ProjectDocumentation({ projectId }: ProjectDocumentationProps) {
  const [steps, setSteps] = useState<DocumentationStep[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const overviewSections = steps.filter(step => step.step_number === 0)
  const implementationSteps = steps.filter(step => step.step_number > 0)

  function formatDocumentationText() {
    let text = ''

    overviewSections.forEach(section => {
      text += `${section.title}\n\n`
      text += `${section.commands.map(cmd => `${cmd}`).join('\n')}\n\n`
      text += `Rationale:\n${section.rationale}\n\n`
      if (section.evidence_notes) {
        text += `Evidence & Verification:\n${section.evidence_notes}\n`
      }
      text += '\n---\n\n'
    })

    implementationSteps.forEach(step => {
      text += `Step ${step.step_number}: ${step.title}\n\n`
      text += `Commands:\n${step.commands.map(cmd => `- ${cmd}`).join('\n')}\n\n`
      text += `Rationale:\n${step.rationale}\n\n`
      if (step.evidence_notes) {
        text += `Evidence & Verification:\n${step.evidence_notes}\n`
      }
      text += '\n---\n\n'
    })

    return text
  }

  async function copyToClipboard() {
    const text = formatDocumentationText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
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
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="documentation-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▼' : '▶'} View Detailed Documentation ({implementationSteps.length} Steps)
        </button>

        {expanded && (
          <button
            className="btn btn-small"
            onClick={copyToClipboard}
            style={{ fontSize: '14px' }}
          >
            {copied ? '✓ Copied!' : '📋 Copy All'}
          </button>
        )}
      </div>

      {expanded && (
        <div className="documentation-steps">
          {overviewSections.map((section) => (
            <div key={section.id} className="documentation-step">
              <div className="step-header">
                <h4 className="step-title">{section.title}</h4>
              </div>

              <div className="step-commands">
                <div className="command-list">
                  {section.commands.map((cmd, idx) => (
                    <code key={idx} className="command">{cmd}</code>
                  ))}
                </div>
              </div>

              <div className="step-rationale">
                <strong>Rationale:</strong>
                <p>{section.rationale}</p>
              </div>

              {section.evidence_notes && (
                <div className="step-evidence">
                  <strong>Evidence & Verification:</strong>
                  <p>{section.evidence_notes}</p>
                </div>
              )}
            </div>
          ))}

          {implementationSteps.map((step) => (
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
