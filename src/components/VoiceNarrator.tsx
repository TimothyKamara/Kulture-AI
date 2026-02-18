import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Square, Mic } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const VOICE_LANGUAGES = [
  { label: "English", code: "en-US" },
  { label: "Français", code: "fr-FR" },
  { label: "Español", code: "es-ES" },
  { label: "中文", code: "zh-CN" },
  { label: "العربية", code: "ar-SA" },
  { label: "Krio", code: "en-GB" }, // Krio uses English voice as closest match
];

const APP_LANG_TO_VOICE: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  zh: "zh-CN",
  kri: "en-GB",
};

interface VoiceNarratorProps {
  text: string;
  defaultLanguage?: string;
  className?: string;
}

export default function VoiceNarrator({ text, defaultLanguage, className = "" }: VoiceNarratorProps) {
  const { language } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(
    defaultLanguage || APP_LANG_TO_VOICE[language] || "en-US"
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync with global language changes
  useEffect(() => {
    if (!defaultLanguage) {
      setSelectedLang(APP_LANG_TO_VOICE[language] || "en-US");
    }
  }, [language, defaultLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (!text.trim() || !isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Strip markdown symbols for cleaner narration
    const cleanText = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, selectedLang, isSupported]);

  const handleLangChange = (newLang: string) => {
    setSelectedLang(newLang);
    if (isSpeaking) {
      // Restart in new language
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      // Small delay to let cancel complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(
          text.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "").replace(/\*/g, "").trim()
        );
        utterance.lang = newLang;
        utterance.rate = 0.95;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 150);
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-xs text-muted-foreground italic ${className}`}>
        <VolumeX size={14} />
        <span>Voice narration not supported in this browser.</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`} role="region" aria-label="Voice narration controls">
      {/* Language selector */}
      <select
        value={selectedLang}
        onChange={(e) => handleLangChange(e.target.value)}
        aria-label="Select narration language"
        className="text-xs px-2 py-1.5 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-colors hover:bg-muted/80"
      >
        {VOICE_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>

      {/* Listen button */}
      {!isSpeaking ? (
        <button
          onClick={speak}
          disabled={!text.trim()}
          aria-label="Listen to narration"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <Volume2 size={14} aria-hidden="true" />
          <span>Listen</span>
        </button>
      ) : (
        <button
          onClick={stop}
          aria-label="Stop narration"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-all focus:outline-none focus:ring-2 focus:ring-destructive/30"
        >
          <Square size={14} aria-hidden="true" />
          <span>Stop</span>
        </button>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <div
          className="flex items-center gap-1.5 text-xs text-primary"
          aria-live="polite"
          aria-label="Currently speaking"
        >
          <Mic size={13} className="animate-pulse" aria-hidden="true" />
          <span className="font-medium">Speaking…</span>
          <span className="flex gap-0.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 bg-primary rounded-full animate-bounce"
                style={{ height: "12px", animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
