'use client';

import { useState, useEffect } from 'react';
import ViewFacultyTimetable from './components/ViewFacultyTimetable';

export default function FacultyDashboard() {
  const [facultyList, setFacultyList] = useState([]); // [[name - dept, periods[]], ...]
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

        // Build faculty → list of periods
        const facultyMap = new Map(); // key: "Handler - Department"

        data.forEach((timetable) => {
          const dept = timetable.department;
          timetable.generatedTimetable.days.forEach((day) => {
            Object.entries(day.periods).forEach(([time, period]) => {
              if (period.handler && !period.isBreak) {
                const key = `${period.handler} - ${dept}`;
                if (!facultyMap.has(key)) facultyMap.set(key, []);
                facultyMap.get(key).push({
                  day: day.day,
                  time,
                  ...period,
                });
              }
            });
          });
        });

        // Convert to array and sort by handler name
        const list = Array.from(facultyMap.entries()).sort((a, b) =>
          a[0].localeCompare(b[0])
        );

        setFacultyList(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openFacultyTimetable = (facultyKey) => {
    const periods = facultyList.find(([key]) => key === facultyKey)?.[1] || [];

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

    const [handler, department] = facultyKey.split(' - ');

    setSelectedTimetable({
      generatedTimetable: { days: reconstructedDays },
      department,
      facultyName: handler,
      semester: 'All Semesters', // or extract if available
      class: 'Faculty',
    });

    setShowTimetableModal(true);
  };

  const closeModal = () => {
    setShowTimetableModal(false);
    setSelectedTimetable(null);
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading faculty timetables...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Faculty Timetables</h1>

      {facultyList.length === 0 ? (
        <p className="text-center text-gray-500">No faculty timetables found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {facultyList.map(([facultyKey]) => {
            const [name, dept] = facultyKey.split(' - ');
            return (
              <div
                key={facultyKey}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                <p className="text-sm text-gray-600 mt-1">{dept}</p>
                <button
                  onClick={() => openFacultyTimetable(facultyKey)}
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
        <ViewFacultyTimetable timetable={selectedTimetable} closeModal={closeModal} />
      )}
    </div>
  );
}