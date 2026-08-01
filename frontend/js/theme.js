/* =========================================================
   ADEVOS-X TECH — THEME ENGINE
   Runs synchronously in <head>, before first paint, so there's
   no flash of the wrong theme. 'system' (default) follows the
   phone's OS-level light/dark setting; the user can override it
   from Account → Settings, which is saved to localStorage.
   ========================================================= */

const Theme = {
  KEY: 'adevos_theme', // 'light' | 'dark' | 'system'

  getPreference() {
    return localStorage.getItem(this.KEY) || 'system';
  },

  resolve(pref) {
    if (pref === 'system') {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return pref;
  },

  apply(pref = this.getPreference()) {
    const resolved = this.resolve(pref);
    document.documentElement.setAttribute('data-theme', resolved);
  },

  set(pref) {
    localStorage.setItem(this.KEY, pref);
    this.apply(pref);
  }
};

Theme.apply();

// Live-update if the phone's system theme changes while the site is open,
// but only when the user hasn't chosen an explicit light/dark override.
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (Theme.getPreference() === 'system') Theme.apply();
});

