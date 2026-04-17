import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Radial gradient glow at center */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-150 w-225 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(68,76,231,0.18)_0%,rgba(127,86,217,0.10)_40%,transparent_70%)] blur-3xl" />
      </div>
      <Header />
      <main className="relative z-10 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
