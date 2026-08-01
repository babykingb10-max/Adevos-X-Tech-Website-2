/**
 * Deployment platforms (Koyeb, Render, Heroku-style APIs) require app/service
 * names that are lowercase, start with a letter, and contain only letters,
 * numbers, and hyphens. This turns a user's display name into a safe,
 * unique-enough app name to send in the deploy payload.
 *
 * Example: "Musa Ally" -> "musa-ally-4f3a"
 */
function slugifyAppName(userName, botName = '') {
  const base = `${userName}-${botName}`
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')  // anything not a-z0-9 becomes a hyphen
    .replace(/^-+|-+$/g, '')      // trim leading/trailing hyphens
    .slice(0, 40) || 'adevos-user';

  const suffix = Math.random().toString(36).slice(2, 6); // avoids name collisions
  return `${base}-${suffix}`;
}

module.exports = { slugifyAppName };

