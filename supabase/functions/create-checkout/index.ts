import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripePriceId = Deno.env.get("STRIPE_PRICE_ID")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { success_url, cancel_url } = await req.json();
    const stripe = new Stripe(stripeSecret);
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();

    let customer = profile?.stripe_customer_id || undefined;
    if (!customer) {
      const created = await stripe.customers.create({ email: user.email || undefined, metadata: { supabase_user_id: user.id } });
      customer = created.id;
      await admin.from("profiles").upsert({ id: user.id, email: user.email, stripe_customer_id: customer });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url,
      cancel_url,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, product: "waltz-12-week-program" },
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Checkout failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
