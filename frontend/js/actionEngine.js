/* =========================================================
   ADEVOS-X TECH — ACTION ENGINE
   One delegated click listener drives every button rendered
   from config/API data. Add a new card with a new actionType
   and it works without touching this file, as long as the
   actionType already has a case below.
   ========================================================= */

const ActionEngine = {
  handle(actionType, target, el) {
    switch (actionType) {
      case 'DEPLOY_BOT':
        if (!Auth.requireLogin()) return;
        window.location.href = '/pages/available-bots.html';
        break;

      case 'CREATE_DEPLOYER':
      case 'DEPLOYER_UPGRADE':
        if (!Auth.requireLogin()) return;
        if (Auth.isDeployer()) {
          UI.showModal('Deployer Account', 'You already have an active Deployer plan.');
        } else {
          window.location.href = '/pages/payment.html?plan=deployer';
        }
        break;

      case 'MANAGE_BOT':
        if (!Auth.requireLogin()) return;
        window.location.href = '/pages/manage.html';
        break;

      case 'OPEN_TUTORIALS_DROPDOWN':
        ActionEngine.toggleDropdown(el, 'tutorials-dropdown-panel');
        break;

      case 'OPEN_FEEDBACK_FORM':
        document.getElementById('feedback-card')?.scrollIntoView({ behavior: 'smooth' });
        ActionEngine.toggleDropdown(el, 'feedback-dropdown-panel');
        break;

      case 'OPEN_SUPPORT_DROPDOWN':
        ActionEngine.toggleDropdown(el, 'support-dropdown-panel');
        break;

      case 'CONTACT_DEVELOPER': {
        const link = AppConfig.siteSettings.supportLinks.whatsapp;
        window.open(link, '_blank');
        break;
      }

      case 'NAVIGATE_PAGE':
        window.location.href = target;
        break;

      case 'EXTERNAL_LINK':
        window.open(target, '_blank', 'noopener');
        break;

      default:
        console.warn('Unhandled actionType:', actionType);
    }
  },

  toggleDropdown(triggerEl, panelId) {
    const card = triggerEl.closest('.app-card');
    const panel = card?.querySelector(`.${panelId}`);
    panel?.classList.toggle('open');
  }
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action-type]');
  if (!el) return;
  const actionType = el.getAttribute('data-action-type');
  const target = el.getAttribute('data-target');
  ActionEngine.handle(actionType, target, el);
});

