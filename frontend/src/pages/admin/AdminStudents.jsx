import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { UserCheck, Search, Award, FileText } from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get('/admin/students');
        setStudents(res.data.data.students);
      } catch (err) {
        console.error('Error fetching admin students list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_number?.toLowerCase().includes(search.toLowerCase())
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
            <UserCheck className="w-7 h-7 text-blue-600" /> Registered Students Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage student profiles, academic CGPAs, and application status.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, email, roll no..."
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
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Roll Number</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">CGPA</th>
                <th className="py-4 px-6">Batch</th>
                <th className="py-4 px-6">Applications</th>
                <th className="py-4 px-6 text-center">Placed Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {s.name}
                    <span className="block text-xs font-normal text-slate-500">{s.email}</span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-700">{s.enrollment_number}</td>
                  <td className="py-4 px-6 text-slate-700 text-xs font-medium">{s.department}</td>
                  <td className="py-4 px-6 font-extrabold text-blue-600">{parseFloat(s.cgpa).toFixed(2)}</td>
                  <td className="py-4 px-6 text-slate-600 text-xs">{s.graduation_year}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{s.applications_count} submitted</td>
                  <td className="py-4 px-6 text-center">
                    {parseInt(s.selected_count || 0, 10) > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Placed ({s.selected_count})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Unplaced
                      </span>
                    )}
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

export default AdminStudents;
