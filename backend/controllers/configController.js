const SiteConfig = require('../models/SiteConfig');
const Slide = require('../models/Slide');
const HomepageCard = require('../models/HomepageCard');

exports.getConfig = async (req, res, next) => {
  try {
    const config = await SiteConfig.findOne({ key: 'GLOBAL' });
    res.json(config);
  } catch (err) { next(err); }
};

exports.getSlides = async (req, res, next) => {
  try {
    const slides = await Slide.find({ active: true }).sort('orderIndex');
    res.json(slides);
  } catch (err) { next(err); }
};

exports.getCards = async (req, res, next) => {
  try {
    const { section } = req.query;
    if (!['services', 'get_in_touch'].includes(section)) {
      return res.status(400).json({ message: 'section must be "services" or "get_in_touch".' });
    }
    const cards = await HomepageCard.find({ section, active: true }).sort('orderIndex');
    res.json(cards);
  } catch (err) { next(err); }
};
