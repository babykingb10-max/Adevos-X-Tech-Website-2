/* =========================================================
   ADEVOS-X TECH — AUTH / SESSION STATE
   Stores the JWT issued by the backend after Google/Apple/Email
   login. Session persists across visits via localStorage; the
   token itself is verified server-side on every request.
   ========================================================= */

const Auth = {
  TOKEN_KEY: 'adevos_token',
  USER_KEY: 'adevos_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/';
  },

  // Call on protected pages (deploy, manage, av-coins, payment) to force login
  requireLogin() {
    if (!this.isLoggedIn()) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `/pages/signin.html?next=${next}`;
      return false;
    }
    return true;
  },

  isDeployer() {
    return this.getUser()?.subscription?.plan === 'DEPLOYER';
  }
};
