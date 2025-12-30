'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, Users, Clock, Sparkles, Save, Zap } from 'lucide-react';

const formatTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default function GenerateTimetable({ closeModal }) {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTimetableId, setSelectedTimetableId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allSubjectsData, setAllSubjectsData] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatedData, setGeneratedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [useConstraintSolver, setUseConstraintSolver] = useState(false); // NEW: Toggle for CP-SAT
  const [generating, setGenerating] = useState(false); // NEW: Loading state for generation

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/generate/get-student-details`);
        const result = await res.json();
        if (result.success) {
          const { subjects, timetables } = result.data;
          setAllSubjectsData(subjects);
          setTimetables(timetables);
          setDepartments([...new Set(subjects.map(s => s.department))]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDepartment) {
      setSemesters([]); setClasses([]); setSelectedSemester(''); setSelectedClass('');
      return;
    }
    const filtered = allSubjectsData.filter(s => s.department === selectedDepartment);
    setSemesters([...new Set(filtered.map(s => s.semester))]);
    setClasses([...new Set(filtered.map(s => s.class))]);
  }, [selectedDepartment, allSubjectsData]);

  useEffect(() => {
    if (selectedDepartment && selectedSemester && selectedClass) {
      const match = allSubjectsData.find(s =>
        s.department === selectedDepartment &&
        s.semester === selectedSemester &&
        s.class === selectedClass
      );
      setSubjects(match?.subjects || []);
    } else {
      setSubjects([]);
    }
  }, [selectedDepartment, selectedSemester, selectedClass, allSubjectsData]);

  const handleTemplateChange = (id) => {
    setSelectedTimetableId(id);
    const template = timetables.find(t => t.id === id);
    setSelectedTimetable(template || null);
  };

  // NEW: CP-SAT Constraint-based generation
  const handleConstraintGenerate = async () => {
    if (!selectedDepartment || !selectedSemester || !selectedClass || subjects.length === 0) {
      alert('Please complete all fields');
      return;
    }

    setGenerating(true);
    try {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const allSlots = selectedTimetable?.schedule || [];
      
      // Extract periods
      const periods = [];
      allSlots.forEach(slot => {
        if (slot.type === 'period') {
          periods.push(slot.startTime);
        }
      });

      // Prepare payload for CP-SAT solver
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/generate/generate-optimized`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: selectedDepartment,
            semester: selectedSemester,
            class: selectedClass,
            subjects,
            periods,
            days,
            constraints: {
              facultyConstraints: true,
              roomConstraints: true,
              balanceDays: true,
            }
          })
        }
      );

      const result = await response.json();
      if (result.success) {
        // Transform CP-SAT grid to display format
        const grid = days.map(day => {
          const row = { day };
          allSlots.forEach(slot => {
            if (slot.type === 'period') {
              row[slot.startTime] = result.data.grid[day]?.[slot.startTime] || null;
            } else {
              row[slot.startTime] = { isBreak: true, name: slot.name };
            }
          });
          return row;
        });

        setGeneratedData({
          title: `Generated Timetable (CP-SAT) - ${selectedDepartment} Section ${selectedClass.charAt(0)}`,
          template: selectedTimetable,
          allSlots,
          grid,
          subjects,
          selectedClass,
          selectedSemester,
          selectedDepartment,
          method: result.data.method
        });
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error generating optimized timetable:', error);
      alert('Failed to generate timetable with constraint solver');
    } finally {
      setGenerating(false);
    }
  };

  // ORIGINAL: Random generation
  const handleGenerate = () => {
    if (!selectedDepartment || !selectedSemester || !selectedClass || !selectedTimetableId || subjects.length === 0) {
      alert('Please complete all fields');
      return;
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const allSlots = selectedTimetable.schedule;
    const periods = [];
    days.forEach(day => {
      allSlots.forEach(slot => {
        if (slot.type === 'period') {
          periods.push({ day, startTime: formatTime(slot.startTime) });
        }
      });
    });

    const subjectPool = [];
    for (let i = 0; i < 50; i++) {
      subjectPool.push(...subjects);
    }

    const shuffle = (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const shuffledSubjects = shuffle(subjectPool);
    const assignmentMap = {};
    periods.forEach((period, index) => {
      const subject = shuffledSubjects[index % shuffledSubjects.length];
      const key = `${period.day}-${period.startTime}`;
      assignmentMap[key] = subject;
    });

    const grid = days.map(day => {
      const row = { day };
      allSlots.forEach(slot => {
        if (slot.type === 'period') {
          const key = `${day}-${formatTime(slot.startTime)}`;
          row[slot.startTime] = assignmentMap[key];
        } else {
          row[slot.startTime] = { isBreak: true, name: slot.name };
        }
      });
      return row;
    });

    setGeneratedData({
      title: `Generated Timetable - ${selectedDepartment} Section ${selectedClass.charAt(0)}`,
      template: selectedTimetable,
      allSlots,
      grid,
      subjects,
      selectedClass,
      selectedSemester,
      selectedDepartment,
      method: 'Random Shuffle'
    });
  };

  // NEW: Validate timetable constraints
  const handleValidateConstraints = async () => {
    if (!generatedData) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/generate/validate-constraints`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timetableGrid: generatedData.grid.reduce((acc, row) => {
              acc[row.day] = row;
              return acc;
            }, {}),
            constraints: {
              noFacultyConflicts: true,
              noRoomConflicts: true
            }
          })
        }
      );

      const result = await response.json();
      if (result.isValid) {
        alert('✓ All constraints satisfied! Safe to save.');
      } else {
        alert(`⚠ Found ${result.violations.length} constraint violation(s):\n\n${result.violations.map(v => v.message).join('\n')}`);
      }
    } catch (error) {
      console.error('Error validating constraints:', error);
      alert('Failed to validate constraints');
    }
  };

  // Save function
  const handleSave = async () => {
    if (!generatedData) return;

    setSaving(true);

    const payload = {
      department: generatedData.selectedDepartment,
      semester: generatedData.selectedSemester,
      class: generatedData.selectedClass,
      timetableTemplate: selectedTimetableId,
      generatedTimetable: {
        generatedAt: new Date().toISOString(),
        method: generatedData.method,
        days: generatedData.grid.map((row) => {
          const dayData = { day: row.day, periods: {} };
          Object.keys(row).forEach((key) => {
            if (key !== 'day') {
              const cellData = row[key];
              if (cellData?.isBreak) {
                dayData.periods[key] = {
                  isBreak: true,
                  name: cellData.name,
                };
              } else if (cellData) {
                dayData.periods[key] = {
                  name: cellData.name,
                  code: cellData.code,
                  handler: cellData.handler,
                  department: cellData.department,
                };
              }
            }
          });
          return dayData;
        }),
      },
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/generate/save-timetable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert('Timetable saved successfully!');
        closeModal();
      } else {
        alert('Failed to save timetable: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Error saving timetable. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderTimetable = () => {
    if (!generatedData) return null;
    const { allSlots, grid, title, selectedClass, selectedSemester, selectedDepartment, method } = generatedData;
    const colors = ['bg-blue-50', 'bg-emerald-50', 'bg-amber-50', 'bg-rose-50', 'bg-purple-50', 'bg-cyan-50'];
    const textColors = ['text-blue-900', 'text-emerald-900', 'text-amber-900', 'text-rose-900', 'text-purple-900', 'text-cyan-900'];

    return (
      <div className="mt-6 -mx-6 px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header with Class & Semester */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium text-gray-300">{method.toUpperCase()}</span>
            </div>
            <div className="mt-2 text-sm opacity-90">
              <span className="font-medium">{selectedClass}</span> • Semester {selectedSemester} • {selectedDepartment}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-gray-800 sticky left-0 bg-gray-50 z-10">Day</th>
                  {allSlots.map((slot, i) => (
                    <th key={i} className="px-3 py-2 text-center font-medium text-gray-700 min-w-[110px]">
                      <div className="text-xs font-bold">{slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((row, dayIdx) => (
                  <tr key={dayIdx} className="border-b border-gray-100 hover:bg-gray-25">
                    <td className="px-3 py-2 font-semibold text-gray-800 sticky left-0 bg-white text-xs">
                      {row.day.slice(0, 3)}
                    </td>
                    {allSlots.map((slot, colIdx) => {
                      const cellData = row[slot.startTime];
                      const colorClass = colors[colIdx % colors.length];
                      const textClass = textColors[colIdx % textColors.length];
                      if (cellData?.isBreak) {
                        return (
                          <td key={colIdx} className="px-3 py-2 text-center border-l border-gray-100 bg-orange-50">
                            <span className="inline-block px-2 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded">
                              {cellData.name}
                            </span>
                          </td>
                        );
                      }
                      if (cellData) {
                        return (
                          <td key={colIdx} className={`px-3 py-2 text-center border-l border-gray-100 ${colorClass}`}>
                            <div className={`font-bold text-xs ${textClass} leading-tight`}>
                              {cellData.code}
                            </div>
                            <div className="text-xs text-gray-700 font-medium mt-0.5">
                              {cellData.name}
                            </div>
                            <div className="text-xs text-gray-600 opacity-80">
                              {cellData.handler}
                            </div>
                          </td>
                        );
                      }
                      return <td key={colIdx} className="px-3 py-2 border-l border-gray-100"></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const isFormComplete = selectedDepartment && selectedSemester && selectedClass && selectedTimetableId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md text-black bg-opacity-40">
      <div className="absolute inset-0" onClick={closeModal} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 flex justify-between items-center px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Generate Timetable</h2>
            <p className="text-xs text-gray-500">Select details to generate schedule</p>
          </div>
          <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-5">
          {/* Method Selector - NEW */}
          <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useConstraintSolver}
                onChange={(e) => {
                  setUseConstraintSolver(e.target.checked);
                  setGeneratedData(null); // Reset generated data when switching
                }}
                className="w-4 h-4 accent-slate-900"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900">Use CP-SAT Constraint Solver</span>
                <p className="text-xs text-gray-600">Automatically avoids faculty and room conflicts</p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Users className="w-3.5 h-3.5" /> Department <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-700 bg-white"
              >
                <option value="" disabled>Select Department</option>
                {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={!selectedDepartment}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-700 disabled:bg-gray-50"
              >
                <option value="" disabled>Select Semester</option>
                {semesters.map((s, i) => <option key={i} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Class <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedDepartment}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-700 disabled:bg-gray-50"
              >
                <option value="" disabled>Select Class</option>
                {classes.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Clock className="w-3.5 h-3.5" /> Template <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTimetableId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-700 bg-white"
              >
                <option value="" disabled>Select Template</option>
                {timetables.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id} ({t.collegeStartTime} - {t.collegeEndTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderTimetable()}

          <div className="flex flex-wrap justify-end gap-3 mt-6 mb-4">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium"
            >
              Cancel
            </button>

            {useConstraintSolver ? (
              <button
                onClick={handleConstraintGenerate}
                disabled={!isFormComplete || generating}
                className="px-5 py-2 text-sm bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                {generating ? 'Generating...' : generatedData ? 'Regenerate (CP-SAT)' : 'Generate (CP-SAT)'}
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!isFormComplete}
                className="px-5 py-2 text-sm bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generatedData ? 'Regenerate' : 'Generate'}
              </button>
            )}

            {generatedData && (
              <>
                <button
                  onClick={handleValidateConstraints}
                  className="px-4 py-2 text-sm border border-blue-300 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100"
                >
                  Validate
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-sm bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Timetable'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}