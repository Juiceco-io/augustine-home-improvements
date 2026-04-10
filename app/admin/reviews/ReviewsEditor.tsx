'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Save, X, CheckCircle, AlertCircle, Star } from 'lucide-react'
import type { Review } from '@/types/content'

type Status = 'idle' | 'saving' | 'saved' | 'error'

function generateId() {
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const EMPTY_REVIEW: Omit<Review, 'id'> = {
  name: '',
  project: '',
  location: 'Chester County, PA',
  rating: 5,
  text: '',
  source: 'Facebook',
}

export default function ReviewsEditor({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Omit<Review, 'id'>>(EMPTY_REVIEW)
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState<Omit<Review, 'id'>>(EMPTY_REVIEW)
  const [status, setStatus] = useState<Status>('idle')

  async function persist(updated: Review[]) {
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        setReviews(updated)
        setStatus('saved')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  function startEdit(review: Review) {
    setEditingId(review.id)
    setEditForm({ name: review.name, project: review.project, location: review.location, rating: review.rating, text: review.text, source: review.source })
    setStatus('idle')
  }

  async function saveEdit(id: string) {
    const updated = reviews.map((r) => (r.id === id ? { id, ...editForm } : r))
    await persist(updated)
    setEditingId(null)
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return
    await persist(reviews.filter((r) => r.id !== id))
  }

  async function addReview() {
    if (!addForm.name || !addForm.text) return
    const newReview: Review = { id: generateId(), ...addForm }
    await persist([...reviews, newReview])
    setIsAdding(false)
    setAddForm(EMPTY_REVIEW)
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      {status === 'saved' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
          <CheckCircle size={15} aria-hidden="true" />
          Draft saved — publish when ready
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
          <AlertCircle size={15} aria-hidden="true" />
          Save failed — please try again
        </div>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No reviews yet. Add one below.</p>
        )}
        {reviews.map((review) =>
          editingId === review.id ? (
            <ReviewForm
              key={review.id}
              form={editForm}
              onChange={setEditForm}
              onSave={() => saveEdit(review.id)}
              onCancel={() => setEditingId(null)}
              saving={status === 'saving'}
              label="Save Changes"
            />
          ) : (
            <div
              key={review.id}
              className="bg-brand-cream rounded-xl p-5 border border-brand-brick/15"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
                      ))}
                    </div>
                    {review.source && (
                      <span className="text-xs text-gray-400">{review.source}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 italic leading-relaxed line-clamp-3">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="mt-2 text-sm font-bold text-brand-charcoal">{review.name}</div>
                  <div className="text-xs text-gray-500">
                    {review.project} · {review.location}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(review)}
                    aria-label="Edit"
                    className="text-gray-400 hover:text-brand-red transition-colors"
                  >
                    <Edit2 size={16} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    aria-label="Delete"
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add review */}
      {isAdding ? (
        <ReviewForm
          form={addForm}
          onChange={setAddForm}
          onSave={addReview}
          onCancel={() => { setIsAdding(false); setAddForm(EMPTY_REVIEW) }}
          saving={status === 'saving'}
          label="Add Review"
        />
      ) : (
        <button
          onClick={() => { setIsAdding(true); setStatus('idle') }}
          className="flex items-center gap-2 text-sm font-semibold text-brand-red hover:underline"
        >
          <Plus size={15} aria-hidden="true" />
          Add New Review
        </button>
      )}
    </div>
  )
}

function ReviewForm({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  label,
}: {
  form: Omit<Review, 'id'>
  onChange: (f: Omit<Review, 'id'>) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  label: string
}) {
  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30'

  const field = (key: keyof typeof form) => ({
    value: (form[key] ?? '') as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [key]: key === 'rating' ? Number(e.target.value) : e.target.value }),
  })

  return (
    <div className="bg-white rounded-xl p-5 border-2 border-brand-red/40 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
          <input type="text" {...field('name')} className={inputCls} placeholder="Matthew G." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Project</label>
          <input type="text" {...field('project')} className={inputCls} placeholder="Kitchen Remodel" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
          <input type="text" {...field('location')} className={inputCls} placeholder="Chester County, PA" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Source</label>
          <input type="text" {...field('source')} className={inputCls} placeholder="Facebook" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Rating</label>
          <select
            value={form.rating}
            onChange={(e) => onChange({ ...form, rating: Number(e.target.value) })}
            className={inputCls}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Review Text *</label>
        <textarea
          {...field('text')}
          rows={4}
          className={`${inputCls} resize-y`}
          placeholder="Share the customer's experience…"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving || !form.name || !form.text}
          className="flex items-center gap-1.5 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-brick transition-colors disabled:opacity-60"
        >
          <Save size={13} aria-hidden="true" />
          {saving ? 'Saving…' : label}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={13} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </div>
  )
}
