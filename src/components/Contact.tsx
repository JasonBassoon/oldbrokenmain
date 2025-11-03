import { useState, FormEvent } from 'react'
import { supabase, type ContactSubmission } from '../lib/supabase'

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactSubmission>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      let ipHash = 'unknown'
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const { ip } = await ipResponse.json()
        ipHash = await hashIP(ip)
      } catch (ipError) {
        console.warn('Could not fetch IP:', ipError)
      }

      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          ...formData,
          ip_hash: ipHash
        }])

      if (error) throw error

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-notification`

      try {
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
      } catch (emailError) {
        console.warn('Email notification failed, but form was saved:', emailError)
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })

      setTimeout(() => setStatus('idle'), 5000)
    } catch (error: any) {
      console.error('Error submitting form:', error)
      setStatus('error')
      setErrorMessage(error.message || 'Failed to submit form')
    }
  }

  return (
    <section id="contact" className="section section-alt">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">
          Interested in collaborating or discussing cybersecurity opportunities?
        </p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={status === 'submitting'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={status === 'submitting'}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              disabled={status === 'submitting'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={status === 'submitting'}
            />
          </div>

          {status === 'success' && (
            <div className="alert alert-success">
              Thank you for your message! I'll get back to you soon.
            </div>
          )}

          {status === 'error' && (
            <div className="alert alert-error">
              {errorMessage || 'Something went wrong. Please try again.'}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  )
}
