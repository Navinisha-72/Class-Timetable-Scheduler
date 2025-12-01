'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Eye, AlertCircle, Plus } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import TimetableDetailsModal from './components/TimetableDetailsModal';
import GenerateTimetable from './components/GenerateTimetable';

export default function GenerateTimetablePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [timetableData, setTimetableData] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [filters, setFilters] = useState({ department: '', class: '', semester: '' });
  const [loading, setLoading] = useState(true);

  const openModal = (timetable) => {
    setSelectedTimetable(timetable);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTimetable(null);
    setIsModalOpen(false);
  };

  const openGenerateModal = () => {
    setIsGenerateModalOpen(true);
  };

  const closeGenerateModal = () => {
    setIsGenerateModalOpen(false);
    // Refresh timetable data after generation
    fetchTimetableData();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this timetable?')) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/generate/delete-timetable/${id}`,
          { method: 'DELETE' }
        );
        const result = await response.json();
        if (result.success) {
          alert('Timetable deleted successfully');
          setTimetableData((prev) => prev.filter((timetable) => timetable.id !== id));
        } else {
          alert('Failed to delete timetable');
        }
      } catch (error) {
        console.error('Error deleting timetable:', error);
        alert('An error occurred while deleting the timetable');
      }
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/generate/get-generated-timetable`
      );
      const result = await response.json();
      if (result.success) {
        setTimetableData(result.data);
      } else {
        console.error('Failed to fetch timetable data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimetables = timetableData.filter((timetable) => {
    const { department, class: className, semester } = filters;
    return (
      (!department || timetable.department.toLowerCase().includes(department.toLowerCase())) &&
      (!className || timetable.class.toLowerCase().includes(className.toLowerCase())) &&
      (!semester || timetable.semester.toString().includes(semester))
    );
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Generated Timetables</h1>
            <p className="text-sm text-gray-500">
              {filteredTimetables.length} timetable{filteredTimetables.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={openGenerateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Timetable</span>
          </button>
        </div>

        {/* Filters Section */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-black">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Department..."
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Class..."
                value={filters.class}
                onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Semester..."
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 text-sm">Loading timetables...</p>
            </div>
          </div>
        ) : filteredTimetables.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-sm">No timetables found</p>
              <p className="text-gray-500 text-xs mt-1">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTimetables.map((timetable) => (
              <div
                key={timetable.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden hover:border-blue-300"
              >
                {/* Card Header */}
                <div className="bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <h3 className="text-sm font-bold text-white truncate">
                    {timetable.department}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-3 space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Class
                      </span>
                      <span className="text-sm text-gray-700 font-medium">{timetable.class}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Semester
                      </span>
                      <span className="text-sm text-gray-700 font-medium">{timetable.semester}</span>
                    </div>
                  </div>

                  {/* Card Footer - Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openModal(timetable)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors group/btn"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleDelete(timetable.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors group/btn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedTimetable && (
          <TimetableDetailsModal
            timetable={selectedTimetable}
            closeModal={closeModal}
          />
        )}

        {/* Generate Timetable Modal */}
        {isGenerateModalOpen && (
          <GenerateTimetable closeModal={closeGenerateModal} />
        )}
      </div>
    </DashboardLayout>
  );
}

