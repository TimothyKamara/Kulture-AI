import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { MessageSquare, Map, Brain, Compass, BookOpen, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const actions = [
  { path: "/chat", icon: MessageSquare, labelKey: "nav.chat", desc: "Ask about culture, history & traditions", color: "bg-gradient-gold" },
  { path: "/trip-planner", icon: Map, labelKey: "nav.trip", desc: "AI-powered multi-day itineraries", color: "bg-gradient-green" },
  { path: "/quiz", icon: Brain, labelKey: "nav.quiz", desc: "Test your Sierra Leone knowledge", color: "bg-kulture-terracotta" },
  { path: "/destinations", icon: Compass, labelKey: "nav.destinations", desc: "Explore beaches, nature & landmarks", color: "bg-kulture-ocean" },
  { path: "/stories", icon: BookOpen, labelKey: "nav.stories", desc: "Cinematic tales of Sierra Leone", color: "bg-kulture-dark" },
  { path: "/insights", icon: BarChart3, labelKey: "nav.insights", desc: "Your travel personality profile", color: "bg-secondary" },
];

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={heroBg} alt="Sierra Leone coastline" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-sm font-medium tracking-widest uppercase text-primary mb-2">🇸🇱 {t("app.tagline")}</p>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
                {t("dashboard.welcome")}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-xl">
                {t("dashboard.subtitle")}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {actions.map(({ path, icon: Icon, labelKey, desc, color }, i) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={path}
                className="group flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={22} className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
                    {t(labelKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
