/* =========================================================
   ADEVOS-X TECH — UI SHELL
   Renders the header, hamburger sidebar, footer, modal root,
   and toast root into the placeholders every page includes:
   <div id="app-header"></div>, <div id="app-sidebar"></div>,
   <div id="app-footer"></div>, <div id="app-overlay"></div>.
   ========================================================= */

const UI = {

  init() {
    this.renderHeader();
    this.renderSidebar();
    this.renderFooter();
    this.renderFloatingWidgets();
    this.wireGlobalEvents();
  },

  renderHeader() {
    const el = document.getElementById('app-header');
    if (!el) return;
    const user = Auth.getUser();
    el.innerHTML = `
      <header class="top-header">
        <button class="icon-btn" id="hamburgerBtn" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>
        <a href="/index.html" class="brand-title">${AppConfig.siteSettings.siteName}</a>
        ${user
          ? `<button class="icon-btn avatar-btn" id="avatarBtn" aria-label="Account menu">
               <img src="${user.profilePic || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + user.email}" alt="${user.name}">
             </button>`
          : `<a href="/pages/signin.html" class="btn btn-outline btn-sm">Sign In</a>`
        }
      </header>
      ${user ? `
      <div class="cyber-modal-overlay" id="profileMenu">
        <div class="cyber-modal-card" style="max-width:300px;">
          <div class="cyber-modal-header"><h3><i class="fa-solid fa-user"></i> ${user.name}</h3>
            <button class="modal-close-btn" onclick="UI.closeProfileMenu()">&times;</button></div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <a href="/pages/account.html" class="btn btn-outline btn-block">Dashboard</a>
            <a href="/pages/account.html#settings" class="btn btn-outline btn-block">Settings</a>
            ${!Auth.isDeployer() ? `<a href="/pages/payment.html?plan=deployer" class="btn btn-outline btn-block">Upgrade to Deployer</a>` : ''}
            <button class="btn btn-danger btn-block" onclick="Auth.logout()">Logout</button>
          </div>
        </div>
      </div>` : ''}
    `;
  },

  renderSidebar() {
    const el = document.getElementById('app-sidebar');
    if (!el) return;
    const links = AppConfig.siteSettings.supportLinks;
    const items = AppConfig.sidebar.map(item => `
      <li>
        <div class="sidebar-item" data-toggle-submenu="${item.id}">
          <i class="fa-solid ${item.icon}"></i><span>${item.title}</span>
        </div>
        <div class="sidebar-submenu" id="submenu-${item.id}">
          ${item.subItems.map(sub => {
            const href = sub.external ? links[sub.target] : sub.target;
            const target = sub.external ? 'target="_blank" rel="noopener"' : '';
            return `<a href="${href}" ${target}>${sub.title}</a>`;
          }).join('')}
        </div>
      </li>
    `).join('');

    el.innerHTML = `
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="flex-between">
          <h3>Navigation</h3>
          <button class="icon-btn" id="closeSidebarBtn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <input type="text" class="sidebar-search" id="sidebarSearch" placeholder="Search menu...">
        <ul class="sidebar-nav">${items}</ul>
      </aside>
    `;
  },

  renderFooter() {
    const el = document.getElementById('app-footer');
    if (!el) return;
    const links = AppConfig.siteSettings.supportLinks;
    el.innerHTML = `
      <footer class="site-footer">
        <div class="footer-social">
          <a href="${links.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
          <a href="${links.telegramGroup}" target="_blank" rel="noopener" aria-label="Telegram"><i class="fa-brands fa-telegram"></i></a>
          <a href="${links.channel}" target="_blank" rel="noopener" aria-label="Channel"><i class="fa-solid fa-bullhorn"></i></a>
        </div>
        <div class="footer-grid">
          <div class="footer-col">
            <h4>Services</h4>
            <a href="#services">Web Development</a>
            <a href="#services">WhatsApp Bots</a>
            <a href="#services">Bot Deployment</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="/pages/updates.html">Updates</a>
            <a href="/pages/tutorials.html">Tutorials</a>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <a href="/pages/privacy.html">Privacy Policy</a>
            <a href="/pages/terms.html">Terms of Use</a>
          </div>
        </div>
        <div class="footer-bottom">&copy; ${new Date().getFullYear()} Adevos-X Tech. All rights reserved.</div>
      </footer>
    `;
  },

  renderFloatingWidgets() {
    const el = document.getElementById('app-overlay');
    if (!el) return;
    el.innerHTML += `
      <button class="floating-assistant" id="assistantBtn" aria-label="Adevos AI Assistant"><i class="fa-solid fa-robot"></i></button>
      <button class="scroll-top-btn" id="scrollTopBtn" aria-label="Scroll to top"><i class="fa-solid fa-arrow-up"></i></button>
      <div class="cyber-modal-overlay" id="cyberModal">
        <div class="cyber-modal-card">
          <div class="cyber-modal-header">
            <h3 id="modalTitle"><i class="fa-solid fa-circle-info"></i> <span id="modalTitleText">Notice</span></h3>
            <button class="modal-close-btn" onclick="UI.closeModal()">&times;</button>
          </div>
          <div class="cyber-modal-body"><p id="modalMessage"></p></div>
          <div class="cyber-modal-footer">
            <button class="btn btn-outline btn-block" id="modalCancelBtn" style="display:none;">Cancel</button>
            <button class="btn btn-primary btn-block" id="modalConfirmBtn">OK</button>
          </div>
        </div>
      </div>
      <div class="toast-stack" id="toastStack"></div>
      <div class="offline-banner" id="offlineBanner"></div>
    `;
  },

  // ---------- Modal helpers (replaces native alert/confirm) ----------
  showModal(title, message, { confirmText = 'OK', cancelText = null, onConfirm = null } = {}) {
    document.getElementById('modalTitleText').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => { UI.closeModal(); if (onConfirm) onConfirm(); };
    if (cancelText) {
      cancelBtn.style.display = 'inline-flex';
      cancelBtn.textContent = cancelText;
      cancelBtn.onclick = () => UI.closeModal();
    } else {
      cancelBtn.style.display = 'none';
    }
    document.getElementById('cyberModal').classList.add('active');
  },

  closeModal() {
    document.getElementById('cyberModal').classList.remove('active');
  },

  closeProfileMenu() {
    document.getElementById('profileMenu')?.classList.remove('active');
  },

  showToast(message, type = 'success', duration = 5000) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<p>${message}</p><div class="toast-progress" style="animation-duration:${duration}ms"></div>`;
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },

  // ---------- Wiring ----------
  wireGlobalEvents() {
    document.getElementById('hamburgerBtn')?.addEventListener('click', () => UI.openSidebar());
    document.getElementById('closeSidebarBtn')?.addEventListener('click', () => UI.closeSidebar());
    document.getElementById('sidebarOverlay')?.addEventListener('click', () => UI.closeSidebar());
    document.getElementById('avatarBtn')?.addEventListener('click', () => document.getElementById('profileMenu').classList.add('active'));

    document.querySelectorAll('[data-toggle-submenu]').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-toggle-submenu');
        document.getElementById(`submenu-${id}`).classList.toggle('open');
      });
    });

    document.getElementById('sidebarSearch')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.sidebar-nav > li').forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    window.addEventListener('scroll', () => {
      const btn = document.getElementById('scrollTopBtn');
      if (!btn) return;
      btn.classList.toggle('visible', window.scrollY > 400);
    });
    document.getElementById('scrollTopBtn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    document.getElementById('assistantBtn')?.addEventListener('click', () => {
      UI.showModal('Adevos AI Assistant', 'The support assistant is starting up. Ask about deployment, payments, or your account.');
    });
  },

  openSidebar() {
    document.getElementById('sidebar').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
  },
  closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => UI.init());

