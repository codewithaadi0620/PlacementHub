const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes require authentication and 'admin' role
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));
router.get('/students', (req, res, next) => adminController.getStudents(req, res, next));
router.get('/companies', (req, res, next) => adminController.getCompanies(req, res, next));
router.get('/jobs', (req, res, next) => adminController.getJobs(req, res, next));
router.get('/applications', (req, res, next) => adminController.getApplications(req, res, next));
router.patch('/jobs/:id/status', (req, res, next) => adminController.updateJobStatus(req, res, next));

module.exports = router;
