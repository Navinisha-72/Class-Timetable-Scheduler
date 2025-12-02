'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, Building2, Home, FlaskConical } from 'lucide-react';
import Link from 'next/link';

export default function AddDepartment() {
  // ──────────────────────────────────────────────────────
  // Form State
  // ──────────────────────────────────────────────────────
  const [deptOption, setDeptOption] = useState('existing');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [totalClasses, setTotalClasses] = useState('');
  const [totalLabs, setTotalLabs] = useState('');

  // Dynamic fields
  const [classes, setClasses] = useState([]); // renamed from "rooms"
  const [labs, setLabs] = useState([]);

  const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ──────────────────────────────────────────────────────
  // Sample Departments (Replace with API later)
  // ──────────────────────────────────────────────────────
  const existingDepartments = [
    { id: '1', name: 'B.Tech Information Technology', code: 'IT' },
    { id: '2', name: 'B.E Computer Science', code: 'CSE' },
    { id: '3', name: 'B.E Electronics and Communication Engineering', code: 'ECE' },
    { id: '4', name: 'B.Tech Artificial Intelligence and Data Science', code: 'AIDS' },
    { id: '5', name: 'B.Tech Computer Science and Business Systems', code: 'CSBS' },
    { id: '6', name: 'B.E Mechanical Engineering', code: 'ME' },
  ];


  // ──────────────────────────────────────────────────────
  // Update Helpers
  // ──────────────────────────────────────────────────────
  const updateClass = (index, field, value) => {
    const updated = [...classes];
    updated[index][field] = value;
    setClasses(updated);
  };

  const updateLab = (index, field, value) => {
    const updated = [...labs];
    updated[index][field] = value;
    setLabs(updated);
  };

  // ──────────────────────────────────────────────────────
  // Sync dynamic arrays with totals
  // ──────────────────────────────────────────────────────
  useEffect(() => {
    const classCount = Number(totalClasses) || 0;
    setClasses(prev => {
      const updated = [...prev];
      while (updated.length < classCount) updated.push({ name: '', number: '' });
      updated.length = classCount; // truncate if reduced
      return updated;
    });
  }, [totalClasses]);

  useEffect(() => {
    const labCount = Number(totalLabs) || 0;
    setLabs(prev => {
      const updated = [...prev];
      while (updated.length < labCount) updated.push({ name: '', number: '' });
      updated.length = labCount;
      return updated;
    });
  }, [totalLabs]);

  // ──────────────────────────────────────────────────────
  // Form Validation
  // ──────────────────────────────────────────────────────
  const isFormValid = () => {
    if (!selectedDeptId) return false; // Updated validation
    if (!totalClasses || !totalLabs) return false;

    // If classes/labs count > 0 → all fields must be filled
    const classesValid = classes.length === 0 || classes.every(c => c.name.trim() && c.number.trim());
    const labsValid = labs.length === 0 || labs.every(l => l.name.trim() && l.number.trim());

    return classesValid && labsValid;
  };

  // ──────────────────────────────────────────────────────
  // Submit Handler
  // ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const department = existingDepartments.find(d => d.id === selectedDeptId);

    const payload = {
      department,
      totalClasses: Number(totalClasses),
      totalLabs: Number(totalLabs),
      classes,
      labs,
    };

    try {
      const res = await fetch(`${BASE_API_URL}/admin/department/add-department`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Department added successfully!');
        // Optional: reset form or redirect
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to save'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  // ──────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-2 bg-gray-50 min-h-screen text-black">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8">

        {/* Department Selection */}
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            Department
          </h2>

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Department --</option>
            {existingDepartments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </section>

        {/* Capacity */}
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-5">Capacity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Total Classes</label>
              <input
                type="number"
                min="0"
                value={totalClasses}
                onChange={(e) => setTotalClasses(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Total Labs</label>
              <input
                type="number"
                min="0"
                value={totalLabs}
                onChange={(e) => setTotalLabs(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Classes List */}
        {(totalClasses > 0) && (
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
              <Home className="h-6 w-6 text-blue-600" />
              Classes ({classes.length})
            </h2>
            <div className="space-y-4">
              {classes.map((cls, i) => (
                <div key={i} className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Class name (e.g., First Year A)"
                    value={cls.name}
                    onChange={(e) => updateClass(i, 'name', e.target.value)}
                    className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Room No."
                    value={cls.number}
                    onChange={(e) => updateClass(i, 'number', e.target.value)}
                    className="w-32 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Labs List */}
        {(totalLabs > 0) && (
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
              <FlaskConical className="h-6 w-6 text-blue-600" />
              Labs ({labs.length})
            </h2>
            <div className="space-y-4">
              {labs.map((lab, i) => (
                <div key={i} className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Lab name (e.g., Chemistry Lab)"
                    value={lab.name}
                    onChange={(e) => updateLab(i, 'name', e.target.value)}
                    className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Lab No."
                    value={lab.number}
                    onChange={(e) => updateLab(i, 'number', e.target.value)}
                    className="w-32 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-6">
          <Link href="/dashboard/departments" className="px-6 py-3 border rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!isFormValid()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Department
          </button>
        </div>
      </form>
    </div>
  );
}