import React from 'react';
import type { ViewName } from '../../types';
import { useGamification } from '../../hooks/useGamification';
import { XPBar, LevelBadge } from '../../components/gamification';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BarChart2,
  Timer,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps): React.ReactElement {
  const { xp, level, progress } = useGamification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
  ] as const;

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4 gap-6">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
          ST
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">StudyTracker</h1>
          <p className="text-xs text-muted-foreground">Level Up Your Learning</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id as ViewName);
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              currentView === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors",
              currentView === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <LevelBadge level={level} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Scholar</p>
            <p className="text-xs text-muted-foreground truncate">Level {level}</p>
          </div>
        </div>
        <XPBar xp={xp} level={level} progress={progress} />
      </div>
    </div>
  );

  return (
    <div className="block lg:flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden p-4 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <span className="font-bold">StudyTracker</span>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="text-muted-foreground" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border z-50 lg:hidden"
            >
              <div className="absolute right-2 top-2">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-white/10 h-screen sticky top-0 glass-card shine">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-64px)] lg:h-screen overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default Layout;
