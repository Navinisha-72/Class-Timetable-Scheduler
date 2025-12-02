'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Building2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import AddDepartment from './components/AddDepartments';

export default function DepartmentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);

  const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/admin/department/get-departments`);
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.departments || []);
        } else {
          console.error('Failed to fetch departments');
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, [BASE_API_URL]);

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) =>
      dept.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.department.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-1">
            Manage departments, view stats, and organize faculty & students
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-6 py-2 text-sm font-medium rounded-t-lg border-b-4 focus:outline-none transition-colors ${
              activeTab === 'departments'
                ? 'text-blue-600 border-blue-600 bg-blue-50'
                : 'text-gray-600 border-transparent hover:text-blue-500 hover:bg-gray-100'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('addDepartment')}
            className={`px-6 py-2 text-sm font-medium rounded-t-lg border-b-4 focus:outline-none transition-colors ${
              activeTab === 'addDepartment'
                ? 'text-blue-600 border-blue-600 bg-blue-50'
                : 'text-gray-600 border-transparent hover:text-blue-500 hover:bg-gray-100'
            }`}
          >
            Add Department
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'departments' && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search departments by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <div
                    key={dept.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{dept.department.name}</h3>
                          <p className="text-sm text-gray-500">Code: {dept.department.code}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Classes</span>
                        <span className="font-medium text-gray-900">{dept.totalClasses}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Labs</span>
                        <span className="font-medium text-gray-900">{dept.totalLabs}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">Classes:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {dept.classes.map((cls, index) => (
                          <li key={index}>{cls.name} (Room {cls.number})</li>
                        ))}
                      </ul>
                      <h4 className="text-sm font-medium text-gray-700 mt-2">Labs:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {dept.labs.map((lab, index) => (
                          <li key={index}>{lab.name} (Lab {lab.number})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No departments found matching your search.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'addDepartment' && <AddDepartment />}
      </div>
    </DashboardLayout>
  );
}