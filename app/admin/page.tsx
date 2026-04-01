"use client";

import dynamic from "next/dynamic";

// The admin is entirely client-side (Cognito + API Gateway).
// Skip SSR to avoid prerender errors when env vars are absent at build time.
const AdminApp = dynamic(() => import("./components/AdminApp"), { ssr: false });

export default function AdminPage() {
  return <AdminApp />;
}
