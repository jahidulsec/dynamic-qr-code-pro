import FilterSection from "@/components/dashboard/FilterSection";
import React from "react";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { q: string; p: string };
}) {
  return <div className="container my-6 mx-auto">
    <FilterSection />
  </div>;
}
