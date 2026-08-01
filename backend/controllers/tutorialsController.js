const Tutorial = require('../models/Tutorial');

// GET /tutorials — public
exports.listTutorials = async (req, res, next) => {
  try {
    const tutorials = await Tutorial.find({ isPublished: true }).sort('-createdAt');
    res.json(tutorials);
  } catch (err) { next(err); }
};

// ---- Admin-only ----

exports.createTutorial = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.create(req.body);
    res.status(201).json(tutorial);
  } catch (err) { next(err); }
};

exports.updateTutorial = async (req, res, next) => {
  try {
    const tutorial = await Tutorial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tutorial) return res.status(404).json({ message: 'Tutorial not found.' });
    res.json(tutorial);
  } catch (err) { next(err); }
};

exports.deleteTutorial = async (req, res, next) => {
  try {
    await Tutorial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tutorial deleted.' });
  } catch (err) { next(err); }
};
