import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const fallback = {
  personality: "The Curious Explorer",
  affinity: "Cultural Heritage",
  description: "You're drawn to the stories behind the places. History, traditions, and the human experience fuel your wanderlust. Sierra Leone's rich tapestry of cultures — from Krio heritage to Mende traditions — would captivate your soul. You'd find yourself lingering at Bunce Island, tracing the footsteps of history, or sitting under the Cotton Tree absorbing centuries of stories.",
  suggestedDestinations: ["Bunce Island", "Cotton Tree", "National Railway Museum", "Freetown Peninsula"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const langMap: Record<string, string> = { kri: "Krio", fr: "French", es: "Spanish", zh: "Chinese" };
    const langInstruction = language && language !== "en" ? `Respond in ${langMap[language] || "English"}.` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `Generate a travel personality profile for someone interested in Sierra Leone. ${langInstruction}` },
          { role: "user", content: "Generate my travel personality for Sierra Leone." }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_profile",
            description: "Generate travel personality",
            parameters: {
              type: "object",
              properties: {
                personality: { type: "string", description: "e.g. The Curious Explorer" },
                affinity: { type: "string", description: "e.g. Cultural Heritage" },
                description: { type: "string", description: "2-3 paragraph personality description" },
                suggestedDestinations: { type: "array", items: { type: "string" } }
              },
              required: ["personality", "affinity", "description", "suggestedDestinations"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_profile" } }
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("insights error:", e);
    return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
