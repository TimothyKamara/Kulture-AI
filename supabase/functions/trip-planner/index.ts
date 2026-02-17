import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { days, budget, interests, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const [{ data: destinations }, { data: services }] = await Promise.all([
      sb.from("destinations").select("name, location, category, description, best_time_to_visit"),
      sb.from("services").select("name, type, location, description, price_range"),
    ]);

    const langMap: Record<string, string> = { kri: "Krio", fr: "French", es: "Spanish", zh: "Chinese" };
    const langInstruction = language && language !== "en" ? `Respond in ${langMap[language] || "English"}.` : "";

    const systemPrompt = `You are KultureAI Trip Planner. Create a detailed ${days}-day Sierra Leone itinerary.

Budget level: ${budget}
Interests: ${(interests || []).join(", ") || "General"}
${langInstruction}

REAL DESTINATIONS:
${(destinations || []).map(d => `- ${d.name} (${d.location}, ${d.category}): ${d.description}`).join("\n")}

SERVICES:
${(services || []).map(s => `- ${s.name} (${s.type}, ${s.location}): ${s.description} [${s.price_range}]`).join("\n")}

Format as a day-by-day itinerary with Morning, Afternoon, Evening sections. Include specific destinations, estimated costs, travel tips, and cultural notes. Use markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Plan a ${days}-day trip to Sierra Leone with a ${budget} budget focused on: ${(interests || []).join(", ") || "everything"}` }],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI service unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    sb.from("user_activity").insert({ action_type: "trip_plan", metadata: { days, budget, interests } }).then(() => {});

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("trip-planner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
