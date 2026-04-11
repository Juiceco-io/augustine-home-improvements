import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Augustine CMS",
  description: "Site management for Augustine Home Improvements",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
