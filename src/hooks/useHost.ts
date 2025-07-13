"use client";

import { useEffect, useState } from "react";

export default function useHost() {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.origin);
  }, []);

  return { hostname };
}
