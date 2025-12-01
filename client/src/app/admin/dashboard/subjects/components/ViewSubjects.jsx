import { useEffect } from 'react';

export default function ViewSubjects({ subjects, closeModal, deleteSubject }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [closeModal]);

  return (
    <div className="fixed inset-0 backdrop-blur-md text-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-4xl p-6 relative">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Subjects</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Subject Name</th>
              <th className="border border-gray-300 px-4 py-2">Subject Code</th>
              <th className="border border-gray-300 px-4 py-2">Handler</th>
              <th className="border border-gray-300 px-4 py-2">Department</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.code}>
                <td className="border border-gray-300 px-4 py-2">{subject.name}</td>
                <td className="border border-gray-300 px-4 py-2">{subject.code}</td>
                <td className="border border-gray-300 px-4 py-2">{subject.handler}</td>
                <td className="border border-gray-300 px-4 py-2">{subject.department}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={() => deleteSubject(subject.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}