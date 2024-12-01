"use client";

import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Nav, NavLink } from "../navbar/nav-bar";

function Header() {
  const router = useRouter();

  return (
    <header>
      <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink
          href=""
          onClick={async () => {
            await logout();
            toast.success("You are logged out");
            router.replace("/login");
          }}
        >
          Logout
        </NavLink>
      </Nav>
    </header>
  );
}

export default Header;