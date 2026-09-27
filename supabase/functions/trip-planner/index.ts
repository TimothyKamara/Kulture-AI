import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { days, budget, budgetAmount, budgetCurrency, interests, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const [{ data: destinations }, { data: services }] = await Promise.all([
      sb.from("destinations").select("name, location, category, description, best_time_to_visit"),
      sb.from("services").select("name, type, location, description, price_range"),
    ]);

    const langMap: Record<string, string> = { kri: "Krio", fr: "French", es: "Spanish", zh: "Chinese" };
    const langInstruction = language && language !== "en" ? `Respond in ${langMap[language] || "English"}.` : "";

    const budgetLine = budgetAmount
      ? `Exact budget: ${budgetAmount} ${budgetCurrency || "USD"} total for the entire trip.`
      : `Budget level: ${budget}`;

    const budgetWarningInstruction = budgetAmount
      ? `IMPORTANT: If the provided budget (${budgetAmount} ${budgetCurrency || "USD"}) is genuinely too low for a ${days}-day trip to Sierra Leone, clearly and kindly say so at the TOP of your response BEFORE the itinerary. Explain what that budget can realistically cover, give a recommended minimum budget, and then provide a scaled-down itinerary or tips to make it work. Be honest but encouraging.`
      : "";

    const systemPrompt = `You are KultureAI Trip Planner. Create a detailed ${days}-day Sierra Leone itinerary.

${budgetLine}
${budgetWarningInstruction}
Interests: ${(interests || []).join(", ") || "General"}
${langInstruction}

REAL DESTINATIONS:
${(destinations || []).map(d => `- ${d.name} (${d.location}, ${d.category}): ${d.description}`).join("\n")}

SERVICES:
${(services || []).map(s => `- ${s.name} (${s.type}, ${s.location}): ${s.description} [${s.price_range}]`).join("\n")}

STRICT OUTPUT FORMAT (markdown):
1. Start with a short 2-3 sentence overview (and the budget assessment if applicable, as a "> " blockquote).
2. Then a "## Budget Breakdown" is NOT allowed at the top — keep it for the end.
3. For EACH day, a heading exactly like: "## Day 1: Short Title [theme]" where theme is ONE of: beach, wildlife, history, food, culture.
   Under it use "### Morning", "### Afternoon", "### Evening" subheadings, each with 2-4 concise bullet points (place, activity, cost in ${budgetCurrency || "USD"}).
   End each day with one "> 💡 Tip:" blockquote with a cultural note or travel tip.
4. After the days, add "### Budget Breakdown" as a markdown table (Category | Estimated Cost) with a Total row.
5. Finish with "### Packing & Etiquette" as 4-6 short bullets.
Avoid long paragraphs and avoid overusing bold.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Plan a ${days}-day trip to Sierra Leone with a ${budget} budget${budgetAmount ? ` of ${budgetAmount} ${budgetCurrency || "USD"}` : ""} focused on: ${(interests || []).join(", ") || "everything"}` }],
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
