const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'GLOBAL', unique: true },

  brandName: { type: String, default: 'Adevos-X Tech' },

  supportLinks: {
    whatsapp: { type: String, default: '' },
    telegramGroup: { type: String, default: '' },
    channel: { type: String, default: '' }
  },

  freeBotFeature: {
    enabled: { type: Boolean, default: true },
    minBotUrl: { type: String, default: 'https://adevos-min-bot.site' }
  },

  paymentSettings: {
    manualEnabled: { type: Boolean, default: true },
    paystackEnabled: { type: Boolean, default: true },
    coinsEnabled: { type: Boolean, default: true },
    manualInstructions: { type: String, default: 'Pay via M-Pesa: 07XXXXXXXX (Adevos-X Tech)' },
    pricing: {
      'Wiki 2': { type: Number, default: 10000 },
      'Wiki 4': { type: Number, default: 19000 },
      'Wiki 6': { type: Number, default: 27000 },
      'Wiki 8': { type: Number, default: 34000 }
    }
  },

  coinSettings: {
    coinToTzsRate: { type: Number, default: 100 }, // 1 coin = 100 TZS
    referralRewardAmount: { type: Number, default: 50 },
    welcomeBonusEnabled: { type: Boolean, default: true },
    welcomeBonusAmount: { type: Number, default: 20 },
    triggerCondition: { type: String, enum: ['EMAIL_VERIFIED', 'FIRST_PURCHASE'], default: 'EMAIL_VERIFIED' }
  },

  audioSettings: {
    enabled: { type: Boolean, default: true },
    autoPlay: { type: Boolean, default: false },
    tracks: [{ title: String, audioUrl: String, isActive: Boolean }]
  },

  popupSettings: {
    autoCloseSeconds: { type: Number, default: 6 },
    delayBetweenPopups: { type: Number, default: 2 },
    maxPopupsPerSession: { type: Number, default: 3 },
    allowGlobalPopups: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
