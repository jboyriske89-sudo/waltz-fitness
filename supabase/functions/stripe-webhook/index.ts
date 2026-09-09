import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe";

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
    const signature = req.headers.get("stripe-signature");
    if (!signature) return new Response("Missing signature", { status: 400 });

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        const userId = session.metadata?.supabase_user_id || session.client_reference_id;
        if (userId) {
          const admin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          await admin.from("profiles").upsert({
            id: userId,
            paid_access: true,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            stripe_checkout_session_id: session.id,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    return new Response(e.message || "Webhook error", { status: 400 });
  }
});
