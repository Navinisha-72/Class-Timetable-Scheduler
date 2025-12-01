'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddStudents({ closeModal }) {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [totalStudents, setTotalStudents] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Generate batch options (2021-2025 → 2030-2034, etc.)
  const batches = Array.from({ length: 10 }, (_, i) => {
    const start = 2021 + i;
    return `${start}-${start + 4}`;
  });

  const departments = [
    { id: '1', name: 'B.Tech Information Technology', code: 'IT' },
    { id: '2', name: 'B.E Computer Science', code: 'CSE' },
    { id: '3', name: 'B.E Electronics and Communication Engineering', code: 'ECE' },
    { id: '4', name: 'B.Tech Artificial Intelligence and Data Science', code: 'AIDS' },
    { id: '5', name: 'B.Tech Computer Science and Business Systems', code: 'CSBS' },
    { id: '6', name: 'Mechanical', code: 'ME' },
  ];

  const fetchClasses = async (department) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/student/get-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department }),
      });

      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to fetch classes'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    if (value) {
      fetchClasses(value);
    }
  };

  const handleTotalStudentsChange = (value) => {
    const count = parseInt(value, 10);
    if (isNaN(count) || count < 0) {
      setTotalStudents('');
      setStudents([]);
      return;
    }
    setTotalStudents(value);
    setStudents((prev) => {
      const updated = [...prev];
      while (updated.length < count) {
        updated.push({ rollNo: '', name: '' });
      }
      updated.length = count;
      return updated;
    });
  };

  const updateStudent = (index, field, value) => {
    setStudents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedDepartment || !selectedBatch || !selectedClass || !totalStudents) {
      alert('Please fill all selection fields.');
      return;
    }
    if (students.some(s => !s.rollNo.trim() || !s.name.trim())) {
      alert('Roll No and Name are required for all students.');
      return;
    }

    const payload = {
      department: selectedDepartment,
      batch: selectedBatch,
      class: selectedClass,
      totalStudents: Number(totalStudents),
      students,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/student/add-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Students added successfully!');
        closeModal();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to save'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-black bg-opacity-60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeModal} aria-hidden="true" />

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Add Students</h2>
          <button
            onClick={closeModal}
            className="rounded-full p-2 hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">
          {/* Row 1: Department + Batch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="" disabled>Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Batch <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="" disabled>Select Batch</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Class + Total Students */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Class / Section <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="" disabled>Select Class</option>
                {classes.length > 0 ? (
                  classes.map(cls => (
                    <option key={cls.name} value={cls.name}>{cls.name}</option>
                  ))
                ) : (
                  <option value="">No classes available</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Total Number of Students <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={totalStudents}
                onChange={(e) => handleTotalStudentsChange(e.target.value)}
                required
                placeholder="e.g. 65"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">Max 100 students at once</p>
            </div>
          </div>

          {/* Dynamic Student Fields */}
          {totalStudents > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-5">
                Student Details ({students.length} {students.length === 1 ? 'student' : 'students'})
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {students.map((student, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Roll No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={student.rollNo}
                        onChange={(e) => updateStudent(index, 'rollNo', e.target.value)}
                        required
                        placeholder="e.g. 22IT001"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Student Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => updateStudent(index, 'name', e.target.value)}
                        required
                        placeholder="e.g. Rahul Sharma"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 capitalize"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!totalStudents || students.length === 0 || students.some(s => !s.rollNo || !s.name)}
              className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
            >
              Save All Students
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}