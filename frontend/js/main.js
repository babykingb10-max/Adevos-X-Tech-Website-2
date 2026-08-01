/* =========================================================
   ADEVOS-X TECH — HOMEPAGE ENGINE
   Renders hero slider, services, "Get In Touch" cards, and the
   feedback form. Tries the live API first, falls back to the
   bundled AppConfig defaults so the page is never blank.
   ========================================================= */

const Home = {
  async init() {
    document.getElementById('preloader')?.classList.add('preloader-hide');
    await Promise.all([
      this.loadSlides(),
      this.loadServices(),
      this.loadGetInTouch(),
      this.loadTutorialsPreview()
    ]);
    this.startSliderRotation();
    this.wireFeedbackForm();
  },

  async safeFetch(apiCall, fallback) {
    try { return await apiCall(); } catch { return fallback; }
  },

  async loadSlides() {
    const slides = await this.safeFetch(() => Api.getSlides(), AppConfig.heroSlides);
    const el = document.getElementById('heroSlider');
    if (!el) return;
    el.innerHTML = slides.map((s, i) => `
      <div class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">
        <h2>${s.heading}</h2>
        <p>${s.subtext}</p>
        ${s.target
          ? `<button class="btn btn-primary" data-action-type="NAVIGATE_PAGE" data-target="${s.target}">${s.btnText}</button>`
          : `<button class="btn btn-primary" data-action-type="${s.action}">${s.btnText}</button>`
        }
      </div>
    `).join('') + `
      <div class="slider-dots">${slides.map((_, i) => `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></button>`).join('')}</div>
    `;
    el.querySelectorAll('[data-dot]').forEach(dot => {
      dot.addEventListener('click', () => Home.goToSlide(parseInt(dot.dataset.dot, 10)));
    });
  },

  currentSlide: 0,
  startSliderRotation() {
    setInterval(() => {
      const slides = document.querySelectorAll('.slide');
      if (!slides.length) return;
      this.goToSlide((this.currentSlide + 1) % slides.length);
    }, 6000);
  },
  goToSlide(index) {
    document.querySelectorAll('.slide').forEach((s, i) => s.classList.toggle('active', i === index));
    document.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === index));
    this.currentSlide = index;
  },

  async loadServices() {
    const services = await this.safeFetch(() => Api.getHomepageCards('services'), AppConfig.services);
    const el = document.getElementById('servicesGrid');
    if (!el) return;
    el.innerHTML = services.map(s => `
      <div class="app-card" style="text-align:center;align-items:center;">
        <i class="${s.icon || s.iconClass} card-icon"></i>
        <h3>${s.title}</h3>
        <p class="text-muted">${s.description}</p>
      </div>
    `).join('');
  },

  async loadGetInTouch() {
    const cards = await this.safeFetch(() => Api.getHomepageCards('get_in_touch'), AppConfig.getInTouch);
    const el = document.getElementById('getInTouchGrid');
    if (!el) return;
    el.innerHTML = cards.map((c, i) => `
      <div class="app-card" id="${c.title === 'Send Your Feedback' ? 'feedback-card' : (c.title === 'Meet a Developer' ? 'developer-card' : '')}">
        <i class="${c.icon || c.iconClass} card-icon"></i>
        <h3>${c.title}</h3>
        <p class="text-muted">${c.description}</p>
        ${c.target
          ? `<a href="${c.target}" class="btn btn-primary btn-block">${c.btnText}</a>`
          : `<button class="btn btn-primary btn-block" data-action-type="${c.action}">${c.btnText}</button>`
        }
        ${c.action === 'OPEN_TUTORIALS_DROPDOWN' ? this.tutorialsDropdownMarkup() : ''}
        ${c.action === 'OPEN_FEEDBACK_FORM' ? this.feedbackFormMarkup() : ''}
        ${c.action === 'OPEN_SUPPORT_DROPDOWN' ? this.supportDropdownMarkup() : ''}
      </div>
    `).join('');
  },

  tutorialsDropdownMarkup() {
    return `<div class="tutorials-dropdown-panel" id="homeTutorialsPanel" style="display:none;"></div>
      <style>.tutorials-dropdown-panel.open{display:flex !important;flex-direction:column;gap:6px;margin-top:8px;}</style>`;
  },
  feedbackFormMarkup() {
    return `
      <form class="feedback-dropdown-panel" id="feedbackForm" style="display:none;flex-direction:column;gap:10px;margin-top:10px;">
        <select class="form-control" name="type" required>
          <option value="">Feedback type</option>
          <option value="BUG_REPORT">Bug / Error</option>
          <option value="SUGGESTION">Feature Request</option>
          <option value="GENERAL">General Opinion</option>
        </select>
        <input class="form-control" type="email" name="email" placeholder="Your email" required>
        <textarea class="form-control" name="message" rows="3" placeholder="Your message" required></textarea>
        <button type="submit" class="btn btn-primary btn-block">Submit</button>
      </form>
      <style>.feedback-dropdown-panel.open{display:flex !important;}</style>
    `;
  },
  supportDropdownMarkup() {
    const l = AppConfig.siteSettings.supportLinks;
    return `
      <div class="support-dropdown-panel" style="display:none;flex-direction:column;gap:8px;margin-top:8px;">
        <a class="btn btn-outline btn-block" href="${l.whatsapp}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> WhatsApp Group</a>
        <a class="btn btn-outline btn-block" href="${l.telegramGroup}" target="_blank" rel="noopener"><i class="fa-brands fa-telegram"></i> Telegram Group</a>
        <a class="btn btn-outline btn-block" href="${l.channel}" target="_blank" rel="noopener"><i class="fa-solid fa-bullhorn"></i> Official Channel</a>
      </div>
      <style>.support-dropdown-panel.open{display:flex !important;}</style>
    `;
  },

  async loadTutorialsPreview() {
    const panel = document.getElementById('homeTutorialsPanel');
    if (!panel) return;
    const tutorials = await this.safeFetch(() => Api.getTutorials(), []);
    panel.innerHTML = (tutorials.slice ? tutorials.slice(0, 3) : []).map(t => `
      <a class="btn btn-outline btn-block" href="/pages/tutorials.html">${t.title}</a>
    `).join('') || `<a class="btn btn-outline btn-block" href="/pages/tutorials.html">Browse all tutorials</a>`;
  },

  wireFeedbackForm() {
    document.addEventListener('submit', async (e) => {
      if (e.target.id !== 'feedbackForm') return;
      e.preventDefault();
      if (!NetworkGuard.requireOnline()) return;
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      try {
        await Api.sendFeedback(payload);
        UI.showToast('Feedback sent. We will reply by email.', 'success');
        e.target.reset();
      } catch (err) {
        UI.showToast(err.message || 'Could not send feedback.', 'error');
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('heroSlider')) Home.init();
});

