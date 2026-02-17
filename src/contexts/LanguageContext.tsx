import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "kri" | "fr" | "es" | "zh";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  "app.title": { en: "KultureAI", kri: "KultureAI", fr: "KultureAI", es: "KultureAI", zh: "KultureAI" },
  "app.tagline": { en: "Your AI Cultural Ambassador for Sierra Leone", kri: "Yu AI Kɔlchɔ Ambassadɔ fɔ Salone", fr: "Votre ambassadeur culturel IA pour la Sierra Leone", es: "Tu embajador cultural de IA para Sierra Leona", zh: "您的塞拉利昂AI文化大使" },
  "nav.dashboard": { en: "Dashboard", kri: "Dashbɔd", fr: "Tableau de bord", es: "Panel", zh: "仪表板" },
  "nav.chat": { en: "Cultural Chat", kri: "Kɔlchɔ Chat", fr: "Chat Culturel", es: "Chat Cultural", zh: "文化聊天" },
  "nav.trip": { en: "Trip Planner", kri: "Trip Plana", fr: "Planificateur", es: "Planificador", zh: "行程规划" },
  "nav.quiz": { en: "Cultural Quiz", kri: "Kɔlchɔ Quiz", fr: "Quiz Culturel", es: "Quiz Cultural", zh: "文化测验" },
  "nav.destinations": { en: "Destinations", kri: "Dɛstineshɔn dɛn", fr: "Destinations", es: "Destinos", zh: "目的地" },
  "nav.stories": { en: "Stories", kri: "Stori dɛn", fr: "Histoires", es: "Historias", zh: "故事" },
  "nav.insights": { en: "Insights", kri: "Insait dɛn", fr: "Perspectives", es: "Perspectivas", zh: "洞察" },
  "dashboard.welcome": { en: "Welcome to KultureAI", kri: "Wɛlkɔm to KultureAI", fr: "Bienvenue sur KultureAI", es: "Bienvenido a KultureAI", zh: "欢迎来到KultureAI" },
  "dashboard.subtitle": { en: "Discover the beauty, culture, and spirit of Sierra Leone", kri: "Diskɔva di byuti, kɔlchɔ, ɛn spirit ɔf Salone", fr: "Découvrez la beauté, la culture et l'esprit de la Sierra Leone", es: "Descubre la belleza, cultura y espíritu de Sierra Leona", zh: "探索塞拉利昂的美丽、文化和精神" },
  "chat.placeholder": { en: "Ask me about Sierra Leone's culture, history, food, or travel...", kri: "Aks mi bɔt Salone kɔlchɔ, istri, it, ɔ travɛl...", fr: "Demandez-moi sur la culture, l'histoire, la cuisine ou les voyages en Sierra Leone...", es: "Pregúntame sobre la cultura, historia, comida o viajes de Sierra Leona...", zh: "向我询问塞拉利昂的文化、历史、美食或旅行..." },
  "chat.storyMode": { en: "Story Mode", kri: "Stori Mod", fr: "Mode Histoire", es: "Modo Historia", zh: "故事模式" },
  "trip.title": { en: "Plan Your Sierra Leone Adventure", kri: "Plan Yu Salone Advɛnchɔ", fr: "Planifiez votre aventure en Sierra Leone", es: "Planifica tu aventura en Sierra Leona", zh: "规划您的塞拉利昂冒险" },
  "quiz.title": { en: "Test Your Knowledge", kri: "Tɛst Yu Nɔlɛj", fr: "Testez vos connaissances", es: "Pon a prueba tu conocimiento", zh: "测试你的知识" },
  "btn.explore": { en: "Explore", kri: "Eksplɔ", fr: "Explorer", es: "Explorar", zh: "探索" },
  "btn.start": { en: "Start", kri: "Stat", fr: "Commencer", es: "Comenzar", zh: "开始" },
  "btn.send": { en: "Send", kri: "Sɛn", fr: "Envoyer", es: "Enviar", zh: "发送" },
  "btn.generate": { en: "Generate", kri: "Jɛnɛret", fr: "Générer", es: "Generar", zh: "生成" },
};

const langLabels: Record<Language, string> = {
  en: "English",
  kri: "Krio",
  fr: "Français",
  es: "Español",
  zh: "中文",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  langLabels: Record<Language, string>;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, langLabels, languages: ["en", "kri", "fr", "es", "zh"] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
