import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Library,
  PlusCircle,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/UserMenu";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/library", label: "Library", icon: Library },
    { path: "/add-paper", label: "Add Paper", icon: PlusCircle },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans">
      {/* Minimal Top Header */}
      <header className="sticky top-0 left-0 right-0 h-16 border-b border-zinc-800/50 bg-[#0a0a0b]/80 backdrop-blur-md z-40">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/library" className="flex items-center gap-2 group">
            <BookOpen className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-white">
              Paper<span className="text-primary">Trail</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 mr-4 md:mr-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all text-sm font-medium",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}>
                    <Icon className="h-5 w-5 md:h-4 md:w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
             <UserMenu onLogout={handleLogout} />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-zinc-900 flex justify-center">
        <p className="text-xs text-zinc-500">
          © {new Date().getFullYear()} PaperTrail
        </p>
      </footer>
    </div>
  );
};

export default Layout;
