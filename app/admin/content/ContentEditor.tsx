'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import type { SiteContent, ServicePageSlug } from '@/types/content'
import { SERVICE_PAGE_SLUGS, SERVICE_PAGE_LABELS } from '@/types/content'

type Status = 'idle' | 'saving' | 'saved' | 'error'

export default function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const [pages, setPages] = useState(initialContent.servicePages)
  const [activeTab, setActiveTab] = useState<ServicePageSlug>('deck-installation')
  const [status, setStatus] = useState<Status>('idle')

  const page = pages[activeTab]

  function setPageField<K extends keyof typeof page>(key: K, value: (typeof page)[K]) {
    setPages((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], [key]: value } }))
    setStatus('idle')
  }

  function addIncludedItem() {
    setPageField('included', [...page.included, ''])
  }

  function updateIncludedItem(index: number, value: string) {
    const next = [...page.included]
    next[index] = value
    setPageField('included', next)
  }

  function removeIncludedItem(index: number) {
    setPageField(
      'included',
      page.included.filter((_, i) => i !== index)
    )
  }

  async function handleSave() {
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicePages: pages }),
      })
      setStatus(res.ok ? 'saved' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview link */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Changes are saved as a draft. Use{' '}
          <strong>Preview Site</strong> to see them live before publishing.
        </p>
        <a
          href={`/api/preview/enable?redirect=/${activeTab}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-brand-red hover:underline font-semibold"
        >
          <ExternalLink size={14} aria-hidden="true" />
          Preview this page
        </a>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {SERVICE_PAGE_SLUGS.map((slug) => (
          <button
            key={slug}
            onClick={() => setActiveTab(slug)}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
              activeTab === slug
                ? 'bg-brand-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {SERVICE_PAGE_LABELS[slug]}
          </button>
        ))}
      </div>

      {/* Page fields */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            Page Title
          </label>
          <input
            type="text"
            value={page.title}
            onChange={(e) => setPageField('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            Hero Subtitle
          </label>
          <textarea
            rows={3}
            value={page.subtitle}
            onChange={(e) => setPageField('subtitle', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            Badge <span className="font-normal text-gray-400">(optional, e.g. &quot;TrexPro Certified&quot;)</span>
          </label>
          <input
            type="text"
            value={page.badge ?? ''}
            onChange={(e) => setPageField('badge', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-brand-charcoal">
              &quot;What&apos;s Included&quot; Items
            </label>
            <button
              type="button"
              onClick={addIncludedItem}
              className="flex items-center gap-1 text-xs text-brand-red hover:underline font-semibold"
            >
              <Plus size={13} aria-hidden="true" />
              Add Item
            </button>
          </div>
          <div className="space-y-2">
            {page.included.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateIncludedItem(idx, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30"
                />
                <button
                  type="button"
                  onClick={() => removeIncludedItem(idx)}
                  aria-label="Remove item"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">
            Review Quote <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={page.reviewQuote?.text ?? ''}
            onChange={(e) =>
              setPageField('reviewQuote', {
                text: e.target.value,
                name: page.reviewQuote?.name ?? '',
              })
            }
            placeholder="Leave blank to hide the quote block"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 resize-y"
          />
          <input
            type="text"
            value={page.reviewQuote?.name ?? ''}
            onChange={(e) =>
              setPageField('reviewQuote', {
                text: page.reviewQuote?.text ?? '',
                name: e.target.value,
              })
            }
            placeholder="Reviewer name (e.g. Jeff Van de M.)"
            className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          />
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-brick transition-colors disabled:opacity-60"
        >
          <Save size={15} aria-hidden="true" />
          {status === 'saving' ? 'Saving…' : 'Save Draft'}
        </button>
        {status === 'saved' && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={15} aria-hidden="true" />
            Draft saved
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
            <AlertCircle size={15} aria-hidden="true" />
            Save failed — please try again
          </span>
        )}
      </div>
    </div>
  )
}
