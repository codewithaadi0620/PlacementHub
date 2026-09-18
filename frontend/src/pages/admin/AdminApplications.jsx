import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FileText, Search, Building2 } from 'lucide-react';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await API.get('/admin/applications');
        setApplications(res.data.data.applications);
      } catch (err) {
        console.error('Error fetching admin applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  const filteredApps = applications.filter(a =>
    a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    a.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" /> System Master Application Audit
          </h1>
          <p className="text-slate-500 text-sm mt-1">Audit student applications across all corporate recruitment drives.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student, company, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Candidate Name</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">CGPA</th>
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6">Job Role</th>
                <th className="py-4 px-6">Applied Date</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredApps.map((app) => (
                <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {app.student_name}
                    <span className="block text-xs font-normal text-slate-500">{app.student_email}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-700 text-xs font-medium">{app.department}</td>
                  <td className="py-4 px-6 font-extrabold text-blue-600">{parseFloat(app.cgpa).toFixed(2)}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{app.company_name}</td>
                  <td className="py-4 px-6 text-slate-700 text-xs font-medium">{app.job_title}</td>
                  <td className="py-4 px-6 text-slate-500 text-xs">{new Date(app.applied_at).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      app.status === 'selected' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminApplications;
