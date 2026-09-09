// WALTZ Fitness public client configuration.
// Supabase URL + publishable key are safe to expose in a browser app when Row Level Security is enabled.
// Never put Stripe secret keys or Supabase service-role keys in this file.
window.WALTZ_CONFIG = {
  SUPABASE_URL: "https://yssdxssdhkdzovtqkrrk.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_Yq0Pja_ItH5rInpdyOq_Sg_anI0PCjO",
  CHECKOUT_FUNCTION_URL: "",
  PRICE_USD: 10,
  PREVIEW_MODE: true
};

// Compatibility shim for the original MVP.
// app.js still references a legacy #resetBtn during startup. The visible header was
// replaced by account controls, so create an invisible reset button before app.js runs
// to prevent startup from aborting and leaving onboarding blank.
if (!document.getElementById('resetBtn')) {
  const legacyReset = document.createElement('button');
  legacyReset.id = 'resetBtn';
  legacyReset.className = 'hidden';
  legacyReset.type = 'button';
  legacyReset.setAttribute('aria-hidden', 'true');
  legacyReset.tabIndex = -1;
  document.body.appendChild(legacyReset);
}
