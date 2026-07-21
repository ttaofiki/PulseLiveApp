import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { supabase } from '../lib/supabase'
import type { PollType } from '../types'
import './CreatePoll.css'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

export function CreatePoll() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [question, setQuestion] = useState('')
  const [type, setType] = useState<PollType>('choice')
  const [options, setOptions] = useState(['', ''])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)))
  }

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return
    setOptions((prev) => [...prev, ''])
  }

  const removeOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!title.trim() || !question.trim()) {
      setError('Please fill in a title and a question.')
      return
    }

    if (type === 'choice' && options.some((opt) => !opt.trim())) {
      setError('Please fill in all options, or remove empty ones.')
      return
    }

    setSubmitting(true)

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({ title: title.trim(), question: question.trim(), type, status: 'draft' })
      .select()
      .single()

    if (pollError || !poll) {
      setError(pollError?.message ?? 'Something went wrong creating the poll.')
      setSubmitting(false)
      return
    }

    if (type === 'choice') {
      const { error: optionsError } = await supabase.from('options').insert(
        options.map((option_text, index) => ({
          poll_id: poll.id,
          option_text: option_text.trim(),
          display_order: index,
        })),
      )

      if (optionsError) {
        setError(optionsError.message)
        setSubmitting(false)
        return
      }
    }

    navigate(`/poll/${poll.id}`)
  }

  return (
    <div>
      <Header />
      <div className="page-shell create-shell">
        <h1 className="create-title">Create a new poll</h1>
        <form className="card create-form" onSubmit={handleSubmit}>
          <div className="create-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Team Retro Check-in"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="create-field">
            <label htmlFor="question">Question</label>
            <textarea
              id="question"
              placeholder="What do you want to ask your audience?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              maxLength={280}
            />
          </div>

          <div className="create-field">
            <label>Type</label>
            <div className="create-type-toggle">
              <button
                type="button"
                className={`create-type-option${type === 'choice' ? ' create-type-option--active' : ''}`}
                onClick={() => setType('choice')}
              >
                Multiple Choice
              </button>
              <button
                type="button"
                className={`create-type-option${type === 'qa' ? ' create-type-option--active' : ''}`}
                onClick={() => setType('qa')}
              >
                Q&A
              </button>
            </div>
          </div>

          {type === 'choice' && (
            <div className="create-field">
              <label>Options</label>
              <div className="create-options">
                {options.map((option, index) => (
                  <div className="create-option-row" key={index}>
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      maxLength={80}
                    />
                    {options.length > MIN_OPTIONS && (
                      <button
                        type="button"
                        className="create-option-remove"
                        onClick={() => removeOption(index)}
                        aria-label={`Remove option ${index + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < MAX_OPTIONS && (
                <button type="button" className="btn btn-ghost create-add-option" onClick={addOption}>
                  + Add option
                </button>
              )}
            </div>
          )}

          {error && <p className="create-error">{error}</p>}

          <button type="submit" className="btn btn-primary create-submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Poll'}
          </button>
        </form>
      </div>
    </div>
  )
}
