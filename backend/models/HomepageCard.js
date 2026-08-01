const mongoose = require('mongoose');

const homepageCardSchema = new mongoose.Schema({
  section: { type: String, enum: ['services', 'get_in_touch'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconClass: { type: String, default: 'fa-solid fa-gear' },
  btnText: { type: String, default: '' },
  target: { type: String, default: null },
  action: { type: String, default: null },
  orderIndex: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HomepageCard', homepageCardSchema);
