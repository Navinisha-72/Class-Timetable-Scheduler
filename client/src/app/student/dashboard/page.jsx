'use client';

import { useState, useEffect } from 'react';
import ViewStudentTimetable from './components/ViewStudentTimetable';

export default function StudentDashboard() {
  const [studentList, setStudentList] = useState([]); // [[name - dept, periods[]], ...]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/generate/get-generated-timetable`);
        if (!response.ok) throw new Error('Failed to fetch timetables');

        const { data } = await response.json();

        // Build student → list of periods
        const studentMap = new Map(); // key: "Student - Department"

        data.forEach((timetable) => {
          const dept = timetable.department;
          timetable.generatedTimetable.days.forEach((day) => {
            Object.entries(day.periods).forEach(([time, period]) => {
              if (period.handler && !period.isBreak) {
                const key = `${period.handler} - ${dept}`;
                if (!studentMap.has(key)) studentMap.set(key, []);
                studentMap.get(key).push({
                  day: day.day,
                  time,
                  ...period,
                });
              }
            });
          });
        });

        // Convert to array and sort by student name
        const list = Array.from(studentMap.entries()).sort((a, b) =>
          a[0].localeCompare(b[0])
        );

        setStudentList(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openStudentTimetable = (studentKey) => {
    const periods = studentList.find(([key]) => key === studentKey)?.[1] || [];

    // Reconstruct full 6-day timetable with empty slots
    const daysMap = {
      Monday: {},
      Tuesday: {},
      Wednesday: {},
      Thursday: {},
      Friday: {},
      Saturday: {},
    };

    // Get all unique time slots
    const allTimes = new Set();
    periods.forEach((p) => allTimes.add(p.time));

    // Initialize empty structure
    allTimes.forEach((time) => {
      Object.keys(daysMap).forEach((day) => {
        if (!daysMap[day][time]) {
          daysMap[day][time] = { isBreak: false, code: '', name: '', handler: '' };
        }
      });
    });

    // Fill actual classes
    periods.forEach((p) => {
      if (!daysMap[p.day]) {
        daysMap[p.day] = {};
      }
      if (!daysMap[p.day][p.time]) {
        daysMap[p.day][p.time] = { isBreak: false, code: '', name: '', handler: '' };
      }
      daysMap[p.day][p.time] = {
        isBreak: false,
        code: p.code || '',
        name: p.name || '',
        handler: p.handler || '',
      };
    });

    // Convert to array format expected by modal
    const reconstructedDays = Object.entries(daysMap).map(([day, periods]) => ({
      day,
      periods,
    }));

    const [handler, department] = studentKey.split(' - ');

    setSelectedTimetable({
      generatedTimetable: { days: reconstructedDays },
      department,
      studentName: handler,
      semester: 'All Semesters', // or extract if available
      class: 'Student',
    });

    setShowTimetableModal(true);
  };

  const closeModal = () => {
    setShowTimetableModal(false);
    setSelectedTimetable(null);
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading student timetables...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Timetables</h1>

      {studentList.length === 0 ? (
        <p className="text-center text-gray-500">No student timetables found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {studentList.map(([studentKey]) => {
            const [name, dept] = studentKey.split(' - ');
            return (
              <div
                key={studentKey}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                <p className="text-sm text-gray-600 mt-1">{dept}</p>
                <button
                  onClick={() => openStudentTimetable(studentKey)}
                  className="mt-5 w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  View Timetable
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showTimetableModal && selectedTimetable && (
        <ViewStudentTimetable timetable={selectedTimetable} closeModal={closeModal} />
      )}
    </div>
  );
}