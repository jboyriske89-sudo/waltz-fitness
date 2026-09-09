// Compatibility fix after the account header replaced the original Reset button.
// The original MVP startOnboarding() expected #resetBtn and stopped before rendering
// step 1 when that element was no longer present.
window.startOnboarding = function () {
  show('onboarding');
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) resetBtn.classList.remove('hidden');
  state.step = 0;
  renderStep();
};
