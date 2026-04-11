# Archived: Vite Admin Frontend

This directory contains the original Vite/React SPA implementation of the Augustine CMS admin.

It has been superseded by the Next.js implementation at `app/admin/` in the monorepo root.

**Do not use this for development.** It is kept for reference only and can be deleted in a future cleanup PR.

## What moved where

| Old (Vite) | New (Next.js) |
|---|---|
| `src/lib/types.ts` | `app/admin/lib/types.ts` |
| `src/lib/auth.ts` | `app/admin/lib/auth.ts` |
| `src/lib/api.ts` | `app/admin/lib/api.ts` |
| `src/components/*.tsx` | `app/admin/components/*.tsx` |
| `src/pages/LoginPage.tsx` | `app/admin/components/LoginPage.tsx` |
| `src/pages/CMSDashboard.tsx` | `app/admin/components/CMSDashboard.tsx` |
| `src/App.tsx` | `app/admin/components/AdminApp.tsx` |

## Environment variable changes

| Old (Vite) | New (Next.js) |
|---|---|
| `VITE_COGNITO_USER_POOL_ID` | `NEXT_PUBLIC_COGNITO_USER_POOL_ID` |
| `VITE_COGNITO_CLIENT_ID` | `NEXT_PUBLIC_COGNITO_CLIENT_ID` |
| `VITE_API_URL` | `NEXT_PUBLIC_CMS_API_URL` |
