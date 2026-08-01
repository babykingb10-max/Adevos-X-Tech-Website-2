const axios = require('axios');

/**
 * Each platform client exposes: checkHealth(), deploy(payload), updateEnv(appId, env),
 * and destroy(appId). Fill in the real endpoints/payload shape for whichever platforms
 * you enable — the routes/controllers only depend on this common interface, so adding
 * a new platform (Railway, Fly.io, Pterodactyl...) means adding one object below and
 * registering it in PLATFORM_CLIENTS.
 */

const koyeb = {
  slug: 'koyeb',
  async checkHealth() {
    if (!process.env.KOYEB_API_KEY) return { status: 'UNKNOWN', message: 'API key not configured.' };
    try {
      const res = await axios.get('https://app.koyeb.com/v1/apps', {
        headers: { Authorization: `Bearer ${process.env.KOYEB_API_KEY}` }
      });
      const activeApps = res.data?.apps?.length || 0;
      const maxAppsLimit = 50;
      if (activeApps >= maxAppsLimit) return { status: 'FULL', message: 'Capacity reached.' };
      return { status: 'OPERATIONAL', message: 'Running normally.' };
    } catch {
      return { status: 'DOWN', message: 'API is not responding.' };
    }
  },
  async deploy({ appName, sessionId, botName, prefix, githubRepo }) {
    // TODO: call Koyeb's app-creation endpoint with:
    //   name: appName  (already lowercase/DNS-safe — see utils/slug.js)
    //   env: SESSION_ID, BOT_NAME, PREFIX
    //   git: { repository: githubRepo, branch: 'main' }
    return { remoteAppId: `koyeb-${appName}` };
  },
  async updateEnv(remoteAppId, env) {
    // TODO: PATCH the Koyeb service's environment variables.
    return true;
  },
  async destroy(remoteAppId) {
    // TODO: DELETE /services/{remoteAppId}
    return true;
  }
};

const render = {
  slug: 'render',
  async checkHealth() {
    if (!process.env.RENDER_API_KEY) return { status: 'UNKNOWN', message: 'API key not configured.' };
    try {
      await axios.get('https://api.render.com/v1/services', {
        headers: { Authorization: `Bearer ${process.env.RENDER_API_KEY}` }
      });
      return { status: 'OPERATIONAL', message: 'Running normally.' };
    } catch {
      return { status: 'DOWN', message: 'API is not responding.' };
    }
  },
  async deploy({ appName, sessionId, botName, prefix, githubRepo }) {
    // TODO: call Render's Background Worker creation endpoint with `name: appName`.
    return { remoteAppId: `render-${appName}` };
  },
  async updateEnv(remoteAppId, env) { return true; },
  async destroy(remoteAppId) { return true; }
};

const PLATFORM_CLIENTS = { koyeb, render };

function getPlatformClient(slug) {
  const client = PLATFORM_CLIENTS[slug];
  if (!client) throw { status: 400, message: `Unknown deployment platform: ${slug}` };
  return client;
}

module.exports = { PLATFORM_CLIENTS, getPlatformClient };
