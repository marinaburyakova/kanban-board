import BoardClientWrapper from "@/components/BoardClientWrapper";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <header
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Kanban Board</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Track your job applications
        </p>
      </header>

      <BoardClientWrapper />
    </main>
  );
}
