import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb.from("destinations").select("*").eq("name", destination).single();

    const langMap: Record<string, string> = { kri: "Krio", fr: "French", es: "Spanish", zh: "Chinese" };
    const langInstruction = language && language !== "en" ? `Write in ${langMap[language] || "English"}.` : "";

    const destInfo = data ? `Name: ${data.name}\nLocation: ${data.location}\nDescription: ${data.description}\nCultural Significance: ${data.cultural_significance}` : `Destination: ${destination}`;

    const systemPrompt = `You are a master storyteller for Sierra Leone tourism. Write a cinematic, emotionally rich folklore-style narrative about this destination. Use vivid sensory details, metaphors, and poetic language. Make the reader feel transported. This should read like a National Geographic feature meets oral tradition storytelling. ${langInstruction}

DESTINATION:
${destInfo}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Tell me the story of ${destination}` }],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI service unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    sb.from("user_activity").insert({ action_type: "story", metadata: { destination, language } }).then(() => {});

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("story error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
