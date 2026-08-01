const mongoose = require('mongoose');

const botTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  sourceCodeUrl: { type: String, required: true },
  pairingSites: [{ label: String, url: String }],
  allocation: { type: String, enum: ['USER', 'DEPLOYER', 'BOTH'], default: 'BOTH' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BotTemplate', botTemplateSchema);
