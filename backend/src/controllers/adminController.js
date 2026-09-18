const adminService = require('../services/adminService');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const metrics = await adminService.getDashboardMetrics();
      res.status(200).json({
        success: true,
        message: 'Admin dashboard metrics retrieved successfully',
        data: { metrics }
      });
    } catch (err) {
      next(err);
    }
  }

  async getStudents(req, res, next) {
    try {
      const students = await adminService.getAllStudents();
      res.status(200).json({
        success: true,
        message: 'Students list retrieved successfully',
        data: { students }
      });
    } catch (err) {
      next(err);
    }
  }

  async getCompanies(req, res, next) {
    try {
      const companies = await adminService.getAllCompanies();
      res.status(200).json({
        success: true,
        message: 'Companies list retrieved successfully',
        data: { companies }
      });
    } catch (err) {
      next(err);
    }
  }

  async getJobs(req, res, next) {
    try {
      const jobs = await adminService.getAllJobs();
      res.status(200).json({
        success: true,
        message: 'Jobs list retrieved successfully',
        data: { jobs }
      });
    } catch (err) {
      next(err);
    }
  }

  async getApplications(req, res, next) {
    try {
      const applications = await adminService.getAllApplications();
      res.status(200).json({
        success: true,
        message: 'Applications list retrieved successfully',
        data: { applications }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateJobStatus(req, res, next) {
    try {
      const { status } = req.body;
      const job = await adminService.updateJobStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: `Job posting status updated to '${status}' successfully`,
        data: { job }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
