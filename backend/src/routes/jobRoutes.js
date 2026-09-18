const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public / Authenticated Job list & details
router.get('/', (req, res, next) => jobController.getAllJobs(req, res, next));
router.get('/:id', (req, res, next) => jobController.getJobById(req, res, next));

// Student Eligibility Endpoint
router.get('/:jobId/eligibility', authenticateToken, requireRole('student'), (req, res, next) => jobController.checkEligibility(req, res, next));

// Recruiter / Admin job management routes
router.post('/', authenticateToken, requireRole('recruiter', 'admin'), (req, res, next) => jobController.createJob(req, res, next));
router.put('/:id', authenticateToken, requireRole('recruiter', 'admin'), (req, res, next) => jobController.updateJob(req, res, next));
router.delete('/:id', authenticateToken, requireRole('recruiter', 'admin'), (req, res, next) => jobController.deleteJob(req, res, next));

module.exports = router;
