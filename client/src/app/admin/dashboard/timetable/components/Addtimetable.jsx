'use client';

import { useState } from 'react';
import { X, Clock, Coffee, Trash2, Plus } from 'lucide-react';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AddTimetable({ closeModal }) {
  const [timetableName, setTimetableName] = useState('');
  const [collegeStartTime, setCollegeStartTime] = useState('');
  const [collegeEndTime, setCollegeEndTime] = useState('');
  const [entries, setEntries] = useState([]);

  const addPeriod = (afterIndex = null) => {
    const newPeriod = { type: 'period', startTime: '', endTime: '' };
    if (afterIndex === null) {
      setEntries(prev => [...prev, newPeriod]);
    } else {
      setEntries(prev => {
        const copy = [...prev];
        copy.splice(afterIndex + 1, 0, newPeriod);
        return copy;
      });
    }
  };

  const addBreak = (afterIndex) => {
    const newBreak = { type: 'break', name: 'Break', startTime: '', endTime: '' };
    setEntries(prev => {
      const copy = [...prev];
      copy.splice(afterIndex + 1, 0, newBreak);
      return copy;
    });
  };

  const updateEntry = (index, field, value) => {
    setEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeEntry = (index) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!timetableName || !collegeStartTime || !collegeEndTime) {
      alert('Please fill timetable name and college timings.');
      return;
    }
    if (entries.length === 0 || entries.some(e => !e.startTime || !e.endTime)) {
      alert('All periods and breaks must have start and end times.');
      return;
    }

    const payload = {
      timetableName,
      collegeStartTime,
      collegeEndTime,
      schedule: entries,
    };

    try {
      const response = await fetch(`${BASE_API_URL}/admin/timetable/add-timetable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Timetable created successfully!');
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Failed to create timetable: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating timetable:', error);
      alert('An error occurred while creating the timetable.');
    }
  };

  // Count periods and breaks for proper numbering
  const getPeriodNumber = (index) => {
    return entries.slice(0, index).filter(e => e.type === 'period').length + 1;
  };

  const getBreakNumber = (index) => {
    return entries.slice(0, index).filter(e => e.type === 'break').length + 1;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-black bg-opacity-60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeModal} aria-hidden="true" />

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Create Timetable</h2>
          <button
            onClick={closeModal}
            className="rounded-full p-2 hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Timetable Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={timetableName}
                onChange={(e) => setTimetableName(e.target.value)}
                required
                placeholder="e.g. Regular 2024-25"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                College Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={collegeStartTime}
                onChange={(e) => setCollegeStartTime(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                College End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={collegeEndTime}
                onChange={(e) => setCollegeEndTime(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Schedule Timeline</h3>
              <button
                type="button"
                onClick={() => addPeriod()}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Period
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No periods added yet</p>
                <p className="text-sm text-gray-500 mt-1">Click "Add Period" to start building the timetable</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex items-center gap-6">
                      {/* Full Text Label */}
                      <div className="w-40 text-left">
                        <span className="inline-block px-5 py-3 bg-blue-100 text-blue-800 font-semibold rounded-lg text-sm">
                          {entry.type === 'period' ? `Period ${getPeriodNumber(index)}` : `Break ${getBreakNumber(index)}`}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="">
                        {entry.type === 'period' ? (
                          <Clock className="h-8 w-8 text-green-600" />
                        ) : (
                          <Coffee className="h-8 w-8 text-orange-600" />
                        )}
                      </div>

                      {/* Input Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {entry.type === 'break' && (
                          <input
                            type="text"
                            value={entry.name || ''}
                            onChange={(e) => updateEntry(index, 'name', e.target.value)}
                            placeholder="e.g. Lunch Break"
                            className="rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        <input
                          type="time"
                          value={entry.startTime}
                          onChange={(e) => updateEntry(index, 'startTime', e.target.value)}
                          required
                          placeholder="Start"
                          className="rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="time"
                          value={entry.endTime}
                          onChange={(e) => updateEntry(index, 'endTime', e.target.value)}
                          required
                          placeholder="End"
                          className="rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {entry.type === 'period' && (
                          <button
                            type="button"
                            onClick={() => addBreak(index)}
                            className="px-5 py-2.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition font-medium"
                          >
                            + Add Break
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeEntry(index)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!timetableName || !collegeStartTime || !collegeEndTime || entries.length === 0}
              className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md"
            >
              Create Timetable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}