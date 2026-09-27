import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sun, Sunset, Moon, CalendarDays } from "lucide-react";
import beach from "@/assets/trip-beach.jpg";
import wildlife from "@/assets/trip-wildlife.jpg";
import history from "@/assets/trip-history.jpg";
import food from "@/assets/trip-food.jpg";
import culture from "@/assets/hero-bg.jpg";

const THEMES: Record<string, string> = { beach, wildlife, nature: wildlife, adventure: wildlife, history, city: history, food, culture };

function pickImage(theme: string, title: string, idx: number) {
  const key = theme.toLowerCase().trim();
  if (THEMES[key]) return THEMES[key];
  const t = title.toLowerCase();
  if (/beach|island|river no|tokeh|bureh|banana/.test(t)) return beach;
  if (/tiwai|chimp|forest|park|wildlife|outamba/.test(t)) return wildlife;
  if (/bunce|museum|cotton|history|freetown/.test(t)) return history;
  if (/food|market|cuisine/.test(t)) return food;
  return [beach, history, wildlife, food, culture][idx % 5];
}

const mdComponents = {
  h3: ({ children }: any) => {
    const text = String(children).toLowerCase();
    const Icon = text.includes("morning") ? Sun : text.includes("afternoon") ? Sunset : text.includes("evening") ? Moon : null;
    return (
      <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground mt-5 mb-2">
        {Icon && <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center"><Icon size={14} /></span>}
        {children}
      </h3>
    );
  },
  blockquote: ({ children }: any) => (
    <div className="my-4 rounded-lg border-l-4 border-secondary bg-secondary/10 px-4 py-3 text-sm [&_p]:my-0">{children}</div>
  ),
  table: ({ children }: any) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border"><table className="w-full text-sm my-0">{children}</table></div>
  ),
  th: ({ children }: any) => <th className="bg-muted px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }: any) => <td className="px-3 py-2 border-t border-border">{children}</td>,
};

function Md({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{text}</ReactMarkdown>
    </div>
  );
}

export default function ItineraryView({ text }: { text: string }) {
  // Split on "## Day ..." headings
  const parts = text.split(/^(?=##\s+Day\b)/im);
  const intro = parts[0].match(/^##\s+Day\b/i) ? "" : parts.shift() || "";

  return (
    <div className="space-y-6">
      {intro.trim() && <Md text={intro} />}
      {parts.map((section, i) => {
        const [headLine, ...rest] = section.split("\n");
        const raw = headLine.replace(/^##\s+/, "");
        const themeMatch = raw.match(/\[(\w+)\]\s*$/);
        const title = raw.replace(/\[(\w+)\]\s*$/, "").trim();
        const img = pickImage(themeMatch?.[1] || "", title, i);
        return (
          <article key={i} className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="relative h-40 md:h-52">
              <img src={img} alt={title} loading="lazy" width={1280} height={640} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 p-4 flex items-center gap-2 text-background">
                <CalendarDays size={18} />
                <h2 className="font-display text-lg md:text-xl font-bold">{title}</h2>
              </div>
            </div>
            <div className="p-5"><Md text={rest.join("\n")} /></div>
          </article>
        );
      })}
    </div>
  );
}
