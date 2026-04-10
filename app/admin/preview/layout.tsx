"use client";

import dynamic from "next/dynamic";

// Skip SSR — the preview shell uses Cognito auth (amazon-cognito-identity-js)
// which is browser-only, matching how app/admin/page.tsx handles the same constraint.
const PreviewShell = dynamic(() => import("./PreviewShell"), { ssr: false });

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PreviewShell>{children}</PreviewShell>;
}

