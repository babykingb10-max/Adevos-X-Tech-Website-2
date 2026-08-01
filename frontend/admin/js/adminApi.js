/* =========================================================
   ADEVOS-X TECH ADMIN — API CLIENT
   ========================================================= */

const AdminAuth = {
  TOKEN_KEY: 'adevos_admin_token',
  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  isLoggedIn() { return !!this.getToken(); },
  requireLogin() {
    if (!this.isLoggedIn()) { window.location.href = '/admin/login.html'; return false; }
    return true;
  },
  logout() { localStorage.removeItem(this.TOKEN_KEY); window.location.href = '/admin/login.html'; }
};

const AdminApi = {
  async request(path, { method = 'GET', body = null } = {}) {
    const res = await fetch(`${API_BASE_URL}/admin${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AdminAuth.getToken()}` },
      body: body ? JSON.stringify(body) : null
    });
    if (res.status === 401 || res.status === 403) { AdminAuth.logout(); throw { message: 'Session expired.' }; }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw { message: data?.message || 'Request failed.' };
    return data;
  },

  getDashboard: () => AdminApi.request('/dashboard'),
  getLogs: () => AdminApi.request('/logs'),

  updateSiteConfig: (body) => AdminApi.request('/config', { method: 'PUT', body }),

  getSlides: () => AdminApi.request('/slides'),
  createSlide: (body) => AdminApi.request('/slides', { method: 'POST', body }),
  updateSlide: (id, body) => AdminApi.request(`/slides/${id}`, { method: 'PUT', body }),
  deleteSlide: (id) => AdminApi.request(`/slides/${id}`, { method: 'DELETE' }),

  getCards: () => AdminApi.request('/cards'),
  createCard: (body) => AdminApi.request('/cards', { method: 'POST', body }),
  updateCard: (id, body) => AdminApi.request(`/cards/${id}`, { method: 'PUT', body }),
  deleteCard: (id) => AdminApi.request(`/cards/${id}`, { method: 'DELETE' }),

  getBotTemplates: () => AdminApi.request('/bot-templates'),
  createBotTemplate: (body) => AdminApi.request('/bot-templates', { method: 'POST', body }),
  updateBotTemplate: (id, body) => AdminApi.request(`/bot-templates/${id}`, { method: 'PUT', body }),
  deleteBotTemplate: (id) => AdminApi.request(`/bot-templates/${id}`, { method: 'DELETE' }),

  getPlatforms: () => AdminApi.request('/platforms'),
  createPlatform: (body) => AdminApi.request('/platforms', { method: 'POST', body }),
  updatePlatform: (id, body) => AdminApi.request(`/platforms/${id}`, { method: 'PUT', body }),
  checkPlatformHealth: (id) => AdminApi.request(`/platforms/${id}/check-health`, { method: 'POST' }),

  getUsers: () => AdminApi.request('/users'),
  setUserPlan: (id, plan) => AdminApi.request(`/users/${id}/plan`, { method: 'PUT', body: { plan } }),
  setUserStatus: (id, status) => AdminApi.request(`/users/${id}/status`, { method: 'PUT', body: { status } }),
  adjustUserCoins: (id, amount, note) => AdminApi.request(`/users/${id}/coins`, { method: 'POST', body: { amount, note } }),
  suspendAffiliate: (id) => AdminApi.request(`/users/${id}/suspend-affiliate`, { method: 'POST' }),

  getAllBots: () => AdminApi.request('/bots'),
  killBot: (id) => AdminApi.request(`/bots/${id}`, { method: 'DELETE' }),

  getFeedback: () => AdminApi.request('/feedback'),
  replyFeedback: (id, replyText) => AdminApi.request(`/feedback/${id}/reply`, { method: 'POST', body: { replyText } }),

  createUpdate: (body) => AdminApi.request('/updates', { method: 'POST', body }),
  updateUpdate: (id, body) => AdminApi.request(`/updates/${id}`, { method: 'PUT', body }),
  deleteUpdate: (id) => AdminApi.request(`/updates/${id}`, { method: 'DELETE' }),
  triggerPopup: (id) => AdminApi.request(`/updates/${id}/trigger-popup`, { method: 'POST' }),

  createTutorial: (body) => AdminApi.request('/tutorials', { method: 'POST', body }),
  updateTutorial: (id, body) => AdminApi.request(`/tutorials/${id}`, { method: 'PUT', body }),
  deleteTutorial: (id) => AdminApi.request(`/tutorials/${id}`, { method: 'DELETE' })
};

