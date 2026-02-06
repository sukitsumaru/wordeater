
// Simple mobile detection
function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// Force mobile mode if on mobile
if (isMobile()) {
  document.body.classList.add('force-mobile');
}
