const router = require('express').Router();
const auth = require('../middleware/auth');
const { sendDueDateReminder } = require('../utils/email');
const { User } = require('../models');

// GET /api/test-email — sends a test reminder to the logged-in user's email
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['email', 'name'] });
    await sendDueDateReminder(
      user.email,
      'Sample Task - Login Page',
      new Date().toISOString().split('T')[0],
      '⏰ Due Tomorrow: "Sample Task - Login Page"',
      '⏰',
      `Hello <b>${user.name}</b>, this is a test reminder from DevFlow. Your task <b>Sample Task - Login Page</b> is due <b>tomorrow</b>.`
    );
    res.json({ message: `✅ Test email sent to ${user.email}` });
  } catch (err) {
    res.status(500).json({ message: '❌ Email failed: ' + err.message });
  }
});

module.exports = router;
