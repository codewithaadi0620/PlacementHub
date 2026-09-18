import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FileText, MapPin, Calendar, Building2, CheckCircle2, Clock, XCircle, Award } from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await API.get('/students/me/applications');
        setApplications(res.data.data.applications);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-600" /> My Job Applications Tracker
        </h1>
        <p className="text-slate-500 text-sm mt-1">Real-time status updates for all your submitted job applications.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm">You have not submitted any applications yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Job Role</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {app.company_name}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{app.job_title}</td>
                    <td className="py-4 px-6 text-slate-600">{app.job_location}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {new Date(app.applied_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        app.status === 'selected' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        app.status === 'shortlisted' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {app.status === 'selected' && <Award className="w-3.5 h-3.5 text-emerald-600" />}
                        {app.status === 'shortlisted' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        {app.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                        {app.status === 'applied' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        {app.status}
                      </span>
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

export default MyApplications;
