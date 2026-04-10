import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientOnly from "@/components/ClientOnly";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
