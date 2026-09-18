const applicationService = require('../services/applicationService');

class ApplicationController {
  async applyForJob(req, res, next) {
    try {
      const application = await applicationService.applyForJob(req.params.jobId, req.user.userId);
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: { application }
      });
    } catch (err) {
      next(err);
    }
  }

  async getJobApplicants(req, res, next) {
    try {
      const result = await applicationService.getJobApplicants(
        req.params.jobId,
        req.user.userId,
        req.user.role,
        req.query
      );
      res.status(200).json({
        success: true,
        message: 'Applicants retrieved successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const application = await applicationService.updateApplicationStatus(
        req.params.id,
        req.user.userId,
        req.user.role,
        status
      );
      res.status(200).json({
        success: true,
        message: `Application status updated to '${status}' successfully`,
        data: { application }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ApplicationController();
