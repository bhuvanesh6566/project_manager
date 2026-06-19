const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login, logout, getProfile, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../validators/validators');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { message: 'Too many registration attempts.' },
});

router.post('/register', registerLimiter, registerRules, validate, register);
router.post('/login', loginLimiter, loginRules, validate, login);
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
