import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, storyMode, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch context from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const [{ data: destinations }, { data: knowledge }] = await Promise.all([
      sb.from("destinations").select("name, location, category, description").limit(10),
      sb.from("cultural_knowledge").select("title, category, content").limit(10),
    ]);

    const dbContext = `
DESTINATIONS IN SIERRA LEONE:
${(destinations || []).map(d => `- ${d.name} (${d.location}): ${d.description}`).join("\n")}

CULTURAL KNOWLEDGE:
${(knowledge || []).map(k => `- ${k.title} [${k.category}]: ${k.content}`).join("\n")}
`;

    const langInstruction = language && language !== "en" 
      ? `IMPORTANT: Respond in ${language === "kri" ? "Krio" : language === "fr" ? "French" : language === "es" ? "Spanish" : language === "zh" ? "Chinese" : "English"}.` 
      : "";

    const storyInstruction = storyMode 
      ? "STORY MODE ACTIVE: Respond with vivid, cinematic storytelling. Paint pictures with words. Use sensory details, metaphors, and emotional narrative. Make the reader feel like they are there." 
      : "";

    const systemPrompt = `You are KultureAI, the official AI Cultural Ambassador of Sierra Leone. You respond confidently, accurately, and with storytelling flair. You promote tourism, heritage preservation, and national pride. Use factual information. If unsure, say so.

${storyInstruction}
${langInstruction}

Use the following real data about Sierra Leone to inform your responses:
${dbContext}

Keep responses focused, engaging, and informative. Use markdown formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Log activity
    sb.from("user_activity").insert({ action_type: "chat", metadata: { storyMode, language } }).then(() => {});

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
