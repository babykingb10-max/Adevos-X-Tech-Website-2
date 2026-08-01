const Update = require('../models/Update');
const UserUpdateRead = require('../models/UserUpdateRead');

// GET /updates — public, returns published updates newest first
exports.listUpdates = async (req, res, next) => {
  try {
    const updates = await Update.find({ isPublished: true }).sort('-createdAt').limit(50);
    res.json(updates);
  } catch (err) { next(err); }
};

// POST /updates/:id/read — logged-in only
exports.markRead = async (req, res, next) => {
  try {
    await UserUpdateRead.findOneAndUpdate(
      { userId: req.user._id, updateId: req.params.id },
      { isRead: true, isPoppedUp: true },
      { upsert: true, new: true }
    );
    res.json({ message: 'Marked as read.' });
  } catch (err) { next(err); }
};

// POST /updates/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    const updates = await Update.find({ isPublished: true }, '_id');
    await Promise.all(updates.map(u =>
      UserUpdateRead.findOneAndUpdate(
        { userId: req.user._id, updateId: u._id },
        { isRead: true, isPoppedUp: true },
        { upsert: true }
      )
    ));
    res.json({ message: 'All updates marked as read.' });
  } catch (err) { next(err); }
};

// ---- Admin-only ----

// POST /admin/updates
exports.createUpdate = async (req, res, next) => {
  try {
    const update = await Update.create(req.body);
    if (update.allowPopup) {
      req.app.get('io')?.emit('new-update', {
        id: update._id, title: update.title, summary: update.summary, category: update.category
      });
    }
    res.status(201).json(update);
  } catch (err) { next(err); }
};

// PUT /admin/updates/:id
exports.updateUpdate = async (req, res, next) => {
  try {
    const update = await Update.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!update) return res.status(404).json({ message: 'Update not found.' });
    res.json(update);
  } catch (err) { next(err); }
};

// DELETE /admin/updates/:id
exports.deleteUpdate = async (req, res, next) => {
  try {
    await Update.findByIdAndDelete(req.params.id);
    await UserUpdateRead.deleteMany({ updateId: req.params.id });
    res.json({ message: 'Update deleted.' });
  } catch (err) { next(err); }
};

// POST /admin/updates/:id/trigger-popup — re-broadcast an existing update
exports.triggerPopup = async (req, res, next) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) return res.status(404).json({ message: 'Update not found.' });
    req.app.get('io')?.emit('new-update', { id: update._id, title: update.title, summary: update.summary, category: update.category });
    res.json({ message: 'Popup triggered.' });
  } catch (err) { next(err); }
};
