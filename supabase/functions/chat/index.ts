const SYSTEM_PROMPT = `Você é a IA da DEZRAIZ — assistente especializada para brasileiros que planejam, viajam ou já moram fora do Brasil.

Responda SEMPRE em português brasileiro, de forma clara, direta e empática. Seja objetivo e use exemplos práticos. Quando não tiver certeza, diga claramente.

Seus domínios de conhecimento:
- Documentos: passaporte, visto, residência, CASV, consulados brasileiros
- Impostos: declaração de saída definitiva, CPF, IRPF, acordos de bitributação
- Remessas: Wise, Remessa Online, Western Union, cotações de câmbio
- Vida no exterior: moradia, conta bancária local, seguro saúde, transporte
- Trabalho: visto de trabalho, contrato local, declaração de rendimentos no exterior
- Família: reunificação familiar, visto para cônjuge e filhos, escola para crianças

Limite cada resposta a 3-4 parágrafos. Use listas quando listar opções ou passos.`;

type SearchHint = {
  category: string;
  label: string;
  emoji: string;
};

const INTENT_PATTERNS: Array<{ regex: RegExp; hint: SearchHint }> = [
  { regex: /restaurante|comida|comer|lanche|prato brasileiro|churrasco|feijoada/i, hint: { category: "restaurant", label: "Restaurantes", emoji: "🍽️" } },
  { regex: /alugar|apartamento|quarto|moradia|casa|hospedagem|morar/i, hint: { category: "real_estate", label: "Moradia", emoji: "🏠" } },
  { regex: /banco|conta bancária|abrir conta|financ/i, hint: { category: "bank", label: "Bancos", emoji: "🏦" } },
  { regex: /médico|hospital|clínica|saúde|farmácia|dentista|pré.natal/i, hint: { category: "hospital", label: "Saúde", emoji: "🏥" } },
  { regex: /carro|cnh|locadora|aluguel de carro/i, hint: { category: "car_rental", label: "Aluguel de Carro", emoji: "🚗" } },
  { regex: /remessa|câmbio|transferir dinheiro|enviar dinheiro|wise|western union/i, hint: { category: "remittance", label: "Remessas e Câmbio", emoji: "💸" } },
];

const LOCATION_TRIGGER = /perto|próximo|aqui|na minha região|onde|encontrar|indicar|sugerir|tem algum/i;

function detectIntent(messages: { role: string; content: string }[]): SearchHint | null {
  const last = messages.filter((m) => m.role === "user").pop();
  if (!last) return null;
  const text = last.content;
  if (!LOCATION_TRIGGER.test(text)) return null;
  for (const { regex, hint } of INTENT_PATTERNS) {
    if (regex.test(text)) return hint;
  }
  return null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!groqKey) {
    return new Response(JSON.stringify({ error: "Serviço não configurado." }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { messages: { role: string; content: string }[]; stage?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { messages, stage } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Mensagens inválidas." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const searchHint = detectIntent(messages);

  const systemPrompt = stage
    ? `${SYSTEM_PROMPT}\n\nContexto do usuário: ${stageLabel(stage)}.`
    : SYSTEM_PROMPT;

  const groqMessages = [
    { role: "system", content: systemPrompt },
    ...messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content })),
  ];

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      stream: true,
      messages: groqMessages,
    }),
  });

  if (!groqRes.ok || !groqRes.body) {
    const errText = await groqRes.text().catch(() => "Erro desconhecido");
    return new Response(JSON.stringify({ error: errText }), {
      status: groqRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const reader = groqRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const chunk = JSON.parse(data);
              const text = chunk.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
              }
            } catch { /* malformed chunk, skip */ }
          }
        }

        if (searchHint) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ searchHint })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro interno.";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
});

function stageLabel(stage: string): string {
  switch (stage) {
    case "planning": return "está planejando a mudança (ainda no Brasil)";
    case "traveling": return "está viajando ou prestes a embarcar";
    case "living": return "já mora fora do Brasil";
    default: return "em situação não especificada";
  }
}
