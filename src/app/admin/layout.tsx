import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-8">{children}</main>
      <Footer />
    </div>
  );
}
