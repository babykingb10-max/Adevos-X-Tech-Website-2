const mongoose = require('mongoose');

const userBotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  botTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BotTemplate', default: null },
  botName: { type: String, required: true },
  whatsappNumber: { type: String, default: null },
  sessionId: { type: String, required: true },
  hostingPlatform: { type: String, required: true }, // 'koyeb' | 'render' | 'railway' | 'flyio' | 'pterodactyl' ...
  remoteAppId: { type: String, default: null }, // ID returned by the platform's API
  githubRepo: { type: String, default: null },
  status: { type: String, enum: ['BUILDING', 'ACTIVE', 'STOPPED', 'CRASHED'], default: 'BUILDING' },
  prefix: { type: String, default: '.' },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UserBot', userBotSchema);
