const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  subtext: { type: String, default: '' },
  btnText: { type: String, default: 'Learn More' },
  target: { type: String, default: null },   // internal/external URL
  action: { type: String, default: null },   // actionType handled by ActionEngine, e.g. DEPLOYER_UPGRADE
  imageUrl: { type: String, default: null },
  orderIndex: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Slide', slideSchema);
