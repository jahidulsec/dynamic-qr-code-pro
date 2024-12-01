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
      <main className="container my-6 mx-auto">{children}</main>
      <Footer />
    </div>
  );
}
