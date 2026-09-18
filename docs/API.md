# Placement Management Platform - REST API Documentation

Base URL: `http://localhost:5000/api`

Standard Response Format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

Standard Error Format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["ERROR_CODE"]
}
```

---

## 1. Authentication Endpoints

### 1.1 User Registration
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "name": "Alex Johnson",
  "email": "student@example.com",
  "password": "Password123",
  "role": "student",
  "department": "Computer Science",
  "graduation_year": 2026,
  "cgpa": 8.5
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 4,
      "name": "Alex Johnson",
      "email": "student@example.com",
      "role": "student"
    }
  }
}
```

### 1.2 User Login
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "email": "student@example.com",
  "password": "Password123"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 4,
      "name": "Alex Johnson",
      "email": "student@example.com",
      "role": "student"
    }
  }
}
```

### 1.3 Get Current Authenticated User
- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Authenticated user profile retrieved",
  "data": {
    "user": {
      "id": 4,
      "name": "Alex Johnson",
      "email": "student@example.com",
      "role": "student",
      "student_profile": {
        "id": 1,
        "enrollment_number": "EN2026CS101",
        "department": "Computer Science",
        "graduation_year": 2026,
        "cgpa": "8.50",
        "skills": ["React", "Node.js", "SQL"]
      }
    }
  }
}
```

---

## 2. Student Endpoints

### 2.1 Get Student Profile
- **Method**: `GET`
- **Endpoint**: `/students/me`
- **Authentication**: Required
- **Role**: `student`
- **Success Response (200 OK)**: Returns detailed profile, skill tags, and application summary statistics.

### 2.2 Update Student Profile
- **Method**: `PUT`
- **Endpoint**: `/students/me`
- **Authentication**: Required
- **Role**: `student`
- **Request Body**:
```json
{
  "phone": "+1987654321",
  "department": "Computer Science",
  "graduation_year": 2026,
  "cgpa": 8.5,
  "resume_url": "https://example.com/resumes/alex.pdf",
  "skills": ["React", "Node.js", "Express", "PostgreSQL"]
}
```

### 2.3 Get Student Submitted Applications
- **Method**: `GET`
- **Endpoint**: `/students/me/applications`
- **Authentication**: Required
- **Role**: `student`

---

## 3. Job & Eligibility Endpoints

### 3.1 Get Available Job Postings
- **Method**: `GET`
- **Endpoint**: `/jobs?search=Developer&location=Bangalore&minCgpa=7.5`
- **Authentication**: Optional / Public

### 3.2 Get Server-Side Job Eligibility Evaluation
- **Method**: `GET`
- **Endpoint**: `/jobs/:jobId/eligibility`
- **Authentication**: Required
- **Role**: `student`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Student is eligible for this job",
  "data": {
    "eligible": true,
    "reasons": [],
    "student_cgpa": 8.5,
    "required_cgpa": 7.5,
    "required_skills": ["React", "Node.js", "SQL"]
  }
}
```
- **Ineligible Response**:
```json
{
  "success": true,
  "message": "Student is not eligible for this job",
  "data": {
    "eligible": false,
    "reasons": [
      "Student CGPA (7.10) is below the minimum requirement (7.50)",
      "Missing required skill(s): React, Node.js"
    ]
  }
}
```

### 3.3 Apply for Job
- **Method**: `POST`
- **Endpoint**: `/jobs/:jobId/apply`
- **Authentication**: Required
- **Role**: `student`

---

## 4. Recruiter & Shortlisting Endpoints

### 4.1 Create Job Posting
- **Method**: `POST`
- **Endpoint**: `/jobs`
- **Authentication**: Required
- **Role**: `recruiter` or `admin`

### 4.2 Get Applicants for Job
- **Method**: `GET`
- **Endpoint**: `/jobs/:jobId/applications?minCgpa=8.0&department=Computer%20Science`
- **Authentication**: Required
- **Role**: `recruiter` (Job Owner) or `admin`

### 4.3 Update Candidate Application Status
- **Method**: `PATCH`
- **Endpoint**: `/applications/:id/status`
- **Authentication**: Required
- **Role**: `recruiter` (Job Owner) or `admin`
- **Request Body**:
```json
{
  "status": "shortlisted"
}
```
- Allowed statuses: `applied`, `shortlisted`, `rejected`, `selected`.

---

## 5. Admin Endpoints

### 5.1 Admin Overview Metrics
- **Method**: `GET`
- **Endpoint**: `/admin/dashboard`
- **Authentication**: Required
- **Role**: `admin`

### 5.2 Approve or Reject Job Posting
- **Method**: `PATCH`
- **Endpoint**: `/admin/jobs/:id/status`
- **Authentication**: Required
- **Role**: `admin`
- **Request Body**: `{ "status": "approved" }`
