/* =========================================================
   ADEVOS-X TECH ADMIN — DASHBOARD LOGIC
   ========================================================= */

const Admin = {
  async init() {
    if (!AdminAuth.requireLogin()) return;
    document.querySelectorAll('#adminNav button').forEach(btn => {
      btn.addEventListener('click', () => Admin.showPanel(btn.dataset.panel));
    });
    document.getElementById('logoutBtn').addEventListener('click', AdminAuth.logout);
    document.getElementById('adminBackBtn')?.addEventListener('click', () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/';
    });
    const adminBackBtn = document.getElementById('adminBackBtn');
    const cameFromInternalPage = document.referrer && document.referrer.startsWith(window.location.origin);
    if (adminBackBtn && !cameFromInternalPage) adminBackBtn.style.display = 'none';
    Admin.showPanel('overview');
  },

  showPanel(name) {
    document.querySelectorAll('#adminNav button').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    const renderers = {
      overview: Admin.renderOverview, slides: Admin.renderSlides, cards: Admin.renderCards,
      bots: Admin.renderBotTemplates, platforms: Admin.renderPlatforms, payments: Admin.renderPayments,
      users: Admin.renderUsers, 'active-bots': Admin.renderActiveBots, feedback: Admin.renderFeedback,
      updates: Admin.renderUpdates, tutorials: Admin.renderTutorials, logs: Admin.renderLogs
    };
    (renderers[name] || Admin.renderOverview)();
  },

  content() { return document.getElementById('adminContent'); },

  async safe(fn, fallbackMsg) {
    try { return await fn(); } catch (err) { UI.showToast(err.message || fallbackMsg, 'error'); throw err; }
  },

  // ---------- Overview ----------
  async renderOverview() {
    const el = Admin.content();
    el.innerHTML = `<h2>System Overview</h2><div class="stats-row" id="statsRow"><p class="text-muted">Loading...</p></div>`;
    try {
      const stats = await AdminApi.getDashboard();
      document.getElementById('statsRow').innerHTML = `
        <div class="stat-box"><div class="value">${stats.totalUsers}</div><div class="label">Total Users</div></div>
        <div class="stat-box"><div class="value">${stats.activeBots}</div><div class="label">Active Bots</div></div>
        <div class="stat-box"><div class="value">${stats.coinsIssued}</div><div class="label">AV Coins Issued</div></div>
      `;
    } catch (err) { document.getElementById('statsRow').innerHTML = `<p class="text-muted">${err.message}</p>`; }
  },

  // ---------- Slides ----------
  async renderSlides() {
    const el = Admin.content();
    el.innerHTML = `
      <div class="panel-header"><h2>Hero Slides</h2></div>
      <form class="app-card inline-form" id="slideForm">
        <input class="form-control" name="heading" placeholder="Heading" required>
        <input class="form-control" name="subtext" placeholder="Subtext">
        <input class="form-control" name="btnText" placeholder="Button text" value="Learn More">
        <input class="form-control" name="target" placeholder="Target URL (or leave blank)">
        <button class="btn btn-primary" type="submit">Add Slide</button>
      </form>
      <table class="admin-table"><thead><tr><th>Heading</th><th>Button</th><th>Active</th><th></th></tr></thead>
      <tbody id="slidesBody"><tr><td colspan="4">Loading...</td></tr></tbody></table>
    `;
    document.getElementById('slideForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(e.target).entries());
      await Admin.safe(() => AdminApi.createSlide(payload), 'Could not add slide.');
      e.target.reset();
      Admin.loadSlidesTable();
    });
    Admin.loadSlidesTable();
  },
  async loadSlidesTable() {
    const body = document.getElementById('slidesBody');
    try {
      const slides = await AdminApi.getSlides();
      body.innerHTML = slides.map(s => `
        <tr>
          <td>${s.heading}</td><td>${s.btnText}</td>
          <td>${s.active ? '<span class="badge">Active</span>' : '<span class="text-muted">Hidden</span>'}</td>
          <td class="inline-actions">
            <button class="btn btn-outline btn-sm" onclick="Admin.toggleSlide('${s._id}', ${!s.active})">${s.active ? 'Hide' : 'Show'}</button>
            <button class="btn btn-danger btn-sm" onclick="Admin.deleteSlide('${s._id}')">Delete</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="4" class="text-muted">No slides yet.</td></tr>`;
    } catch (err) { body.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`; }
  },
  async toggleSlide(id, active) { await Admin.safe(() => AdminApi.updateSlide(id, { active }), 'Could not update slide.'); Admin.loadSlidesTable(); },
  async deleteSlide(id) { await Admin.safe(() => AdminApi.deleteSlide(id), 'Could not delete slide.'); Admin.loadSlidesTable(); },

  // ---------- Homepage Cards ----------
  async renderCards() {
    const el = Admin.content();
    el.innerHTML = `
      <div class="panel-header"><h2>Homepage Cards</h2></div>
      <form class="app-card inline-form" id="cardForm">
        <select class="form-control" name="section" required>
          <option value="services">Our Services</option>
          <option value="get_in_touch">Get In Touch</option>
        </select>
        <input class="form-control" name="title" placeholder="Title" required>
        <input class="form-control" name="iconClass" placeholder="fa-solid fa-gear" required>
        <input class="form-control" name="description" placeholder="Description" required>
        <input class="form-control" name="btnText" placeholder="Button text (Get In Touch only)">
        <input class="form-control" name="target" placeholder="Target URL (optional)">
        <button class="btn btn-primary" type="submit">Add Card</button>
      </form>
      <table class="admin-table"><thead><tr><th>Section</th><th>Title</th><th>Active</th><th></th></tr></thead>
      <tbody id="cardsBody"><tr><td colspan="4">Loading...</td></tr></tbody></table>
    `;
    document.getElementById('cardForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(e.target).entries());
      await Admin.safe(() => AdminApi.createCard(payload), 'Could not add card.');
      e.target.reset();
      Admin.loadCardsTable();
    });
    Admin.loadCardsTable();
  },
  async loadCardsTable() {
    const body = document.getElementById('cardsBody');
    try {
      const cards = await AdminApi.getCards();
      body.innerHTML = cards.map(c => `
        <tr>
          <td>${c.section === 'services' ? 'Services' : 'Get In Touch'}</td><td>${c.title}</td>
          <td>${c.active ? '<span class="badge">Active</span>' : '<span class="text-muted">Hidden</span>'}</td>
          <td class="inline-actions">
            <button class="btn btn-outline btn-sm" onclick="Admin.toggleCard('${c._id}', ${!c.active})">${c.active ? 'Hide' : 'Show'}</button>
            <button class="btn btn-danger btn-sm" onclick="Admin.deleteCard('${c._id}')">Delete</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="4" class="text-muted">No cards yet.</td></tr>`;
    } catch (err) { body.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`; }
  },
  async toggleCard(id, active) { await Admin.safe(() => AdminApi.updateCard(id, { active }), 'Could not update card.'); Admin.loadCardsTable(); },
  async deleteCard(id) { await Admin.safe(() => AdminApi.deleteCard(id), 'Could not delete card.'); Admin.loadCardsTable(); },

  // ---------- Bot Templates ----------
  async renderBotTemplates() {
    const el = Admin.content();
    el.innerHTML = `
      <div class="panel-header"><h2>Bot Library</h2></div>
      <form class="app-card inline-form" id="botForm">
        <input class="form-control" name="name" placeholder="Bot name" required>
        <input class="form-control" name="imageUrl" placeholder="Image URL" required>
        <input class="form-control" name="sourceCodeUrl" placeholder="GitHub source URL" required>
        <input class="form-control" name="description" placeholder="Description" required>
        <select class="form-control" name="allocation">
          <option value="BOTH">User + Deployer</option>
          <option value="USER">User Plan Only</option>
          <option value="DEPLOYER">Deployer Plan Only</option>
        </select>
        <button class="btn btn-primary" type="submit">Add Bot</button>
      </form>
      <table class="admin-table"><thead><tr><th>Name</th><th>Allocation</th><th>Active</th><th></th></tr></thead>
      <tbody id="botsBody"><tr><td colspan="4">Loading...</td></tr></tbody></table>
    `;
    document.getElementById('botForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(e.target).entries());
      await Admin.safe(() => AdminApi.createBotTemplate(payload), 'Could not add bot.');
      e.target.reset();
      Admin.loadBotsTable();
    });
    Admin.loadBotsTable();
  },
  async loadBotsTable() {
    const body = document.getElementById('botsBody');
    try {
      const bots = await AdminApi.getBotTemplates();
      body.innerHTML = bots.map(b => `
        <tr>
          <td>${b.name}</td><td>${b.allocation}</td>
          <td>${b.isActive ? '<span class="badge">Active</span>' : '<span class="text-muted">Hidden</span>'}</td>
          <td class="inline-actions">
            <button class="btn btn-outline btn-sm" onclick="Admin.toggleBot('${b._id}', ${!b.isActive})">${b.isActive ? 'Hide' : 'Show'}</button>
            <button class="btn btn-danger btn-sm" onclick="Admin.deleteBot('${b._id}')">Delete</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="4" class="text-muted">No bots yet.</td></tr>`;
    } catch (err) { body.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`; }
  },
  async toggleBot(id, isActive) { await Admin.safe(() => AdminApi.updateBotTemplate(id, { isActive }), 'Could not update bot.'); Admin.loadBotsTable(); },
  async deleteBot(id) { await Admin.safe(() => AdminApi.deleteBotTemplate(id), 'Could not delete bot.'); Admin.loadBotsTable(); },

  // ---------- Platforms ----------
  async renderPlatforms() {
    const el = Admin.content();
    el.innerHTML = `
      <div class="panel-header"><h2>Deployment Platforms</h2></div>
      <form class="app-card inline-form" id="platformForm">
        <input class="form-control" name="name" placeholder="Display name (e.g. Railway)" required>
        <input class="form-control" name="slug" placeholder="slug (e.g. railway)" required>
        <button class="btn btn-primary" type="submit">Add Platform</button>
      </form>
      <table class="admin-table"><thead><tr><th>Name</th><th>Status</th><th>Enabled</th><th></th></tr></thead>
      <tbody id="platformsBody"><tr><td colspan="4">Loading...</td></tr></tbody></table>
    `;
    document.getElementById('platformForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(e.target).entries());
      await Admin.safe(() => AdminApi.createPlatform(payload), 'Could not add platform.');
      e.target.reset();
      Admin.loadPlatformsTable();
    });
    Admin.loadPlatformsTable();
  },
  async loadPlatformsTable() {
    const body = document.getElementById('platformsBody');
    try {
      const platforms = await AdminApi.getPlatforms();
      body.innerHTML = platforms.map(p => `
        <tr>
          <td>${p.name}${p.recommended ? ' <span class="badge">Recommended</span>' : ''}</td>
          <td>${p.lastHealthStatus}</td>
          <td>${p.isEnabled ? '<span class="badge">Enabled</span>' : '<span class="text-muted">Disabled</span>'}</td>
          <td class="inline-actions">
            <button class="btn btn-outline btn-sm" onclick="Admin.checkHealth('${p._id}')">Check Health</button>
            <button class="btn btn-outline btn-sm" onclick="Admin.togglePlatform('${p._id}', ${!p.isEnabled})">${p.isEnabled ? 'Disable' : 'Enable'}</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="4" class="text-muted">No platforms yet.</td></tr>`;
    } catch (err) { body.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`; }
  },
  async checkHealth(id) { await Admin.safe(() => AdminApi.checkPlatformHealth(id), 'Health check failed.'); Admin.loadPlatformsTable(); },
  async togglePlatform(id, isEnabled) { await Admin.safe(() => AdminApi.updatePlatform(id, { isEnabled }), 'Could not update platform.'); Admin.loadPlatformsTable(); },

  // ---------- Payments & Coins (Site Config) ----------
  async renderPayments() {
    const el = Admin.content();
    el.innerHTML = `<h2>Payments & AV Coins</h2><div id="paymentsFormWrap"><p class="text-muted">Loading...</p></div>`;
    try {
      const res = await fetch(`${API_BASE_URL}/config`);
      const config = await res.json();
      document.getElementById('paymentsFormWrap').innerHTML = `
        <form class="app-card" id="paymentsForm">
          <h3>Payment Methods</h3>
          <div class="toggle-group flex-between"><span>Manual Mobile Money</span><input type="checkbox" name="paymentSettings.manualEnabled" ${config.paymentSettings.manualEnabled ? 'checked' : ''}></div>
          <div class="toggle-group flex-between"><span>Paystack (Card)</span><input type="checkbox" name="paymentSettings.paystackEnabled" ${config.paymentSettings.paystackEnabled ? 'checked' : ''}></div>
          <div class="toggle-group flex-between"><span>Pay With AV Coins</span><input type="checkbox" name="paymentSettings.coinsEnabled" ${config.paymentSettings.coinsEnabled ? 'checked' : ''}></div>
          <div class="form-group"><label class="form-label">Manual Payment Instructions</label>
            <textarea class="form-control" name="paymentSettings.manualInstructions" rows="2">${config.paymentSettings.manualInstructions}</textarea></div>

          <h3 style="margin-top:16px;">Free Bot Feature</h3>
          <div class="toggle-group flex-between"><span>Enable "Get a Free Bot"</span><input type="checkbox" name="freeBotFeature.enabled" ${config.freeBotFeature.enabled ? 'checked' : ''}></div>
          <div class="form-group"><label class="form-label">Adevos Min-Bot URL</label>
            <input class="form-control" name="freeBotFeature.minBotUrl" value="${config.freeBotFeature.minBotUrl}"></div>

          <h3 style="margin-top:16px;">AV Coins Economy</h3>
          <div class="form-group"><label class="form-label">Coin to TZS Rate (1 coin = ? TZS)</label>
            <input class="form-control" type="number" name="coinSettings.coinToTzsRate" value="${config.coinSettings.coinToTzsRate}"></div>
          <div class="form-group"><label class="form-label">Referral Reward (coins)</label>
            <input class="form-control" type="number" name="coinSettings.referralRewardAmount" value="${config.coinSettings.referralRewardAmount}"></div>
          <div class="toggle-group flex-between"><span>Welcome Bonus Enabled</span><input type="checkbox" name="coinSettings.welcomeBonusEnabled" ${config.coinSettings.welcomeBonusEnabled ? 'checked' : ''}></div>
          <div class="form-group"><label class="form-label">Welcome Bonus Amount (coins)</label>
            <input class="form-control" type="number" name="coinSettings.welcomeBonusAmount" value="${config.coinSettings.welcomeBonusAmount}"></div>

          <button class="btn btn-primary btn-block" type="submit" style="margin-top:16px;">Save Global Config</button>
        </form>
      `;
      document.getElementById('paymentsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = { paymentSettings: {}, freeBotFeature: {}, coinSettings: {} };
        for (const [key, value] of formData.entries()) {
          const [group, field] = key.split('.');
          const el = e.target.querySelector(`[name="${key}"]`);
          payload[group][field] = el.type === 'checkbox' ? el.checked : (el.type === 'number' ? Number(value) : value);
        }
        // capture unchecked checkboxes (FormData skips them)
        e.target.querySelectorAll('input[type=checkbox]').forEach(cb => {
          const [group, field] = cb.name.split('.');
          payload[group][field] = cb.checked;
        });
        await Admin.safe(() => AdminApi.updateSiteConfig(payload), 'Could not save configuration.');
        UI.showToast('Configuration saved. Public site updated instantly.', 'success');
      });
    } catch (err) { document.getElementById('paymentsFormWrap').innerHTML = `<p class="text-muted">${err.message}</p>`; }
  },

  // ---------- Users ----------
  async renderUsers() {
    const el = Admin.content();
    el.innerHTML = `<h2>User Accounts</h2><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Coins</th><th></th></tr></thead><tbody id="usersBody"><tr><td colspan="6">Loading...</td></tr></tbody></table>`;
    try {
      const users = await AdminApi.getUsers();
      document.getElementById('usersBody').innerHTML = users.map(u => `
        <tr>
          <td>${u.name}</td><td>${u.email}</td>
          <td>${u.subscription?.plan || 'USER'}</td>
          <td>${u.status}</td>
          <td>${u.coinsBalance}</td>
          <td class="inline-actions">
            <button class="btn btn-outline btn-sm" onclick="Admin.togglePlan('${u._id}','${u.subscription?.plan === 'DEPLOYER' ? 'USER' : 'DEPLOYER'}')">${u.subscription?.plan === 'DEPLOYER' ? 'Downgrade' : 'Upgrade'}</button>
            <button class="btn btn-outline btn-sm" onclick="Admin.toggleBan('${u._id}','${u.status === 'BANNED' ? 'ACTIVE' : 'BANNED'}')">${u.status === 'BANNED' ? 'Unban' : 'Ban'}</button>
            <button class="btn btn-outline btn-sm" onclick="Admin.promptCoins('${u._id}')">Adjust Coins</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="6" class="text-muted">No users yet.</td></tr>`;
    } catch (err) { document.getElementById('usersBody').innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`; }
  },
  async togglePlan(id, plan) { await Admin.safe(() => AdminApi.setUserPlan(id, plan), 'Could not change plan.'); Admin.renderUsers(); },
  async toggleBan(id, status) { await Admin.safe(() => AdminApi.setUserStatus(id, status), 'Could not update status.'); Admin.renderUsers(); },
  promptCoins(id) {
    UI.showModal('Adjust Coins', '');
    document.getElementById('modalMessage').innerHTML = `
      <input class="form-control" id="coinAmountInput" type="number" placeholder="Amount (negative to deduct)" style="margin-bottom:8px;">
      <input class="form-control" id="coinNoteInput" placeholder="Note (optional)">
    `;
    document.getElementById('modalConfirmBtn').onclick = async () => {
      const amount = Number(document.getElementById('coinAmountInput').value);
      const note = document.getElementById('coinNoteInput').value;
      UI.closeModal();
      await Admin.safe(() => AdminApi.adjustUserCoins(id, amount, note), 'Could not adjust coins.');
      Admin.renderUsers();
    };
  },

  // ---------- Active Bots ----------
  async renderActiveBots() {
    const el = Admin.content();
    el.innerHTML = `<h2>Active Bot Monitor</h2><table class="admin-table"><thead><tr><th>Bot</th><th>Owner</th><th>Platform</th><th>Status</th><th></th></tr></thead><tbody id="activeBotsBody"><tr><td colspan="5">Loading...</td></tr></tbody></table>`;
    try {
      const bots = await AdminApi.getAllBots();
      document.getElementById('activeBotsBody').innerHTML = bots.map(b => `
        <tr>
          <td>${b.botName}</td><td>${b.userId?.email || 'Unknown'}</td><td>${b.hostingPlatform}</td>
          <td><span class="status-dot ${b.status === 'ACTIVE' ? 'active' : 'stopped'}"></span>${b.status}</td>
          <td><button class="btn btn-danger btn-sm" onclick="Admin.killBot('${b._id}')">Kill</button></td>
        </tr>`).join('') || `<tr><td colspan="5" class="text-muted">No bots deployed yet.</td></tr>`;
    } catch (err) { document.getElementById('activeBotsBody').innerHTML = `<tr><td colspan="5">${err.message}</td></tr>`; }
  },
  killBot(id) {
    UI.showModal('Kill Bot Deployment?', 'This removes the container from its host and deletes the deployment record.', {
      confirmText: 'Kill It', cancelText: 'Cancel',
      onConfirm: async () => { await Admin.safe(() => AdminApi.killBot(id), 'Could not kill bot.'); Admin.renderActiveBots(); }
    });
  },

  // ---------- Feedback ----------
  async renderFeedback() {
    const el = Admin.content();
    el.innerHTML = `<h2>Feedback & Tickets</h2><div id="feedbackList"><p class="text-muted">Loading...</p></div>`;
    try {
      const items = await AdminApi.getFeedback();
      document.getElementById('feedbackList').innerHTML = items.map(f => `
        <div class="app-card" style="margin-bottom:10px;">
          <div class="flex-between"><strong>${f.userEmail}</strong><span class="badge">${f.status}</span></div>
          <p class="text-muted">${f.type.replace('_',' ')} — ${new Date(f.createdAt).toLocaleString()}</p>
          <p>${f.message}</p>
          ${f.systemContext ? `<p class="text-muted"><em>${f.systemContext}</em></p>` : ''}
          ${f.adminReply ? `<p style="color:var(--neon-green);">Reply sent: ${f.adminReply}</p>` : `
          <div class="form-group"><textarea class="form-control" id="reply-${f._id}" rows="2" placeholder="Write a reply..."></textarea></div>
          <button class="btn btn-primary btn-sm" onclick="Admin.reply('${f._id}')">Send Reply</button>`}
        </div>`).join('') || `<p class="text-muted">No feedback yet.</p>`;
    } catch (err) { document.getElementById('feedbackList').innerHTML = `<p class="text-muted">${err.message}</p>`; }
  },
  async reply(id) {
    const replyText = document.getElementById(`reply-${id}`).value.trim();
    if (!replyText) { UI.showToast('Write a reply first.', 'warning'); return; }
    await Admin.safe(() => AdminApi.replyFeedback(id, replyText), 'Could not send reply.');
    UI.showToast('Reply emailed to user.', 'success');
    Admin.renderFeedback();
  },

  // ---------- Updates ----------
  async renderUpdates() {
    const el = Admin.content();
    el.innerHTML = `
      <div class="panel-header"><h2>Updates Manager</h2></div>
      <form class="app-card" id="updateForm">
        <div class="form-group"><label class="form-label">Title</label><input class="form-control" name="title" required></div>
        <div class="form-group"><label class="form-label">Short Summary</label><input class="form-control" name="summary" required></div>
        <div class="form-group"><label class="form-label">Full Content</label><textarea class="form-control" name="fullContent" rows="3" required></textarea></div>
        <div class="form-group"><label class="form-label">Category</label>
          <select class="form-control" name="category">
            <option value="NEW_FEATURE">New Feature</option>
            <option value="SYSTEM_MAINTENANCE">System Maintenance</option>
            <option value="OFFER_BONUS">Offer / Bonus</option>
            <option value="IMPORTANT_NOTICE">Important Notice</option>
          </select>
        </div>
        <div class="toggle-group flex-between"><span>Enable Instant Pop-up</span><input type="checkbox" name="allowPopup" checked></div>
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:10px;">Publish Update</button>
      </form>
      <table class="admin-table"><thead><tr><th>Title</th><th>Category</th><th>Popup</th><th></th></tr></thead>
      <tbody id="updatesBody"><tr><td colspan="4">Loading...</td></tr></tbody></table>
    `;
    document.getElementById('updateForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      payload.allowPopup = e.target.querySelector('[name=allowPopup]').checked;
      payload.isPublished = true;
      await Admin.safe(() => AdminApi.createUpdate(payload), 'Could not publish update.');
      e.target.reset();
      Admin.loadUpdatesTable();
    });
    Admin.loadUpdatesTable();
  },
  async loadUpdatesTable() {
    const res = await fetch(`${API_BASE_URL}/updates`);
    const updates = await res.json();
    document.getElementById('updatesBody').innerHTML = updates.map(u => `
      <tr>
        <td>${u.title}</td><td>${u.category.replace('_',' ')}</td>
        <td>${u.allowPopup ? 'Enabled' : 'Disabled'}</td>
        <td class="inline-actions">
          <button class="btn btn-outline btn-sm" onclick="Admin.triggerPopup('${u._id}')">Trigger Popup</button>
          <button class="btn btn-outline btn-sm" onclick="Admin.togglePopup('${u._id}', ${!u.allowPopup})">${u.allowPopup ? 'Disable Popup' : 'Enable Popup'}</button>
          <button class="btn btn-danger btn-sm" onclick="Admin.deleteUpdate('${u._id}')">Delete</button>
        </td>
      </tr>`).join('') || `<tr><td colspan="4" class="text-muted">No updates yet.</td></tr>`;
  },
  async triggerPopup(id) { await Admin.safe(() => AdminApi.triggerPopup(id), 'Could not trigger popup.'); UI.showToast('Popup broadcast to online users.', 'success'); },
  async togglePopup(id, allowPopup) { await Admin.safe(() => AdminApi.updateUpdate(id, { allowPopup }), 'Could not update.'); Admin.loadUpdatesTable(); },
  async deleteUpdate(id) { await Admin.safe(() => AdminApi.deleteUpdate(id), 'Could not delete.'); Admin.loadUpdatesTable(); },

  // ---------- Tutorials ----------
  async renderTutorials() {
    const el = Admin.content();
    el.innerHTML = `
      <div class="panel-header"><h2>Tutorials Manager</h2></div>
      <form class="app-card inline-form" id="tutorialForm">
        <input class="form-control" name="title" placeholder="Title" required>
        <select class="form-control" name="category">
          <option>Deployment</option><option>AV Coins</option><option>Account Settings</option><option>Troubleshooting</option>
        </select>
        <input class="form-control" name="videoUrl" placeholder="YouTube/Vimeo embed URL" required>
        <input class="form-control" name="thumbnail" placeholder="Thumbnail URL" required>
        <input class="form-control" name="duration" placeholder="e.g. 3:45">
        <button class="btn btn-primary" type="submit">Add Tutorial</button>
      </form>
      <table class="admin-table"><thead><tr><th>Title</th><th>Category</th><th></th></tr></thead>
      <tbody id="tutorialsBody"><tr><td colspan="3">Loading...</td></tr></tbody></table>
    `;
    document.getElementById('tutorialForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(e.target).entries());
      payload.isPublished = true;
      await Admin.safe(() => AdminApi.createTutorial(payload), 'Could not add tutorial.');
      e.target.reset();
      Admin.loadTutorialsTable();
    });
    Admin.loadTutorialsTable();
  },
  async loadTutorialsTable() {
    const res = await fetch(`${API_BASE_URL}/tutorials`);
    const tutorials = await res.json();
    document.getElementById('tutorialsBody').innerHTML = tutorials.map(t => `
      <tr><td>${t.title}</td><td>${t.category}</td>
      <td><button class="btn btn-danger btn-sm" onclick="Admin.deleteTutorial('${t._id}')">Delete</button></td></tr>
    `).join('') || `<tr><td colspan="3" class="text-muted">No tutorials yet.</td></tr>`;
  },
  async deleteTutorial(id) { await Admin.safe(() => AdminApi.deleteTutorial(id), 'Could not delete.'); Admin.loadTutorialsTable(); },

  // ---------- Audit Log ----------
  async renderLogs() {
    const el = Admin.content();
    el.innerHTML = `<h2>Admin Action Log</h2><table class="admin-table"><thead><tr><th>Admin</th><th>Action</th><th>When</th></tr></thead><tbody id="logsBody"><tr><td colspan="3">Loading...</td></tr></tbody></table>`;
    try {
      const logs = await AdminApi.getLogs();
      document.getElementById('logsBody').innerHTML = logs.map(l => `
        <tr><td>${l.adminId?.name || 'Admin'}</td><td>${l.action}</td><td>${new Date(l.createdAt).toLocaleString()}</td></tr>
      `).join('') || `<tr><td colspan="3" class="text-muted">No actions logged yet.</td></tr>`;
    } catch (err) { document.getElementById('logsBody').innerHTML = `<tr><td colspan="3">${err.message}</td></tr>`; }
  }
};

document.addEventListener('DOMContentLoaded', () => Admin.init());
