import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Users, 
  Filter, 
  Award, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  ArrowLeft, 
  Search, 
  Sparkles, 
  CheckSquare 
} from 'lucide-react';

const ApplicantsManagement = () => {
  const { jobId } = useParams();

  const [jobInfo, setJobInfo] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [minCgpaFilter, setMinCgpaFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Student Modal
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (minCgpaFilter) params.minCgpa = minCgpaFilter;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get(`/jobs/${jobId}/applications`, { params });
      setJobInfo(res.data.data.job);
      setApplicants(res.data.data.applicants);
    } catch (err) {
      console.error('Error fetching job applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, minCgpaFilter, deptFilter, statusFilter]);

  const handleUpdateStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await API.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplicants(applicants.map(app => 
        app.application_id === applicationId ? { ...app, application_status: newStatus } : app
      ));
      if (selectedApplicant && selectedApplicant.application_id === applicationId) {
        setSelectedApplicant({ ...selectedApplicant, application_status: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading && !jobInfo) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link to="/recruiter/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Job Postings
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-600" /> Applicants for {jobInfo?.title}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Company: <span className="font-semibold text-slate-800">{jobInfo?.company_name}</span> | Minimum CGPA Cutoff: <span className="font-bold text-blue-600">{parseFloat(jobInfo?.minimum_cgpa || 0).toFixed(2)}</span></p>
      </div>

      {/* Filtering Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Min CGPA</label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 8.0"
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Department</label>
          <input
            type="text"
            placeholder="e.g. Computer Science"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Application Statuses</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : applicants.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No candidate applicants match your search filters for this job posting.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Candidate Name</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">CGPA</th>
                  <th className="py-4 px-6">Grad Year</th>
                  <th className="py-4 px-6">Skills</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Shortlist Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {applicants.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {app.student_name}
                      <span className="block text-xs font-normal text-slate-500">{app.student_email}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 text-xs font-medium">{app.department}</td>
                    <td className="py-4 px-6 font-extrabold text-blue-600">{parseFloat(app.cgpa).toFixed(2)}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">{app.graduation_year}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {app.student_skills && app.student_skills.map((sk, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        app.application_status === 'selected' ? 'bg-emerald-100 text-emerald-800' :
                        app.application_status === 'shortlisted' ? 'bg-amber-100 text-amber-800' :
                        app.application_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {app.application_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(app.application_id, 'shortlisted')}
                          disabled={updatingStatus}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.application_id, 'selected')}
                          disabled={updatingStatus}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.application_id, 'rejected')}
                          disabled={updatingStatus}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsManagement;
