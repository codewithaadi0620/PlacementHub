const db = require('../config/db');
const jobService = require('./jobService');

class ApplicationService {
  /**
   * Apply for a job posting (Student)
   */
  async applyForJob(jobId, studentUserId) {
    // 1. Verify student exists
    const studentRes = await db.query('SELECT id FROM students WHERE user_id = $1', [studentUserId]);
    if (studentRes.rowCount === 0) {
      const error = new Error('Student profile not found');
      error.status = 404;
      throw error;
    }
    const studentId = studentRes.rows[0].id;

    // 2. Check if already applied (Rule 1 & DB Unique Constraint)
    const existingApp = await db.query(
      'SELECT id, status FROM applications WHERE job_id = $1 AND student_id = $2',
      [jobId, studentId]
    );

    if (existingApp.rowCount > 0) {
      const error = new Error('You have already applied for this job posting');
      error.status = 409;
      error.errors = ['DUPLICATE_APPLICATION'];
      throw error;
    }

    // 3. Server-side Eligibility Verification (Rule 2 & Rule 3)
    const eligibility = await jobService.checkEligibility(jobId, studentUserId);
    if (!eligibility.eligible) {
      const error = new Error(`Application failed. You do not meet eligibility criteria: ${eligibility.reasons.join('; ')}`);
      error.status = 400;
      error.errors = eligibility.reasons;
      throw error;
    }

    // 4. Create application
    try {
      const res = await db.query(
        `INSERT INTO applications (job_id, student_id, status)
         VALUES ($1, $2, 'applied')
         RETURNING *`,
        [jobId, studentId]
      );

      return res.rows[0];
    } catch (err) {
      if (err.code === '23505') { // Postgres UNIQUE constraint violation code
        const error = new Error('You have already applied for this job posting');
        error.status = 409;
        throw error;
      }
      throw err;
    }
  }

  /**
   * Get applicants for a job posting with candidate search & filters (Recruiter)
   */
  async getJobApplicants(jobId, recruiterUserId, role, filters = {}) {
    const job = await jobService.getJobById(jobId);

    // Ownership check (Rule 5: Recruiter can only manage applications for their own jobs)
    if (job.recruiter_id !== recruiterUserId && role !== 'admin') {
      const error = new Error('Forbidden. You do not own the job posting associated with these applications.');
      error.status = 403;
      throw error;
    }

    const { minCgpa, department, graduation_year, status, skill } = filters;
    let queryValues = [jobId];
    let whereClauses = [`a.job_id = $1`];

    if (minCgpa) {
      queryValues.push(parseFloat(minCgpa));
      whereClauses.push(`s.cgpa >= $${queryValues.length}`);
    }

    if (department) {
      queryValues.push(`%${department}%`);
      whereClauses.push(`s.department ILIKE $${queryValues.length}`);
    }

    if (graduation_year) {
      queryValues.push(parseInt(graduation_year, 10));
      whereClauses.push(`s.graduation_year = $${queryValues.length}`);
    }

    if (status) {
      queryValues.push(status);
      whereClauses.push(`a.status = $${queryValues.length}`);
    }

    const whereString = whereClauses.join(' AND ');

    const sql = `
      SELECT 
        a.id AS application_id,
        a.status AS application_status,
        a.applied_at,
        a.updated_at,
        s.id AS student_id,
        s.enrollment_number,
        s.phone,
        s.department,
        s.graduation_year,
        s.cgpa,
        s.resume_url,
        u.name AS student_name,
        u.email AS student_email,
        ARRAY_AGG(DISTINCT sk.skill_name) FILTER (WHERE sk.skill_name IS NOT NULL) AS student_skills
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_skills sk ON s.id = sk.student_id
      WHERE ${whereString}
      GROUP BY a.id, s.id, u.id
      ORDER BY a.applied_at DESC
    `;

    const res = await db.query(sql, queryValues);
    let applicants = res.rows;

    if (skill) {
      const searchSkill = skill.toLowerCase();
      applicants = applicants.filter(app => 
        app.student_skills && app.student_skills.some(s => s.toLowerCase().includes(searchSkill))
      );
    }

    return {
      job: {
        id: job.id,
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        minimum_cgpa: job.minimum_cgpa,
        deadline: job.deadline
      },
      applicants
    };
  }

  /**
   * Update candidate application status (Shortlist, Select, Reject)
   */
  async updateApplicationStatus(applicationId, recruiterUserId, role, newStatus) {
    if (!['applied', 'shortlisted', 'rejected', 'selected'].includes(newStatus)) {
      const error = new Error('Invalid application status value');
      error.status = 400;
      throw error;
    }

    // Verify application & job ownership
    const appRes = await db.query(
      `SELECT a.*, j.company_id, c.recruiter_id
       FROM applications a
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.id = $1`,
      [applicationId]
    );

    if (appRes.rowCount === 0) {
      const error = new Error('Application record not found');
      error.status = 404;
      throw error;
    }

    const application = appRes.rows[0];

    if (application.recruiter_id !== recruiterUserId && role !== 'admin') {
      const error = new Error('Forbidden. You do not own the job posting associated with this application.');
      error.status = 403;
      throw error;
    }

    const updateRes = await db.query(
      `UPDATE applications
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [newStatus, applicationId]
    );

    return updateRes.rows[0];
  }
}

module.exports = new ApplicationService();
