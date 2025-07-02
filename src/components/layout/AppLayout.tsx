import { Outlet } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <TopHeader />
      <main className="flex-1 px-8 py-6 bg-gradient-to-br from-background via-background to-muted/20">
        <Outlet />
      </main>
    </div>
  );
}
