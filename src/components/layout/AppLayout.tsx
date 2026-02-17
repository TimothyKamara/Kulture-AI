import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  MessageSquare, Map, Brain, Compass, BookOpen, BarChart3, 
  Home, Menu, X, Globe, ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, labelKey: "nav.dashboard" },
  { path: "/chat", icon: MessageSquare, labelKey: "nav.chat" },
  { path: "/trip-planner", icon: Map, labelKey: "nav.trip" },
  { path: "/quiz", icon: Brain, labelKey: "nav.quiz" },
  { path: "/destinations", icon: Compass, labelKey: "nav.destinations" },
  { path: "/stories", icon: BookOpen, labelKey: "nav.stories" },
  { path: "/insights", icon: BarChart3, labelKey: "nav.insights" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { t, language, setLanguage, langLabels, languages } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-sidebar-foreground">KultureAI</h1>
              <p className="text-xs text-sidebar-foreground/60">Sierra Leone</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ path, icon: Icon, labelKey }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon size={18} />
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Language Selector */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors"
            >
              <Globe size={16} />
              {langLabels[language]}
              <ChevronDown size={14} className="ml-auto" />
            </button>
            {langOpen && (
              <div className="absolute bottom-full left-0 w-full mb-1 bg-sidebar border border-sidebar-border rounded-lg overflow-hidden shadow-elevated">
                {languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      l === language ? "text-sidebar-primary bg-sidebar-accent" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    }`}
                  >
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold">K</span>
            </div>
            <span className="font-display font-bold">KultureAI</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-0 z-40 bg-sidebar text-sidebar-foreground pt-14"
          >
            <nav className="p-4 space-y-1">
              {navItems.map(({ path, icon: Icon, labelKey }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    location.pathname === path
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70"
                  }`}
                >
                  <Icon size={18} />
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex gap-2 flex-wrap">
                {languages.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      l === language ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent text-sidebar-foreground/70"
                    }`}
                  >
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}
