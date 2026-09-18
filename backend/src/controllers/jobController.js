const jobService = require('../services/jobService');

class JobController {
  async getAllJobs(req, res, next) {
    try {
      const jobs = await jobService.getAllJobs(req.query, req.user ? req.user.role : 'student');
      res.status(200).json({
        success: true,
        message: 'Job postings retrieved successfully',
        data: { jobs }
      });
    } catch (err) {
      next(err);
    }
  }

  async getJobById(req, res, next) {
    try {
      const job = await jobService.getJobById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Job details retrieved successfully',
        data: { job }
      });
    } catch (err) {
      next(err);
    }
  }

  async createJob(req, res, next) {
    try {
      const job = await jobService.createJob(req.user.userId, req.user.role, req.body);
      res.status(201).json({
        success: true,
        message: 'Job posting created successfully',
        data: { job }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateJob(req, res, next) {
    try {
      const job = await jobService.updateJob(req.params.id, req.user.userId, req.user.role, req.body);
      res.status(200).json({
        success: true,
        message: 'Job posting updated successfully',
        data: { job }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteJob(req, res, next) {
    try {
      const result = await jobService.deleteJob(req.params.id, req.user.userId, req.user.role);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async checkEligibility(req, res, next) {
    try {
      const eligibility = await jobService.checkEligibility(req.params.jobId, req.user.userId);
      res.status(200).json({
        success: true,
        message: eligibility.eligible ? 'Student is eligible for this job' : 'Student is not eligible for this job',
        data: eligibility
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JobController();
