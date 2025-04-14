const express = require('express');
const router = express.Router();
const { 
  registerUser,
  loginUser, 
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword
} = require('../controllers/userController');
const { protectRoute, requireAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multerConfig');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', protectRoute, getUserProfile);
router.put('/profile', protectRoute, upload.single('profileImage'), updateUserProfile);
router.post('/change-password', protectRoute, changePassword);

// Admin routes
router.get('/admin/users', protectRoute, requireAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin access only' });
});

module.exports = router;