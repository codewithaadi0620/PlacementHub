const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public route to view companies
router.get('/', (req, res, next) => companyController.getAllCompanies(req, res, next));
router.get('/:id', (req, res, next) => companyController.getCompanyById(req, res, next));

// Protected Recruiter / Admin routes
router.post('/', authenticateToken, requireRole('recruiter', 'admin'), (req, res, next) => companyController.createCompany(req, res, next));
router.put('/:id', authenticateToken, requireRole('recruiter', 'admin'), (req, res, next) => companyController.updateCompany(req, res, next));

module.exports = router;
