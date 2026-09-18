const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All student routes require authentication and 'student' role
router.use(authenticateToken);
router.use(requireRole('student'));

router.get('/me', (req, res, next) => studentController.getProfile(req, res, next));
router.put('/me', (req, res, next) => studentController.updateProfile(req, res, next));
router.get('/me/applications', (req, res, next) => studentController.getApplications(req, res, next));

module.exports = router;
