'use client';

import { useState, useEffect } from 'react';
import { Search, Building2, Trash2, Filter, X, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import AddFaculties from './components/AddFaculties';

export default function FacultyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');

  // Search + Filter Logic
  const filteredDepartments = departments.filter((dept) => {
    const deptName = dept.department || '';
    const matchesSearch = deptName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterDept || deptName.toLowerCase().includes(filterDept.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Fetch faculties
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/faculty/get-faculties`
        );
        const result = await response.json();

        console.log("API result:", result);

        // FIXED HERE — your API returns { faculties: [...] }
        setDepartments(result.faculties || []);

      } catch (error) {
        console.error('Error fetching faculties:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  // Delete Faculty
  const deleteFaculty = async (facultyId, departmentId) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/faculty/delete/${facultyId}`,
        { method: 'DELETE' }
      );
      const res = await response.json();

      if (res.success) {
        setDepartments((prev) =>
          prev.map((dept) =>
            dept.id === departmentId
              ? {
                  ...dept,
                  faculties: dept.faculties.filter((f) => f.id !== facultyId),
                  totalFaculties: dept.totalFaculties - 1,
                }
              : dept
          )
        );
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const clearFilter = () => setFilterDept('');

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screenn text-black">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-9 h-9 text-blue-600" />
              Faculty Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage all faculty members across departments
            </p>
          </div>
          <AddFaculties departmentData={departments} />
        </div>

        {/* Search + Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search department or faculty name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by department"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-4 py-3 pr-10 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
              {filterDept && (
                <button
                  onClick={clearFilter}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(8)
              .fill()
              .map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-4/5 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : filteredDepartments.length === 0 ? (
          
          /* Empty State */
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">
              {departments.length === 0
                ? 'No departments found'
                : 'No departments match your filter'}
            </p>
          </div>
        ) : (
          
          /* Department Cards */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="bg-blue-600 text-white px-6 py-4">
                  <h3 className="font-bold text-lg truncate">{dept.department}</h3>
                  <p className="text-blue-100 text-sm">
                    HOD: {dept.hodName || 'Not Assigned'} • {dept.totalFaculties} Member
                    {dept.totalFaculties !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Faculty List */}
                <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
                  {dept.faculties.length === 0 ? (
                    <p className="text-center text-gray-400 italic py-8">
                      No faculty assigned yet
                    </p>
                  ) : (
                    dept.faculties.map((faculty) => (
                      <div
                        key={faculty.id}
                        className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{faculty.name}</p>
                          <p className="text-xs text-gray-600">{faculty.role}</p>
                          <p className="text-xs text-gray-500">ID: {faculty.id}</p>
                        </div>
                        <button
                          onClick={() => deleteFaculty(faculty.id, dept.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg ml-3"
                          title="Delete faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
