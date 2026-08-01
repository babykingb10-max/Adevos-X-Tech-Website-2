const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Deployment', 'AV Coins', 'Account Settings', 'Troubleshooting'], required: true },
  videoType: { type: String, enum: ['YOUTUBE', 'VIMEO', 'CUSTOM_URL'], default: 'YOUTUBE' },
  videoUrl: { type: String, required: true }, // embeddable URL
  thumbnail: { type: String, required: true },
  duration: { type: String, default: '' },
  writtenSteps: [{ type: String }],
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Tutorial', tutorialSchema);
