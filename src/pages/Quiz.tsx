import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchJSON } from "@/lib/streaming";
import { Brain, Loader2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function Quiz() {
  const { t, language } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    try {
      const data = await fetchJSON<{ questions: Question[] }>("quiz", { language });
      setQuestions(data.questions);
    } catch {
      // fallback
      setQuestions([
        { question: "What is the capital of Sierra Leone?", options: ["Freetown", "Monrovia", "Conakry", "Accra"], correct: 0, explanation: "Freetown, founded in 1792, is the capital and largest city of Sierra Leone." },
        { question: "Which tree symbolizes freedom in Freetown?", options: ["Baobab", "Cotton Tree", "Palm Tree", "Acacia"], correct: 1, explanation: "The Cotton Tree in central Freetown is a symbol of freedom where freed slaves prayed upon arrival." },
        { question: "What is Sierra Leone's national dish?", options: ["Jollof Rice", "Fufu", "Cassava Leaf Stew", "Egusi Soup"], correct: 2, explanation: "Cassava Leaf Stew (Plasas) is considered Sierra Leone's national dish." },
        { question: "When did Sierra Leone gain independence?", options: ["1957", "1960", "1961", "1963"], correct: 2, explanation: "Sierra Leone gained independence from Britain on April 27, 1961." },
        { question: "What is the lingua franca of Sierra Leone?", options: ["English", "Krio", "Mende", "Temne"], correct: 1, explanation: "Krio is spoken by about 97% of Sierra Leoneans as a first or second language." },
      ]);
    }
    setLoading(false);
  };

  const answer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const q = questions[current];

  return (
    <div className="container max-w-2xl py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-kulture-terracotta flex items-center justify-center">
            <Brain size={22} className="text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{t("quiz.title")}</h1>
            <p className="text-sm text-muted-foreground">How well do you know Sierra Leone?</p>
          </div>
        </div>

        {questions.length === 0 && !loading && (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="font-display text-xl font-bold mb-2">Ready to test your knowledge?</h2>
            <p className="text-sm text-muted-foreground mb-6">5 questions about Sierra Leone's culture, history, and traditions</p>
            <button
              onClick={startQuiz}
              className="px-8 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              {t("btn.start")} Quiz
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Generating quiz questions...</p>
          </div>
        )}

        {q && !finished && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground">Question {current + 1} of {questions.length}</span>
              <span className="text-xs font-medium text-primary">Score: {score}/{questions.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-6">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
            </div>

            <h2 className="font-display text-lg font-semibold mb-4">{q.question}</h2>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let style = "bg-muted text-foreground hover:bg-muted/80";
                if (selected !== null) {
                  if (i === q.correct) style = "bg-secondary text-secondary-foreground";
                  else if (i === selected) style = "bg-destructive/20 text-destructive";
                }
                return (
                  <button
                    key={i}
                    onClick={() => answer(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${style}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-current/30 flex items-center justify-center text-xs">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {selected !== null && i === q.correct && <CheckCircle size={16} className="ml-auto" />}
                    {selected !== null && i === selected && i !== q.correct && <XCircle size={16} className="ml-auto" />}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{q.explanation}</p>
                <button
                  onClick={next}
                  className="mt-3 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {current + 1 < questions.length ? "Next Question" : "See Results"}
                </button>
              </motion.div>
            )}
          </div>
        )}

        {finished && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-xl p-10 text-center">
            <div className="text-5xl mb-3">{score >= 4 ? "🏆" : score >= 2 ? "👏" : "📚"}</div>
            <h2 className="font-display text-2xl font-bold mb-1">
              {score >= 4 ? "Cultural Expert!" : score >= 2 ? "Well Done!" : "Keep Exploring!"}
            </h2>
            <p className="text-3xl font-bold text-primary my-3">{score}/{questions.length}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {score >= 4 ? "You know Sierra Leone brilliantly!" : "There's so much more to discover about Sierra Leone."}
            </p>
            <button
              onClick={startQuiz}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-gold text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <RotateCcw size={16} /> Try Again
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
