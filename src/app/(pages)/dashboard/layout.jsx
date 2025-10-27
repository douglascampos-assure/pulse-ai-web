'use client';

import { useSearchParams } from 'next/navigation';
import Sidebar from "@/src/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  const searchParams = useSearchParams();
  const showToogle = searchParams.get('dark') === 'true';
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar showThemeToggle={showToogle} />
      <main className="flex-1 p-6 overflow-y-auto bg-primary-foreground">
        {children}
      </main>
    </div>
  );
}
