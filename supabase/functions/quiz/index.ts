import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const fallbackQuestions = [
  { question: "What is the capital of Sierra Leone?", options: ["Freetown", "Monrovia", "Conakry", "Accra"], correct: 0, explanation: "Freetown is the capital and largest city of Sierra Leone." },
  { question: "Which tree symbolizes freedom in Freetown?", options: ["Baobab", "Cotton Tree", "Palm Tree", "Acacia"], correct: 1, explanation: "The Cotton Tree is a symbol of freedom where freed slaves prayed upon arrival." },
  { question: "What is Sierra Leone's national dish?", options: ["Jollof Rice", "Fufu", "Cassava Leaf Stew", "Egusi Soup"], correct: 2, explanation: "Cassava Leaf Stew (Plasas) is considered the national dish." },
  { question: "When did Sierra Leone gain independence?", options: ["1957", "1960", "1961", "1963"], correct: 2, explanation: "Sierra Leone gained independence from Britain on April 27, 1961." },
  { question: "What is the lingua franca of Sierra Leone?", options: ["English", "Krio", "Mende", "Temne"], correct: 1, explanation: "Krio is spoken by about 97% of Sierra Leoneans." },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: knowledge } = await sb.from("cultural_knowledge").select("title, category, content").limit(12);

    const langMap: Record<string, string> = { kri: "Krio", fr: "French", es: "Spanish", zh: "Chinese" };
    const langInstruction = language && language !== "en" ? `Generate questions in ${langMap[language] || "English"}.` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `Generate 5 multiple-choice quiz questions about Sierra Leone based on this knowledge:\n${(knowledge || []).map(k => `${k.title}: ${k.content}`).join("\n")}\n${langInstruction}` },
          { role: "user", content: "Generate 5 quiz questions." }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_quiz",
            description: "Generate quiz questions",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correct: { type: "number" },
                      explanation: { type: "string" }
                    },
                    required: ["question", "options", "correct", "explanation"],
                    additionalProperties: false
                  }
                }
              },
              required: ["questions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_quiz" } }
      }),
    });

    if (!response.ok) {
      console.error("Quiz AI error:", response.status);
      return new Response(JSON.stringify({ questions: fallbackQuestions }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      sb.from("user_activity").insert({ action_type: "quiz", metadata: { language } }).then(() => {});
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ questions: fallbackQuestions }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("quiz error:", e);
    return new Response(JSON.stringify({ questions: fallbackQuestions }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
