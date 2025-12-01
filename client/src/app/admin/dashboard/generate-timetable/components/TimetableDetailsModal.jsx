import React from 'react';
import { X } from 'lucide-react';

const formatTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const TimetableDetailsModal = ({ timetable, closeModal }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md text-black bg-opacity-40">
      <div className="absolute inset-0" onClick={closeModal} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 flex justify-between items-center px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Timetable Details</h2>
          <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            {timetable.department} - {timetable.class} (Semester {timetable.semester})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Day</th>
                  {Object.keys(timetable.generatedTimetable.days[0].periods).map((time, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-center font-medium text-gray-700 min-w-[120px]"
                    >
                      {formatTime(time)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable.generatedTimetable.days.map((day, dayIndex) => (
                  <tr key={dayIndex} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {day.day}
                    </td>
                    {Object.entries(day.periods).map(([time, period], periodIndex) => (
                      <td
                        key={periodIndex}
                        className="px-4 py-3 text-center border-l border-gray-100"
                      >
                        {period.isBreak ? (
                          <span className="inline-block px-3 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded">
                            {period.name}
                          </span>
                        ) : (
                          <div>
                            <div className="font-bold text-xs text-gray-900">
                              {period.code}
                            </div>
                            <div className="text-xs text-gray-700">
                              {period.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {period.handler}
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableDetailsModal;
