const studentService = require('../services/studentService');

class StudentController {
  async getProfile(req, res, next) {
    try {
      const student = await studentService.getStudentProfile(req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Student profile retrieved successfully',
        data: { student }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedStudent = await studentService.updateStudentProfile(req.user.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Student profile updated successfully',
        data: { student: updatedStudent }
      });
    } catch (err) {
      next(err);
    }
  }

  async getApplications(req, res, next) {
    try {
      const applications = await studentService.getStudentApplications(req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Student applications retrieved successfully',
        data: { applications }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StudentController();
