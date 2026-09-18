const db = require('../config/db');

class CompanyService {
  /**
   * Create a new company profile (Recruiter)
   */
  async createCompany(recruiterUserId, { company_name, description, website, location }) {
    if (!company_name) {
      const error = new Error('Company name is required');
      error.status = 400;
      throw error;
    }

    const res = await db.query(
      `INSERT INTO companies (recruiter_id, company_name, description, website, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [recruiterUserId, company_name.trim(), description || '', website || '', location || '']
    );

    return res.rows[0];
  }

  /**
   * Get list of all companies
   */
  async getAllCompanies() {
    const res = await db.query(
      `SELECT c.*, u.name AS recruiter_name, u.email AS recruiter_email,
              COUNT(j.id) AS active_jobs_count
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       LEFT JOIN job_postings j ON c.id = j.company_id AND j.status = 'approved'
       GROUP BY c.id, u.id
       ORDER BY c.created_at DESC`
    );
    return res.rows;
  }

  /**
   * Get single company by ID with its job postings
   */
  async getCompanyById(companyId) {
    const companyRes = await db.query(
      `SELECT c.*, u.name AS recruiter_name, u.email AS recruiter_email
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       WHERE c.id = $1`,
      [companyId]
    );

    if (companyRes.rowCount === 0) {
      const error = new Error('Company not found');
      error.status = 404;
      throw error;
    }

    const company = companyRes.rows[0];

    // Fetch jobs
    const jobsRes = await db.query(
      `SELECT j.*, ARRAY_AGG(sk.skill_name) FILTER (WHERE sk.skill_name IS NOT NULL) AS required_skills,
              COUNT(DISTINCT a.id) AS total_applications
       FROM job_postings j
       LEFT JOIN job_required_skills sk ON j.id = sk.job_id
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.company_id = $1
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [companyId]
    );

    company.jobs = jobsRes.rows;
    return company;
  }

  /**
   * Update company profile & recruiter credentials dynamically
   */
  async updateCompany(companyId, recruiterUserId, role, { recruiter_name, recruiter_email, company_name, description, website, location }) {
    // Check ownership
    const existing = await db.query('SELECT recruiter_id FROM companies WHERE id = $1', [companyId]);
    if (existing.rowCount === 0) {
      const error = new Error('Company not found');
      error.status = 404;
      throw error;
    }

    if (existing.rows[0].recruiter_id !== recruiterUserId && role !== 'admin') {
      const error = new Error('Forbidden. You do not own this company profile.');
      error.status = 403;
      throw error;
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update recruiter user info if provided
      if (recruiter_name || recruiter_email) {
        if (recruiter_email) {
          const emailCheck = await client.query('SELECT id FROM users WHERE email = $1 AND id != $2', [recruiter_email.toLowerCase().trim(), recruiterUserId]);
          if (emailCheck.rowCount > 0) {
            const error = new Error('Email address is already used by another account');
            error.status = 409;
            throw error;
          }
        }

        await client.query(
          `UPDATE users
           SET name = COALESCE($1, name),
               email = COALESCE($2, email),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [recruiter_name ? recruiter_name.trim() : null, recruiter_email ? recruiter_email.toLowerCase().trim() : null, recruiterUserId]
        );
      }

      // Update company fields
      await client.query(
        `UPDATE companies
         SET company_name = COALESCE($1, company_name),
             description = COALESCE($2, description),
             website = COALESCE($3, website),
             location = COALESCE($4, location),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [company_name, description, website, location, companyId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return this.getCompanyById(companyId);
  }
}

module.exports = new CompanyService();
