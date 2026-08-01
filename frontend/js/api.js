/* =========================================================
   ADEVOS-X TECH — API CLIENT
   Thin wrapper around fetch(). Every backend call goes through
   here so auth headers, error handling, and the base URL stay
   in one place.
   ========================================================= */

const Api = {
  async request(path, { method = 'GET', body = null, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = Auth.getToken();
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });
    } catch (err) {
      throw { offline: true, message: 'Cannot reach the server. Check your connection.' };
    }

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      throw { status: res.status, message: data?.message || 'Something went wrong.', data };
    }
    return data;
  },

  // ---- Public config ----
  getSiteConfig: () => Api.request('/config', { auth: false }),
  getSlides: () => Api.request('/config/slides', { auth: false }),
  getHomepageCards: (section) => Api.request(`/config/cards?section=${section}`, { auth: false }),

  // ---- Auth ----
  signUp: (payload) => Api.request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  verifyOtp: (payload) => Api.request('/auth/verify-otp', { method: 'POST', body: payload, auth: false }),
  login: (payload) => Api.request('/auth/login', { method: 'POST', body: payload, auth: false }),
  googleLogin: (idToken) => Api.request('/auth/google', { method: 'POST', body: { idToken }, auth: false }),
  resendOtp: (email) => Api.request('/auth/resend-otp', { method: 'POST', body: { email }, auth: false }),
  me: () => Api.request('/auth/me'),

  // ---- Bots / Deployment ----
  getDeploymentStatus: () => Api.request('/bots/deployment-status'),
  getAvailableBots: () => Api.request('/bots/available'),
  getDeploymentPlatforms: () => Api.request('/bots/platforms'),
  deployBot: (payload) => Api.request('/bots/deploy', { method: 'POST', body: payload }),
  getMyBots: () => Api.request('/bots/mine'),
  botAction: (botId, action, payload = {}) => Api.request(`/bots/${botId}/${action}`, { method: 'POST', body: payload }),
  deleteBot: (botId) => Api.request(`/bots/${botId}`, { method: 'DELETE' }),
  changePlatform: (botId, platform) => Api.request(`/bots/${botId}/change-platform`, { method: 'POST', body: { platform } }),

  // ---- Payments ----
  getPaymentMethods: () => Api.request('/payments/methods', { auth: false }),
  initiatePayment: (payload) => Api.request('/payments/initiate', { method: 'POST', body: payload }),
  getPaymentStatus: (paymentId) => Api.request(`/payments/${paymentId}/status`),

  // ---- AV Coins ----
  getCoinsWallet: () => Api.request('/coins/wallet'),
  generateReferralLink: (payload) => Api.request('/coins/referral/generate', { method: 'POST', body: payload }),
  getReferralHistory: () => Api.request('/coins/referral/history'),
  getLeaderboard: () => Api.request('/coins/leaderboard', { auth: false }),

  // ---- Feedback ----
  sendFeedback: (payload) => Api.request('/feedback', { method: 'POST', body: payload, auth: false }),

  // ---- Updates ----
  getUpdates: () => Api.request('/updates', { auth: false }),
  markUpdateRead: (id) => Api.request(`/updates/${id}/read`, { method: 'POST' }),
  markAllUpdatesRead: () => Api.request('/updates/read-all', { method: 'POST' }),

  // ---- Tutorials ----
  getTutorials: () => Api.request('/tutorials', { auth: false })
};

