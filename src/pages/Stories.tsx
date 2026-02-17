import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { streamChat } from "@/lib/streaming";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Stories() {
  const { t, language } = useLanguage();
  const [destinations, setDestinations] = useState<{ name: string }[]>([]);
  const [selected, setSelected] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("destinations").select("name").then(({ data }) => setDestinations(data || []));
  }, []);

  const generate = async () => {
    if (!selected || loading) return;
    setStory("");
    setLoading(true);
    let text = "";
    await streamChat({
      endpoint: "story",
      body: { destination: selected, language },
      onDelta: (chunk) => { text += chunk; setStory(text); },
      onDone: () => setLoading(false),
      onError: (err) => { setStory(`⚠️ ${err}`); setLoading(false); },
    });
  };

  return (
    <div className="container max-w-3xl py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-kulture-dark flex items-center justify-center">
            <BookOpen size={22} className="text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{t("nav.stories")}</h1>
            <p className="text-sm text-muted-foreground">Cinematic tales from Sierra Leone</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <label className="text-sm font-medium text-foreground">Choose a destination</label>
          <div className="flex flex-wrap gap-2 mt-3 mb-5">
            {destinations.map((d) => (
              <button
                key={d.name}
                onClick={() => setSelected(d.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selected === d.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={!selected || loading}
            className="w-full py-3 rounded-xl bg-gradient-dark text-accent-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? "Weaving story..." : "Generate Story"}
          </button>
        </div>

        {story && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-card border border-border rounded-xl p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert font-body leading-relaxed">
              <ReactMarkdown>{story}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
