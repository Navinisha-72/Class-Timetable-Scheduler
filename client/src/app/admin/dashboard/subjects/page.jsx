'use client';

import { useState, useEffect } from 'react';
import AddSubjects from './components/AddSubjects';
import ViewSubjects from './components/ViewSubjects';
import DashboardLayout from '../../components/DashboardLayout';

export default function SubjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewSubjectsModalOpen, setViewSubjectsModalOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openViewSubjectsModal = (subjects) => {
    setSelectedSubjects(subjects);
    setViewSubjectsModalOpen(true);
  };

  const closeViewSubjectsModal = () => {
    setViewSubjectsModalOpen(false);
    setSelectedSubjects([]);
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subject/get-subjects`);
        const result = await response.json();
        if (result.success) {
          setSubjects(result.data);
        } else {
          console.error('Failed to fetch subjects:', result.message);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const deleteSubject = async (subjectId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subject/delete/${subjectId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setSelectedSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
      } else {
        console.error('Failed to delete subject:', result.message);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects Management</h1>
            <p className="text-gray-600 mt-1">
              Manage subjects by department, class, and semester.
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Subjects
          </button>
        </div>

        {/* Subjects List */}
        {loading ? (
          <p className="text-gray-600">Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p className="text-gray-600">No subjects available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subjectGroup) => (
              <div key={subjectGroup.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">{subjectGroup.department}</h2>
                <p className="text-sm text-gray-600">Class: {subjectGroup.class}</p>
                <p className="text-sm text-gray-600">Semester: {subjectGroup.semester}</p>
                <p className="text-sm text-gray-600">Total Subjects: {subjectGroup.totalSubjects}</p>
                <button
                  onClick={() => openViewSubjectsModal(subjectGroup.subjects)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Subjects
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Subjects Modal */}
        {isModalOpen && <AddSubjects closeModal={closeModal} />}

        {/* View Subjects Modal */}
        {viewSubjectsModalOpen && (
          <ViewSubjects
            subjects={selectedSubjects}
            closeModal={closeViewSubjectsModal}
            deleteSubject={deleteSubject}
          />
        )}
      </div>
    </DashboardLayout>
  );
}