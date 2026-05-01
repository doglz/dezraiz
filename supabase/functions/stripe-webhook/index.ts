import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const PLAN_MAP: Record<string, "raizes" | "terra"> = {
  raizes: "raizes",
  terra: "terra",
};

Deno.serve(async (req) => {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!secretKey || !webhookSecret) {
    return new Response("Webhook não configurado.", { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Assinatura ausente.", { status: 400 });

  const body = await req.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assinatura inválida.";
    return new Response(message, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planKey = session.metadata?.planKey;

    if (userId && planKey && PLAN_MAP[planKey]) {
      await supabase
        .from("profiles")
        .update({ plan: PLAN_MAP[planKey], updated_at: new Date().toISOString() })
        .eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    // Downgrade to livre when subscription is canceled
    const sub = event.data.object as Stripe.Subscription;
    const metadata = sub.metadata as Record<string, string>;
    if (metadata?.userId) {
      await supabase
        .from("profiles")
        .update({ plan: "livre", updated_at: new Date().toISOString() })
        .eq("id", metadata.userId);
    }
  }

  return new Response("ok", { status: 200 });
});
