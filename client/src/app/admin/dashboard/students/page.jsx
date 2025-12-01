'use client';

import { useState, useEffect } from 'react';
import { Trash2, Users, Filter, X } from 'lucide-react';
import AddStudents from './components/AddStudents';
import DashboardLayout from '../../components/DashboardLayout';

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ department: '', batch: '', className: '' });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fixed: Proper useEffect syntax
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/student/get-students`);
        const result = await response.json();
        if (result.success) {
          setStudents(result.data);
          setFilteredStudents(result.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // ← This closing was missing!

  // Fixed: Missing closing braces in filter chain
  const applyFilters = () => {
    let filtered = students;

    if (filters.department) {
      filtered = filtered.filter(g => 
        g.department.toLowerCase().includes(filters.department.toLowerCase())
      );
    }
    if (filters.batch) {
      filtered = filtered.filter(g => 
        g.batch.toLowerCase().includes(filters.batch.toLowerCase())
      );
    }
    if (filters.className) {
      filtered = filtered.filter(g => 
        g.class.toLowerCase().includes(filters.className.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ department: '', batch: '', className: '' });
  };

  const deleteStudent = async (rollNo) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/student/delete/${rollNo}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setStudents(prev =>
          prev
            .map(group => ({
              ...group,
              students: group.students.filter(s => s.rollNo !== rollNo)
            }))
            .filter(group => group.students.length > 0)
        );
        applyFilters();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const allStudents = filteredStudents.flatMap(group => 
    group.students.map((student, idx) => {
      const previousCount = filteredStudents
        .slice(0, filteredStudents.indexOf(group))
        .reduce((acc, g) => acc + g.students.length, 0);
      return {
        ...student,
        group,
        serial: previousCount + idx + 1
      };
    })
  );

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Students Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">View and manage all registered students</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-md"
          >
            <Users className="w-4 h-4" />
            Add Students
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-black">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={filters.department}
              onChange={handleFilterChange}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-48"
            />
            <input
              type="text"
              name="batch"
              placeholder="Batch (e.g. 2024)"
              value={filters.batch}
              onChange={handleFilterChange}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-40"
            />
            <input
              type="text"
              name="className"
              placeholder="Class"
              value={filters.className}
              onChange={handleFilterChange}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-40"
            />
            {(filters.department || filters.batch || filters.className) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && <AddStudents closeModal={closeModal} />}

        {/* Students Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array(8).fill().map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))
          ) : allStudents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No students found</p>
            </div>
          ) : (
            allStudents.map((student) => (
              <div
                key={student.rollNo}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      #{student.serial}
                    </span>
                    <button
                      onClick={() => deleteStudent(student.rollNo)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-lg mb-3">{student.name}</h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Roll No:</span> {student.rollNo}</p>
                    <p><span className="font-medium">Department:</span> {student.group.department}</p>
                    <p><span className="font-medium">Batch:</span> {student.group.batch}</p>
                    <p><span className="font-medium">Class:</span> {student.group.class}</p>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Added to {student.group.department} • {student.group.batch}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}