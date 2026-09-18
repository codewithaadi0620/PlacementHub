import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Building2, Globe, MapPin, Briefcase } from 'lucide-react';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await API.get('/admin/companies');
        setCompanies(res.data.data.companies);
      } catch (err) {
        console.error('Error fetching admin companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
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
          <Building2 className="w-7 h-7 text-blue-600" /> Corporate Recruiting Partners
        </h1>
        <p className="text-slate-500 text-sm mt-1">Overview of registered corporate organizations and recruiters.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((comp) => (
          <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{comp.company_name}</h3>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {comp.location || 'Location Not Specified'}
              </p>
              <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mb-4">
                {comp.description || 'No detailed company overview provided yet.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Recruiter: {comp.recruiter_name}</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-full">
                {comp.total_jobs_posted} Jobs Posted
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCompanies;
