import Stripe from "npm:stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) {
    return new Response(JSON.stringify({ error: "Pagamento não configurado." }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const PRICE_IDS: Record<string, string | undefined> = {
    raizes: Deno.env.get("STRIPE_PRICE_ID_RAIZES"),
    terra: Deno.env.get("STRIPE_PRICE_ID_TERRA"),
  };

  let body: { planKey: string; userId: string; email: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const priceId = PRICE_IDS[body.planKey];
  if (!priceId) {
    return new Response(JSON.stringify({ error: "Plano inválido." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const origin = req.headers.get("origin") ?? "https://dezraiz.douglaz2005.workers.dev";
  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.email,
      metadata: { userId: body.userId, planKey: body.planKey },
      success_url: `${origin}/planos?success=true&plan=${body.planKey}`,
      cancel_url: `${origin}/planos?canceled=true`,
      locale: "pt-BR",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar sessão.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
