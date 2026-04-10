'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Save, CheckCircle, AlertCircle, ImageIcon } from 'lucide-react'
import type { GalleryItem } from '@/types/content'

const CATEGORIES = ['Decks', 'Kitchens', 'Bathrooms', 'Basements', 'Home Additions', 'Renovations']
const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30'

function generateId() {
  return `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

type Status = 'idle' | 'uploading' | 'saving' | 'saved' | 'error'

export default function GalleryEditor({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Pick<GalleryItem, 'alt' | 'caption' | 'category'>>({
    alt: '',
    caption: '',
    category: 'Renovations',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setStatus('uploading')

    try {
      // 1. Get presigned URL from server
      const urlRes = await fetch('/api/admin/gallery/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!urlRes.ok) {
        const { error } = await urlRes.json()
        throw new Error(error || 'Failed to get upload URL')
      }
      const { uploadUrl, objectUrl } = await urlRes.json()

      // 2. Upload directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!uploadRes.ok) throw new Error('Upload to S3 failed')

      // 3. Add placeholder item so admin can fill in metadata
      const newItem: GalleryItem = {
        id: generateId(),
        src: objectUrl,
        alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        caption: '',
        category: 'Renovations',
      }

      const next = [...items, newItem]
      setStatus('saving')
      const saveRes = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      if (!saveRes.ok) throw new Error('Failed to save gallery')
      setItems(next)
      setStatus('saved')
      // Auto-open edit for the new item
      setEditingId(newItem.id)
      setEditForm({ alt: newItem.alt, caption: '', category: 'Renovations' })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      setStatus('error')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function saveEdits(id: string) {
    setStatus('saving')
    const next = items.map((i) => (i.id === id ? { ...i, ...editForm } : i))
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      if (res.ok) {
        setItems(next)
        setStatus('saved')
        setEditingId(null)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Remove this photo from the gallery?')) return
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        setStatus('saved')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      {status === 'uploading' && (
        <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          Uploading photo…
        </div>
      )}
      {status === 'saved' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
          <CheckCircle size={15} aria-hidden="true" />
          Saved to draft
        </div>
      )}
      {(status === 'error' || uploadError) && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
          <AlertCircle size={15} aria-hidden="true" />
          {uploadError ?? 'An error occurred — please try again'}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="sr-only"
          id="gallery-upload"
        />
        <label
          htmlFor="gallery-upload"
          className="inline-flex items-center gap-2 cursor-pointer bg-brand-red text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-brick transition-colors"
        >
          <Upload size={15} aria-hidden="true" />
          Upload Photo
        </label>
        <p className="mt-1.5 text-xs text-gray-500">JPEG, PNG or WebP · max 10 MB recommended</p>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-gray-400">
          <ImageIcon size={40} className="mb-3" aria-hidden="true" />
          <p className="text-sm">No photos yet. Upload your first project photo above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              <div className="relative aspect-[4/3] bg-gray-200">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {editingId === item.id ? (
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    value={editForm.caption}
                    onChange={(e) => setEditForm((f) => ({ ...f, caption: e.target.value }))}
                    placeholder="Caption (e.g. Trex Deck in Phoenixville)"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={editForm.alt}
                    onChange={(e) => setEditForm((f) => ({ ...f, alt: e.target.value }))}
                    placeholder="Alt text (for accessibility)"
                    className={inputCls}
                  />
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdits(item.id)}
                      disabled={status === 'saving'}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-red text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-brick disabled:opacity-60"
                    >
                      <Save size={12} aria-hidden="true" />
                      {status === 'saving' ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <p className="text-sm font-medium text-brand-charcoal truncate">
                    {item.caption || <span className="text-gray-400 italic">No caption</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id)
                        setEditForm({ alt: item.alt, caption: item.caption, category: item.category })
                        setStatus('idle')
                      }}
                      className="flex-1 text-xs text-brand-red hover:underline font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      aria-label="Delete photo"
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
