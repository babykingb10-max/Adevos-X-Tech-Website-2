const mongoose = require('mongoose');

const deploymentPlatformSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 'Koyeb', 'Render', 'Railway', 'Fly.io', 'Pterodactyl'
  slug: { type: String, required: true, unique: true }, // 'koyeb', 'render' ...
  apiBaseUrl: { type: String, default: '' },
  isEnabled: { type: Boolean, default: true },
  recommended: { type: Boolean, default: false },
  lastHealthStatus: { type: String, enum: ['OPERATIONAL', 'FULL', 'DOWN', 'MAINTENANCE', 'UNKNOWN'], default: 'UNKNOWN' },
  lastHealthMessage: { type: String, default: '' },
  lastCheckedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('DeploymentPlatform', deploymentPlatformSchema);
