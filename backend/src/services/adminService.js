const db = require('../config/db');

class AdminService {
  /**
   * Get global placement metrics
   */
  async getDashboardMetrics() {
    const studentsRes = await db.query('SELECT COUNT(*) FROM students');
    const companiesRes = await db.query('SELECT COUNT(*) FROM companies');
    const jobsRes = await db.query('SELECT COUNT(*) FROM job_postings');
    const pendingJobsRes = await db.query("SELECT COUNT(*) FROM job_postings WHERE status = 'pending'");
    const appsRes = await db.query('SELECT COUNT(*) FROM applications');
    const shortlistedRes = await db.query("SELECT COUNT(*) FROM applications WHERE status = 'shortlisted'");
    const selectedRes = await db.query("SELECT COUNT(*) FROM applications WHERE status = 'selected'");

    return {
      total_students: parseInt(studentsRes.rows[0].count, 10),
      total_companies: parseInt(companiesRes.rows[0].count, 10),
      total_jobs: parseInt(jobsRes.rows[0].count, 10),
      pending_jobs_count: parseInt(pendingJobsRes.rows[0].count, 10),
      total_applications: parseInt(appsRes.rows[0].count, 10),
      total_shortlisted: parseInt(shortlistedRes.rows[0].count, 10),
      total_selected: parseInt(selectedRes.rows[0].count, 10)
    };
  }

  /**
   * Get all students with details
   */
  async getAllStudents() {
    const res = await db.query(
      `SELECT 
         s.*, u.name, u.email, u.created_at AS user_created_at,
         ARRAY_AGG(DISTINCT sk.skill_name) FILTER (WHERE sk.skill_name IS NOT NULL) AS skills,
         COUNT(DISTINCT a.id) AS applications_count,
         COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'selected') AS selected_count
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN student_skills sk ON s.id = sk.student_id
       LEFT JOIN applications a ON s.id = a.student_id
       GROUP BY s.id, u.id
       ORDER BY s.created_at DESC`
    );
    return res.rows;
  }

  /**
   * Get all companies
   */
  async getAllCompanies() {
    const res = await db.query(
      `SELECT 
         c.*, u.name AS recruiter_name, u.email AS recruiter_email,
         COUNT(DISTINCT j.id) AS total_jobs_posted
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       LEFT JOIN job_postings j ON c.id = j.company_id
       GROUP BY c.id, u.id
       ORDER BY c.created_at DESC`
    );
    return res.rows;
  }

  /**
   * Get all jobs
   */
  async getAllJobs() {
    const res = await db.query(
      `SELECT 
         j.*, c.company_name, u.name AS recruiter_name, u.email AS recruiter_email,
         COUNT(DISTINCT a.id) AS applicants_count
       FROM job_postings j
       JOIN companies c ON j.company_id = c.id
       JOIN users u ON c.recruiter_id = u.id
       LEFT JOIN applications a ON j.id = a.job_id
       GROUP BY j.id, c.id, u.id
       ORDER BY j.created_at DESC`
    );
    return res.rows;
  }

  /**
   * Get all applications
   */
  async getAllApplications() {
    const res = await db.query(
      `SELECT 
         a.id AS application_id, a.status, a.applied_at,
         j.id AS job_id, j.title AS job_title, j.location AS job_location,
         c.company_name,
         u.name AS student_name, u.email AS student_email,
         s.department, s.cgpa, s.graduation_year
       FROM applications a
       JOIN job_postings j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       ORDER BY a.applied_at DESC`
    );
    return res.rows;
  }

  /**
   * Admin approves/rejects job posting
   */
  async updateJobStatus(jobId, status) {
    if (!['pending', 'approved', 'closed'].includes(status)) {
      const error = new Error('Invalid job status');
      error.status = 400;
      throw error;
    }

    const res = await db.query(
      `UPDATE job_postings
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, jobId]
    );

    if (res.rowCount === 0) {
      const error = new Error('Job posting not found');
      error.status = 404;
      throw error;
    }

    return res.rows[0];
  }
}

module.exports = new AdminService();
