import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, Star, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Destination {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  cultural_significance: string | null;
  best_time_to_visit: string | null;
  image_url: string | null;
  rating: number | null;
}

export default function Destinations() {
  const { t } = useLanguage();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("destinations").select("*").order("rating", { ascending: false }).then(({ data }) => {
      setDestinations(data || []);
      setLoading(false);
    });
  }, []);

  const categories = ["all", ...new Set(destinations.map((d) => d.category))];
  const filtered = filter === "all" ? destinations : destinations.filter((d) => d.category === filter);

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-kulture-ocean flex items-center justify-center">
          <Compass size={22} className="text-accent-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{t("nav.destinations")}</h1>
          <p className="text-sm text-muted-foreground">Explore Sierra Leone's most incredible places</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
              filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={d.image_url || "/placeholder.svg"}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest font-medium text-primary">{d.category}</span>
                  {d.rating && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star size={12} className="fill-primary text-primary" /> {d.rating}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold">{d.name}</h3>
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin size={12} /> {d.location}
                </p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{d.description}</p>
                {d.best_time_to_visit && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock size={12} /> {d.best_time_to_visit}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
