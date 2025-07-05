// src/components/ProtectedLayout.tsx
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/sonner";

export default function ProtectedLayout() {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />

        <main className="flex-1 h-full overflow-y-auto">
          <Toaster />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
