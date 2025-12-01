'use client';

import { useState, useEffect } from 'react';
import AddTimetable from './components/Addtimetable';
import ViewTimetable from './components/ViewTimetable';
import DashboardLayout from '../../components/DashboardLayout';

const formatTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default function TimetablePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimetable, setSelectedTimetable] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openViewModal = (timetable) => {
    setSelectedTimetable(timetable);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedTimetable(null);
    setIsViewModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this timetable?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/timetable/delete/${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          alert('Timetable deleted successfully');
          setTimetables((prev) => prev.filter((timetable) => timetable.id !== id));
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
    const fetchTimetables = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/timetable/get-timetables`);
        const result = await response.json();
        if (result.success) {
          setTimetables(result.data);
        } else {
          console.error('Failed to fetch timetables:', result.message);
        }
      } catch (error) {
        console.error('Error fetching timetables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
            <p className="text-gray-600 mt-1">
              Manage timetables for classes and periods.
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Timetable
          </button>
        </div>

        {/* Timetables List */}
        {loading ? (
          <p className="text-gray-600">Loading timetables...</p>
        ) : timetables.length === 0 ? (
          <p className="text-gray-600">No timetables available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetables.map((timetable) => (
              <div key={timetable.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">{timetable.id}</h2>
                <p className="text-sm text-gray-600">Start Time: {formatTime(timetable.collegeStartTime)}</p>
                <p className="text-sm text-gray-600">End Time: {formatTime(timetable.collegeEndTime)}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openViewModal(timetable)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(timetable.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Timetable Modal */}
        {isModalOpen && <AddTimetable closeModal={closeModal} />}

        {/* View Timetable Modal */}
        {isViewModalOpen && selectedTimetable && (
          <ViewTimetable timetable={selectedTimetable} closeModal={closeViewModal} />
        )}
      </div>
    </DashboardLayout>
  );
}