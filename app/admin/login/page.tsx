import Link from 'next/link'
import { Lock, AlertCircle } from 'lucide-react'

const errorMap: Record<string, string> = {
  missing_code: 'Sign-in did not return a valid authorization code.',
  auth_failed: 'Sign-in failed or this account is not authorized for admin access.',
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; next?: string }>
}) {
  const params = (await searchParams) || {}
  const next = params.next || '/admin/dashboard'
  const error = params.error ? errorMap[params.error] || 'Unable to sign in.' : ''

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-brand-red flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-charcoal">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Augustine Home Improvements</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5">
          <div>
            <h2 className="font-semibold text-brand-charcoal">Secure sign in</h2>
            <p className="text-sm text-gray-500 mt-2">
              Admin access uses Amazon Cognito. Only approved super-users can sign in and manage additional users.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </div>
          )}

          <Link href={`/api/admin/auth?next=${encodeURIComponent(next)}`} className="btn-primary w-full justify-center">
            Continue with secure admin login
          </Link>

          <p className="text-xs text-gray-400">
            Initial super-user access should be granted through Cognito. Additional admin users can be created after sign-in.
          </p>
        </div>
      </div>
    </div>
  )
}
