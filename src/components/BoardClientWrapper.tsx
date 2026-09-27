"use client";

import dynamic from "next/dynamic";

const BoardClient = dynamic(() => import("./BoardClient"), {
  ssr: false,
  loading: () => (
    <p style={{ padding: 40, color: "var(--text-muted)" }}>Loading board…</p>
  ),
});

export default function BoardClientWrapper() {
  return <BoardClient />;
}
