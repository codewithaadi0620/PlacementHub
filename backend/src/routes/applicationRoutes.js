const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Student Apply Endpoint
router.post('/jobs/:jobId/apply', authenticateToken, requireRole('student'), (req, res, next) => applicationController.applyForJob(req, res, next));

// Recruiter Get Job Applicants Endpoint
router.get('/jobs/:jobId/applications', authenticateToken, requireRole('recruiter', 'admin'), (req, res, next) => applicationController.getJobApplicants(req, res, next));

// Recruiter Update Status Endpoint
router.patch('/applications/:id/status', authenticateToken, requireRole('recruiter', 'admin'), (req, res, next) => applicationController.updateStatus(req, res, next));

module.exports = router;
