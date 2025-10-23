"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, BarChart3, Calendar, MessageCircle } from "lucide-react";
import { SiSlack, SiJira } from "react-icons/si";
import { useAuth } from "@/src/context/AuthContext";

const links = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/slack", label: "Slack Analytics", icon: SiSlack },
  { href: "/dashboard/meetings", label: "Meetings", icon: BarChart3 },
  { href: "/dashboard/jira", label: "Jira Tracking", icon: SiJira },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/feedbacks", label: "Feedbacks", icon: MessageCircle },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-primary text-gray-200 flex flex-col border-r border-gray-800">
      {/* Logo - Logo Assuresoft?*/}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <span className="text-lg font-bold tracking-wide text-white">
          Pulse<span className="text-blue-400">AI</span>
        </span>
      </div>

      {user && (
        <div className="flex flex-col items-center py-4 border-b border-gray-800 text-center space-y-4">
          <div className="flex-none w-16 h-16 rounded-full bg-blue-500 overflow-hidden border border-gray-500 mb-3">
            <img
              src={user?.image || "/images/test-avatar.jpg"}
              alt={user?.email || "User avatar"}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-gray-400">
            {user.email || "user@email.com"}
          </p>
        </div>
      )}

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition
                ${
                  active
                    ? "bg-primary-foreground text-black"
                    : "hover:bg-gray-800"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / logout */}
      <div className="border-t border-gray-800 p-4 text-sm">
        <button
          onClick={logout}
          className="w-full text-center text-gray-400 hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
