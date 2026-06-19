const jwt = require('jsonwebtoken');
const { tokenBlacklist } = require('../controllers/authController');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  if (tokenBlacklist.has(token)) return res.status(401).json({ message: 'Token has been invalidated' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
