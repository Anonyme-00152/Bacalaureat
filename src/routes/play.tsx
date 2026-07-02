import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/play")({
  component: PlayLayout,
});

function PlayLayout() {
  return (
    <main className="min-h-screen bg-background text-foreground" style={{ backgroundImage: "var(--gradient-radial)" }}>
      <Outlet />
    </main>
  );
}
