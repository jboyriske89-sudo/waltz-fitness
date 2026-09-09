# WALTZ Fitness: Accounts + Payments Setup

The frontend, account screens, paywall, database schema, and Stripe/Supabase integration code are already in this repository. To make real sign-in and real $10 payments work, connect Supabase and Stripe.

## 1. Create Supabase project
1. Create a Supabase project.
2. In SQL Editor, run `supabase/schema.sql`.
3. In Authentication > URL Configuration, add the GitHub Pages URL as the Site URL and redirect URL.
4. Copy the Project URL and anon/public key into `config.js`.

Do not put the Supabase service-role key in `config.js`.

## 2. Create Stripe product
1. In Stripe, create a one-time product named `WALTZ Fitness 12-Week Program`.
2. Set price to USD $10.00, one-time.
3. Copy the Stripe Price ID.

## 3. Deploy Supabase Edge Functions
Deploy:
- `supabase/functions/create-checkout`
- `supabase/functions/stripe-webhook`

Set these function secrets in Supabase:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

The Supabase URL and anon key are normally available in the function environment; set them too if required by your project.

## 4. Stripe webhook
In Stripe Developers > Webhooks, add the deployed `stripe-webhook` function URL and subscribe to:
- `checkout.session.completed`

Copy the webhook signing secret into the Supabase function secret `STRIPE_WEBHOOK_SECRET`.

## 5. Connect frontend checkout
Put the deployed `create-checkout` function URL into `config.js` as `CHECKOUT_FUNCTION_URL`.

## Security design
- Each user authenticates with Supabase Auth.
- Row Level Security isolates each member's records by `auth.uid()`.
- Paid program access is granted only by the server-side Stripe webhook after Stripe reports a completed paid checkout.
- Stripe secret keys and Supabase service-role keys never go into the public GitHub Pages frontend.

## Exercise demos
`exercise-demos.js` provides exercise-specific animated human demonstrations immediately. The code is designed so these can later be replaced with MP4/WebM clips without changing the workout data model.
