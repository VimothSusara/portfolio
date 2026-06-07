"use client";

import { useEffect } from "react";

type ProjectViewTrackerProps = {
  projectId: string;
};

export function ProjectViewTracker({ projectId }: ProjectViewTrackerProps) {
  useEffect(() => {
    const key = `project-view:${projectId}`;
    if (sessionStorage.getItem(key)) return;

    void fetch("/api/analytics/project-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
      keepalive: true,
    })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(key, "1");
      })
      .catch(() => {});
  }, [projectId]);

  return null;
}