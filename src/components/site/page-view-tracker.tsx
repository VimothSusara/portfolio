"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isTrackablePath } from "@/lib/analytics/constants";

function sessionKey(path: string) {
  return `pv:${path}`;
}

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !isTrackablePath(pathname)) return;
    if (lastTracked.current === pathname) return;
    if (sessionStorage.getItem(sessionKey(pathname))) return;

    lastTracked.current = pathname;

    void fetch("/api/analytics/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(sessionKey(pathname), "1");
      })
      .catch(() => {
        lastTracked.current = null;
      });
  }, [pathname]);

  return null;
}
