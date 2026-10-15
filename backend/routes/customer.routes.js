const express = require('express');
const {
  register,
  login,
  getProfile,
  logout,
  changePassword
} = require('../controllers/customer.controller');
const protect = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Account routes
router.get('/me', protect, getProfile);
// Logout remains available with an expired token so it can always clear the cookie.
router.post('/logout', logout);
router.patch('/change-password', protect, changePassword);

module.exports = router;
