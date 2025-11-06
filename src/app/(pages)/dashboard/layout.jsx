import { Suspense } from "react";
import Sidebar from "@/src/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 h-full sticky top-0">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-primary-foreground p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
