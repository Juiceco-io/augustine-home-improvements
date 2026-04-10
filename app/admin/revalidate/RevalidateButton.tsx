'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'refreshing' | 'done' | 'error'

export default function RevalidateButton() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleRefresh() {
    if (status === 'refreshing') return
    setStatus('refreshing')
    try {
      const res = await fetch('/api/admin/revalidate', {
        method: 'POST',
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm leading-relaxed">
        Force-refresh all cached pages on the live site. Use this if you need ISR pages to
        reflect a content change immediately, without waiting for the cache TTL.
      </p>
      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
        <strong>Note:</strong> Publishing via the <strong>Publish All Changes</strong> button on the
        dashboard automatically refreshes the site. Use this only if you need a manual cache flush.
      </p>

      <button
        onClick={handleRefresh}
        disabled={status === 'refreshing'}
        className="flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-brick transition-colors disabled:opacity-60"
      >
        <RefreshCw size={15} className={status === 'refreshing' ? 'animate-spin' : ''} aria-hidden="true" />
        {status === 'refreshing' ? 'Refreshing…' : 'Force Refresh All Pages'}
      </button>

      {status === 'done' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
          <CheckCircle size={15} aria-hidden="true" />
          All pages refreshed successfully
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
          <AlertCircle size={15} aria-hidden="true" />
          Refresh failed — check that ISR_REVALIDATION_SECRET is configured
        </div>
      )}
    </div>
  )
}
