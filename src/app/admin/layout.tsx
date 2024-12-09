import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { getUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen relative">
      <Header user={user} />
      <main className="container my-6 mx-auto">{children}</main>
      <Footer />
    </div>
  );
}
