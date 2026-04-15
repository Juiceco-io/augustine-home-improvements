import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientOnly from "@/components/ClientOnly";
import AnalyticsProvider from "@/components/AnalyticsProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnalyticsProvider />
      <ClientOnly>
        <Navbar />
      </ClientOnly>
      <main className="flex-1">{children}</main>
      <ClientOnly>
        <Footer />
      </ClientOnly>
    </>
  );
}
