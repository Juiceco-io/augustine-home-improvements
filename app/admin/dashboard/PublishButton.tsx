'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

export default function PublishButton({ hasPending }: { hasPending: boolean }) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'publishing' | 'done' | 'error'>('idle')

  async function handlePublish() {
    if (status === 'publishing') return
    setStatus('publishing')
    try {
      const res = await fetch('/api/admin/publish', { method: 'POST' })
      if (res.ok) {
        setStatus('done')
        router.refresh()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handlePublish}
        disabled={status === 'publishing'}
        className="flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-brick transition-colors disabled:opacity-60"
      >
        <Upload size={15} aria-hidden="true" />
        {status === 'publishing' ? 'Publishing…' : 'Publish All Changes'}
      </button>

      {hasPending && status === 'idle' && (
        <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full">
          Unpublished changes
        </span>
      )}

      {status === 'done' && (
        <span className="flex items-center gap-1.5 text-green-700 text-sm font-medium">
          <CheckCircle size={15} aria-hidden="true" />
          Published successfully
        </span>
      )}
      {status === 'error' && (
        <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
          <AlertCircle size={15} aria-hidden="true" />
          Publish failed — please try again
        </span>
      )}
    </div>
  )
}
