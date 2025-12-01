'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function AddSubjects({ closeModal }) {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [totalSubjects, setTotalSubjects] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [facultyData, setFacultyData] = useState({});

  // Sample data - replace with API fetch in real app
  const departments = [
    { id: '1', name: 'B.Tech Information Technology', code: 'IT' },
    { id: '2', name: 'B.E Computer Science', code: 'CSE' },
    { id: '3', name: 'B.E Electronics and Communication Engineering', code: 'ECE' },
    { id: '4', name: 'B.Tech Artificial Intelligence and Data Science', code: 'AIDS' },
    { id: '5', name: 'B.Tech Computer Science and Business Systems', code: 'CSBS' },
    { id: '6', name: 'Mechanical', code: 'ME' },
  ];

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/faculty/get-all-faculties`);
        if (response.ok) {
          const data = await response.json();
          setFacultyData(data.departments || {});
        } else {
          console.error('Failed to fetch faculties');
        }
      } catch (error) {
        console.error('Error fetching faculties:', error);
      }
    };

    fetchFaculties();
  }, []);

  const handleTotalSubjectsChange = (value) => {
    const count = parseInt(value, 10);
    if (isNaN(count) || count < 0) {
      setTotalSubjects('');
      setSubjects([]);
      return;
    }
    setTotalSubjects(value);
    setSubjects((prev) => {
      const newArr = [...prev];
      while (newArr.length < count) {
        newArr.push({
          name: '',
          code: '',
          handler: '',
        });
      }
      newArr.length = count;
      return newArr;
    });
  };

  // Updated updateSubject to include department based on selected handler
  const updateSubject = (index, field, value) => {
    setSubjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // If the handler is updated, set the department based on the selected faculty
      if (field === 'handler') {
        const department = Object.entries(facultyData).find(([dept, { faculties }]) =>
          faculties.some((faculty) => faculty.name === value)
        )?.[0] || '';
        updated[index].department = department;
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = selectedDepartment && selectedClass && selectedSemester && totalSubjects > 0 &&
      subjects.every(s => s.name && s.code && s.handler);

    if (!isValid) {
      alert('Please fill all required fields including subject details.');
      return;
    }

    const payload = {
      department: selectedDepartment,
      class: selectedClass,
      semester: selectedSemester,
      totalSubjects: Number(totalSubjects),
      subjects,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subject/add-subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Subjects added successfully!');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-60 text-black">
      <div className="absolute inset-0" onClick={closeModal} aria-hidden="true" />

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Add Subjects</h2>
          <button
            onClick={closeModal}
            className="rounded-full p-2 hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">
          {/* Row 1: Department + Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>Select Class</option>
                <option>First Year</option>
                <option>Second Year</option>
                <option>Third Year</option>
                <option>Final Year</option>
              </select>
            </div>
          </div>

          {/* Row 2: Semester + Total Subjects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>Select Semester</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Total Number of Subjects <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={totalSubjects}
                onChange={(e) => handleTotalSubjectsChange(e.target.value)}
                required
                placeholder="e.g. 6"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Max 15 subjects allowed</p>
            </div>
          </div>

          {/* Dynamic Subject Fields */}
          {totalSubjects > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-5">
                Subject Details ({subjects.length})
              </h3>

              <div className="space-y-6">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="space-y-4">
                      {/* Subject Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Subject Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(index, 'name', e.target.value)}
                          required
                          placeholder="e.g. Operating Systems"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Subject Code + Faculty Handler */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Subject Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={subject.code}
                            onChange={(e) => updateSubject(index, 'code', e.target.value)}
                            required
                            placeholder="e.g. CS301"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Faculty Handler <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={subject.handler}
                            onChange={(e) => updateSubject(index, 'handler', e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="" disabled>Select Faculty</option>
                            {Object.entries(facultyData).map(([department, { faculties }]) => (
                              <optgroup key={department} label={department}>
                                {faculties.map((faculty, idx) => (
                                  <option key={idx} value={faculty.name}>{faculty.name}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>
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
              disabled={!totalSubjects || subjects.length === 0 || subjects.some(s => !s.name || !s.code || !s.handler)}
              className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
            >
              Save All Subjects
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}