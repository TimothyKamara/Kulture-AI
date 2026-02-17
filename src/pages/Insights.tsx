import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchJSON } from "@/lib/streaming";
import { BarChart3, Loader2, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface InsightData {
  personality: string;
  affinity: string;
  description: string;
  suggestedDestinations: string[];
}

export default function Insights() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetchJSON<InsightData>("insights", { language });
      setData(res);
    } catch {
      setData({
        personality: "The Curious Explorer",
        affinity: "Cultural Heritage",
        description: "You're drawn to the stories behind the places. History, traditions, and the human experience fuel your wanderlust. Sierra Leone's rich tapestry of cultures, from Krio heritage to Mende traditions, would captivate your soul.",
        suggestedDestinations: ["Bunce Island", "Cotton Tree", "Freetown Peninsula"],
      });
    }
    setLoading(false);
  };

  return (
    <div className="container max-w-2xl py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
            <BarChart3 size={22} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{t("nav.insights")}</h1>
            <p className="text-sm text-muted-foreground">Discover your travel personality</p>
          </div>
        </div>

        {!data && !loading && (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <div className="text-5xl mb-4">🔮</div>
            <h2 className="font-display text-xl font-bold mb-2">What kind of traveler are you?</h2>
            <p className="text-sm text-muted-foreground mb-6">Let AI analyze your preferences and reveal your Sierra Leone travel personality</p>
            <button
              onClick={generate}
              className="px-8 py-3 rounded-xl bg-gradient-green text-secondary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Reveal My Profile
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing your travel spirit...</p>
          </div>
        )}

        {data && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="bg-gradient-gold rounded-xl p-8 text-center text-primary-foreground">
              <p className="text-sm uppercase tracking-widest opacity-80 mb-1">Your Travel Personality</p>
              <h2 className="font-display text-3xl font-bold">{data.personality}</h2>
              <p className="text-sm opacity-80 mt-1">Cultural Affinity: {data.affinity}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{data.description}</ReactMarkdown>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-display font-semibold mb-3">Recommended Destinations</h3>
              <div className="flex flex-wrap gap-2">
                {data.suggestedDestinations.map((d) => (
                  <span key={d} className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-foreground">{d}</span>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCcw size={14} /> Regenerate
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
