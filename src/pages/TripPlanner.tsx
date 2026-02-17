import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { streamChat } from "@/lib/streaming";
import { Map, Loader2, Plane } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function TripPlanner() {
  const { t, language } = useLanguage();
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("medium");
  const [interests, setInterests] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const interestOptions = ["Beaches", "History", "Wildlife", "Food", "Culture", "Adventure", "Photography", "Relaxation"];

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [result]);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const generate = async () => {
    if (loading) return;
    setResult("");
    setLoading(true);
    let text = "";
    await streamChat({
      endpoint: "trip-planner",
      body: { days, budget, interests, language },
      onDelta: (chunk) => { text += chunk; setResult(text); },
      onDone: () => setLoading(false),
      onError: (err) => { setResult(`⚠️ ${err}`); setLoading(false); },
    });
  };

  return (
    <div className="container max-w-4xl py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-green flex items-center justify-center">
            <Map size={22} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{t("trip.title")}</h1>
            <p className="text-sm text-muted-foreground">AI-powered Sierra Leone itineraries</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          {/* Days */}
          <div>
            <label className="text-sm font-medium text-foreground">Duration (days)</label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 5, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    days === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-sm font-medium text-foreground">Budget</label>
            <div className="flex gap-2 mt-2">
              {[
                { val: "budget", label: "$ Budget" },
                { val: "medium", label: "$$ Medium" },
                { val: "luxury", label: "$$$ Luxury" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setBudget(val)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    budget === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-sm font-medium text-foreground">Interests</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {interestOptions.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    interests.includes(i)
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-gold text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plane size={18} />}
            {loading ? "Generating..." : t("btn.generate")}
          </button>
        </div>

        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-card border border-border rounded-xl p-6"
          >
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
