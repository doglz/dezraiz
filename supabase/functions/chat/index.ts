// @ts-nocheck — Deno runtime; local TS não conhece Deno.serve / Deno.env

// Catálogo de categorias de busca — usado pelo AI para decidir o marcador [MAPA:x]
// e pelo Edge Function para construir o SearchHint.
const SEARCH_CATALOG: Record<string, { label: string; emoji: string }> = {
  restaurant:  { label: "Restaurantes",          emoji: "🍽️" },
  supermarket: { label: "Supermercados",          emoji: "🛒" },
  real_estate: { label: "Moradia",                emoji: "🏠" },
  hotel:       { label: "Hotéis e Pousadas",      emoji: "🏨" },
  hospital:    { label: "Hospitais e Clínicas",   emoji: "🏥" },
  pharmacy:    { label: "Farmácias",              emoji: "💊" },
  dentist:     { label: "Dentistas",              emoji: "🦷" },
  veterinary:  { label: "Veterinários",           emoji: "🐾" },
  bank:        { label: "Bancos",                 emoji: "🏦" },
  remittance:  { label: "Remessas e Câmbio",      emoji: "💸" },
  car_rental:  { label: "Aluguel de Carro",       emoji: "🚗" },
  gas_station: { label: "Postos de Gasolina",     emoji: "⛽" },
  transit:     { label: "Transporte Público",     emoji: "🚇" },
  park:        { label: "Parques e Praças",       emoji: "🌳" },
  gym:         { label: "Academias",              emoji: "💪" },
  shopping:    { label: "Shopping e Lojas",       emoji: "🛍️" },
  beauty:      { label: "Salões e Barbearias",    emoji: "✂️" },
  worship:     { label: "Igrejas e Templos",      emoji: "🙏" },
  school:      { label: "Escolas",                emoji: "🏫" },
  laundry:     { label: "Lavanderias",            emoji: "👕" },
  consulate:   { label: "Consulados e Cartórios", emoji: "🏛️" },
  coworking:   { label: "Coworkings",             emoji: "💻" },
  library:     { label: "Bibliotecas",            emoji: "📚" },
  police:      { label: "Delegacias",             emoji: "🚔" },
  airport:     { label: "Aeroportos",             emoji: "✈️" },
};

const CATEGORY_LIST = Object.keys(SEARCH_CATALOG).join(", ");

const SYSTEM_PROMPT = `Você é a IA da DEZRAIZ — assistente especializada para brasileiros que planejam, viajam ou já moram fora do Brasil.

Responda SEMPRE em português brasileiro, de forma clara, direta e empática. Comece pela resposta mais útil e use exemplos práticos. Quando não tiver certeza, diga claramente.

Seus domínios de conhecimento:
- Documentos: passaporte, visto, residência, CASV, consulados brasileiros
- Impostos: declaração de saída definitiva, CPF, IRPF, acordos de bitributação
- Remessas: Wise, Remessa Online, Western Union, cotações de câmbio
- Vida no exterior: moradia, conta bancária local, seguro saúde, transporte
- Trabalho: visto de trabalho, contrato local, declaração de rendimentos no exterior
- Família: reunificação familiar, visto para cônjuge e filhos, escola para crianças
- Dia a dia: ajudar a encontrar serviços locais (restaurantes, hospitais, parques, veterinários, academias e outros) perto do usuário

ESCOPO — Quando o usuário perguntar algo completamente fora desses domínios (esportes, receitas culinárias em casa, entretenimento, celebridades, programação, matemática, ciência geral, política não relacionada a imigração, etc.), responda com cordialidade: "Sou especializada em ajudar brasileiros no exterior — documentação, finanças, burocracia e vida fora do Brasil. Para esse assunto não consigo te ajudar, mas se tiver dúvidas sobre sua vida lá fora, pode perguntar!"

BUSCA LOCAL — O app usa Mapbox para buscar lugares próximos e exibir cards com mapa/foto, endereço, distância e link. Quando o usuário estiver pedindo para encontrar algo fisicamente próximo à sua localização atual (ex: "tem uma farmácia perto?", "preciso de um veterinário aqui", "onde achar um parque", "restaurante perto de mim"), responda de forma curta e adicione na ÚLTIMA LINHA da resposta o marcador:
[MAPA:categoria]

Use SOMENTE categorias desta lista: ${CATEGORY_LIST}

Escolha a categoria mais específica possível. NÃO use o marcador para perguntas gerais ou informativas (ex: "como funciona seguro saúde", "qual o melhor banco para remessa" não precisam de marcador — só use quando o usuário quer encontrar algo físico perto de onde está).

Quando usar BUSCA LOCAL, não invente nomes, endereços ou rankings. Diga apenas que vai buscar opções próximas e deixe que os cards do Mapbox mostrem os lugares reais. O marcador [MAPA:categoria] é técnico: ele deve ficar sozinho na última linha e nunca deve ser explicado ao usuário.

TAMANHO DA RESPOSTA — Ajuste o nível de detalhe ao pedido:
- Pergunta simples: responda em 1-3 frases, sem rodeios.
- Pergunta prática: use 3-5 bullets curtos ou até 3 parágrafos pequenos.
- Passo a passo, checklist, comparação ou tema burocrático complexo: use mais detalhes, mas mantenha no máximo 6 bullets ou 6 passos, salvo se o usuário pedir "detalhado", "completo" ou "explique melhor".
- Se houver muita coisa importante, dê o essencial primeiro e finalize oferecendo aprofundar um ponto específico.
- Evite blocos longos de texto. Prefira frases curtas.

FORMATAÇÃO — Use Markdown simples para facilitar leitura no app:
- Use subtítulos curtos com emoji quando ajudar, por exemplo: "### ✅ O essencial" ou "### 📌 Próximos passos".
- Use no máximo 1 emoji por subtítulo ou bullet importante; emojis devem orientar visualmente, não enfeitar demais.
- Use listas com bullets ou números para opções, passos e documentos.
- Indente subitens com dois espaços quando houver hierarquia.
- Destaque termos importantes com **negrito**.
- Não use tabelas grandes. Se comparar opções, prefira bullets curtos.`;

type UserProfile = {
  firstName?: string;
  journeyStage?: string;
  destinationCountry?: string;
  destinationCity?: string;
  locationCountry?: string;
  locationCity?: string;
  currentLocationCity?: string;
  currentLocationCountry?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  arrivalMonth?: number;
  arrivalYear?: number;
  mainGoal?: string;
  languageLevel?: string;
  familyStatus?: string;
  hasChildren?: boolean;
  visaStatus?: string;
  visaIntent?: string;
  workType?: string;
  remittance?: string;
  bankAccount?: string;
};

type SearchHint = {
  category: string;
  label: string;
  emoji: string;
};

const VISA_STATUS: Record<string, string> = {
  tourist: "turista",
  work_visa: "visto de trabalho",
  permanent: "residência permanente",
  student: "estudante",
  regularizing: "regularizando",
};
const VISA_INTENT: Record<string, string> = {
  tourist: "turista",
  work: "trabalho",
  student: "estudante",
  permanent: "residência permanente",
  unsure: "ainda não decidido",
};
const WORK_TYPE: Record<string, string> = {
  employed: "empregado com carteira local",
  freelancer: "autônomo / freelancer",
  not_working: "ainda não trabalhando",
};
const BANK: Record<string, string> = {
  yes: "sim, já tem conta local",
  no: "não tem ainda",
  in_progress: "abrindo",
};
const FAMILY: Record<string, string> = {
  alone: "sozinho(a)",
  with_partner: "com cônjuge",
  with_family: "com filhos / família",
};
const LANGUAGE: Record<string, string> = {
  basic: "básico",
  manage: "intermediário",
  fluent: "fluente",
};
const GOAL: Record<string, string> = {
  documents: "resolver documentação (vistos, RNE, CPF, burocracia)",
  job: "encontrar emprego",
  bring_family: "trazer a família",
  language: "aprender o idioma",
  adapt: "adaptar-se à vida no país",
  planning: "ainda se planejando",
};
const REMITTANCE: Record<string, string> = {
  sometimes: "às vezes",
  monthly: "todo mês",
};

function buildProfileContext(profile: UserProfile): string {
  const lines: string[] = [];

  if (profile.firstName) lines.push(`- Nome: ${profile.firstName}`);
  if (profile.journeyStage) lines.push(`- Situação: ${stageLabel(profile.journeyStage)}`);

  const place =
    profile.journeyStage === "living"
      ? [profile.locationCity, profile.locationCountry].filter(Boolean).join(", ")
      : [profile.destinationCity, profile.destinationCountry].filter(Boolean).join(", ");
  if (place) {
    const label = profile.journeyStage === "living" ? "Mora em" : "Destino";
    lines.push(`- ${label}: ${place}`);
  }

  if (profile.arrivalMonth && profile.arrivalYear) {
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    const label = profile.journeyStage === "living" ? "Chegou em" : "Previsto para";
    lines.push(`- ${label}: ${months[profile.arrivalMonth - 1]}/${profile.arrivalYear}`);
  }

  const currentPlace = [profile.currentLocationCity, profile.currentLocationCountry].filter(Boolean).join(", ");
  if (currentPlace) {
    lines.push(`- Localização atual (GPS): ${currentPlace}`);
  } else if (profile.currentLatitude && profile.currentLongitude) {
    lines.push(`- Localização atual (GPS): lat ${profile.currentLatitude.toFixed(4)}, lng ${profile.currentLongitude.toFixed(4)}`);
  }

  if (profile.visaStatus) lines.push(`- Visto atual: ${VISA_STATUS[profile.visaStatus] ?? profile.visaStatus}`);
  if (profile.visaIntent) lines.push(`- Tipo de visto desejado: ${VISA_INTENT[profile.visaIntent] ?? profile.visaIntent}`);
  if (profile.workType) lines.push(`- Trabalho: ${WORK_TYPE[profile.workType] ?? profile.workType}`);
  if (profile.bankAccount) lines.push(`- Conta bancária local: ${BANK[profile.bankAccount] ?? profile.bankAccount}`);
  if (profile.remittance && profile.remittance !== "never") lines.push(`- Envia remessas para o Brasil: ${REMITTANCE[profile.remittance] ?? profile.remittance}`);
  if (profile.familyStatus) lines.push(`- Vai ${FAMILY[profile.familyStatus] ?? profile.familyStatus}`);
  if (profile.hasChildren) lines.push(`- Tem filhos`);
  if (profile.languageLevel) lines.push(`- Nível no idioma local: ${LANGUAGE[profile.languageLevel] ?? profile.languageLevel}`);
  if (profile.mainGoal) lines.push(`- Objetivo principal: ${GOAL[profile.mainGoal] ?? profile.mainGoal}`);

  if (lines.length === 0) return "";
  return `\n\nPerfil do usuário (use estas informações para personalizar e contextualizar suas respostas — não é necessário mencioná-las explicitamente, apenas leve-as em conta):\n${lines.join("\n")}`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Regex to detect [MAPA:category] marker at the very end of the AI response
const MAPA_RE = /\n?\s*\[MAPA:([a-z_]+)\]\s*$/;
// Tail buffer size — must be >= max marker length "[MAPA:gas_station]" = 19 chars + some whitespace
const TAIL_SIZE = 40;

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

  let body: { messages: { role: string; content: string }[]; profile?: UserProfile };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { messages, profile } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Mensagens inválidas." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const profileContext = profile ? buildProfileContext(profile) : "";
  const systemPrompt = SYSTEM_PROMPT + profileContext;

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
      max_tokens: 800,
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
        // Rolling tail buffer — holds back the last TAIL_SIZE chars so we can
        // detect and strip the [MAPA:x] marker without ever sending it to client.
        let tail = "";

        const flushSafe = () => {
          if (tail.length > TAIL_SIZE) {
            const safe = tail.slice(0, tail.length - TAIL_SIZE);
            if (safe) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: safe })}\n\n`));
            tail = tail.slice(tail.length - TAIL_SIZE);
          }
        };

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
                tail += text;
                flushSafe();
              }
            } catch { /* malformed chunk, skip */ }
          }
        }

        // Stream ended — check tail for [MAPA:category] marker
        let searchHint: SearchHint | null = null;
        const mapaMatch = tail.match(MAPA_RE);
        if (mapaMatch) {
          const category = mapaMatch[1];
          const cat = SEARCH_CATALOG[category];
          if (cat) searchHint = { category, ...cat };
          // Emit tail without the marker
          const cleanTail = tail.slice(0, mapaMatch.index ?? tail.length).replace(/\s+$/, "");
          if (cleanTail) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: cleanTail })}\n\n`));
        } else {
          // No marker — emit tail as-is
          if (tail) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: tail })}\n\n`));
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
      "X-Accel-Buffering": "no",
      "Connection": "keep-alive",
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
