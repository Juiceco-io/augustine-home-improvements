'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Upload } from 'lucide-react'

export default function PreviewBannerClient({
  currentPath,
}: {
  currentPath: string
}) {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  async function handlePublish() {
    if (publishing) return
    setPublishing(true)
    try {
      const res = await fetch('/api/admin/publish', { method: 'POST' })
      if (res.ok) {
        setPublished(true)
        router.refresh()
      }
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-charcoal text-white border-t-2 border-brand-red shadow-2xl">
      <div className="container-xl py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye size={16} className="text-brand-brick flex-shrink-0" aria-hidden="true" />
          <span>
            <span className="text-brand-brick font-bold">Draft Preview</span>
            {' '}— you are viewing unpublished changes
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/preview/disable?redirect=${encodeURIComponent(currentPath)}`}
            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <EyeOff size={14} aria-hidden="true" />
            Exit Preview
          </a>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 text-sm bg-brand-red hover:bg-brand-brick text-white px-4 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-60"
          >
            <Upload size={14} aria-hidden="true" />
            {publishing ? 'Publishing…' : published ? 'Published!' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
