/* =========================================================
   ADEVOS-X TECH — OFFLINE HANDLING (PWA)
   Shows a banner when connectivity changes and blocks actions
   that require the server while offline.
   ========================================================= */

const NetworkGuard = {
  init() {
    window.addEventListener('offline', () => this.setBanner(false));
    window.addEventListener('online', () => this.setBanner(true));
    if (!navigator.onLine) this.setBanner(false);
  },

  setBanner(isOnline) {
    const banner = document.getElementById('offlineBanner');
    if (!banner) return;
    if (isOnline) {
      banner.textContent = 'Back online. Syncing your data...';
      banner.classList.add('show', 'online');
      setTimeout(() => banner.classList.remove('show'), 3000);
    } else {
      banner.textContent = 'You are offline. Some actions are unavailable until you reconnect.';
      banner.classList.remove('online');
      banner.classList.add('show');
    }
  },

  // Call before any action that requires the server (deploy, pay, pair, delete)
  requireOnline() {
    if (!navigator.onLine) {
      UI.showModal('No Connection', 'Please turn on mobile data or Wi-Fi to continue.', { confirmText: 'Got it' });
      return false;
    }
    return true;
  }
};

document.addEventListener('DOMContentLoaded', () => NetworkGuard.init());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW registration failed', err));
  });
}

