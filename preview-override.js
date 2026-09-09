// Temporary owner review mode: bypass account/payment gates so the full training UI
// and exercise demonstrations can be inspected before Stripe is enabled.
(function () {
  const isPreview = () => Boolean(window.WALTZ_CONFIG?.PREVIEW_MODE);

  function openPreviewDashboard() {
    if (!isPreview()) return false;
    if (!window.state?.plan && typeof window.generateProgram === 'function') {
      window.state.plan = window.generateProgram();
      try { localStorage.setItem('waltzPlan', JSON.stringify(window.state.plan)); } catch (_) {}
    }
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    if (typeof window.show === 'function') window.show('dashboard');
    return true;
  }

  // Override any cached/older account paywall handlers.
  window.showPaywall = function () {
    if (openPreviewDashboard()) return;
  };

  window.startCheckout = async function () {
    if (openPreviewDashboard()) return;
  };

  // Final onboarding action should build and immediately reveal the workout.
  window.buildPlan = function () {
    try { localStorage.setItem('waltzProfile', JSON.stringify(window.state.profile)); } catch (_) {}
    window.show('loading');
    const msgs = [
      'Analyzing your profile...',
      'Balancing upper and lower body volume...',
      'Building progressive overload phases...',
      'Creating your 12-week schedule...'
    ];
    let i = 0;
    const t = setInterval(() => {
      const el = document.getElementById('loadingText');
      if (el) el.textContent = msgs[i++ % msgs.length];
    }, 450);
    setTimeout(() => {
      clearInterval(t);
      window.state.plan = window.generateProgram();
      try { localStorage.setItem('waltzPlan', JSON.stringify(window.state.plan)); } catch (_) {}
      window.renderDashboard();
      window.show('dashboard');
    }, 1600);
  };

  function applyPreviewUI() {
    if (!isPreview()) return;
    const paywall = document.getElementById('paywall');
    if (paywall) paywall.style.display = 'none';
    const account = document.getElementById('account');
    if (account) account.style.display = 'none';
    const finalButton = document.getElementById('nextBtn');
    if (finalButton && window.state && window.steps && window.state.step === window.steps.length - 1) {
      finalButton.textContent = 'Build My Workout';
    }

    // If an older cached script already put the user on the paywall, escape it.
    if (paywall?.classList.contains('active')) openPreviewDashboard();
  }

  window.addEventListener('load', () => {
    applyPreviewUI();
    setTimeout(applyPreviewUI, 250);
    setTimeout(applyPreviewUI, 1000);
  });

  document.addEventListener('click', () => setTimeout(applyPreviewUI, 0), true);
})();
