'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const departments = [
	{ id: '1', name: 'B.Tech Information Technology', code: 'IT' },
	{ id: '2', name: 'B.E Computer Science', code: 'CSE' },
	{ id: '3', name: 'B.E Electronics and Communication Engineering', code: 'ECE' },
	{ id: '4', name: 'B.Tech Artificial Intelligence and Data Science', code: 'AIDS' },
	{ id: '5', name: 'B.Tech Computer Science and Business Systems', code: 'CSBS' },
	{ id: '6', name: 'Mechanical', code: 'ME' },
];

export default function AddFaculties({ departmentData }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [hodName, setHodName] = useState('');
	const [totalFaculties, setTotalFaculties] = useState('');
	const [faculties, setFaculties] = useState([]);
	const [selectedDepartment, setSelectedDepartment] = useState('');

	useEffect(() => {
		if (selectedDepartment) {
			const department = departmentData.find(dept => dept.department === selectedDepartment);
			if (department) {
				setHodName(department.hodName || '');
				setTotalFaculties(department.faculties.length);
				setFaculties(department.faculties);
			}
		}
	}, [selectedDepartment, departmentData]);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => {
		setIsModalOpen(false);
		setHodName('');
		setTotalFaculties('');
		setFaculties([]);
		setSelectedDepartment('');
	};

	const generateRandomId = () => {
		return `FAC${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
	};

	const handleTotalFacultiesChange = (value) => {
		setTotalFaculties(value);
		const count = Number(value);
		if (count >= 0) {
			const updated = [...faculties];
			while (updated.length < count) updated.push({ name: '', role: '', id: generateRandomId() });
			while (updated.length > count) updated.pop();
			setFaculties(updated);
		}
	};

	const updateFaculty = (index, field, value) => {
		const updated = [...faculties];
		updated[index][field] = value;
		setFaculties(updated);
	};

	const handleSubmit = async () => {
		if (!selectedDepartment || !hodName || faculties.some(f => !f.name || !f.role)) {
			alert('Please fill all fields correctly.');
			return;
		}

		const payload = {
			department: selectedDepartment,
			hodName,
			totalFaculties: Number(totalFaculties),
			faculties,
		};

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/faculty/add-faculty`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				alert('Faculty added successfully!');
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
		<div>
			{/* Add Faculties Button */}
			<button
				onClick={openModal}
				className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
			>
				<Plus className="h-5 w-5" /> Add Faculties
			</button>

			{/* Modal */}
			{isModalOpen && (
				<div className=" text-black fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
						{/* Close Button */}
						<button
							onClick={closeModal}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
						>
							<X className="h-5 w-5" />
						</button>

						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Add Faculties
						</h2>

						{/* Select Department Dropdown */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Select Department
							</label>
							<select
								value={selectedDepartment}
								onChange={(e) => setSelectedDepartment(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							>
								<option value="" disabled>
									Select a department
								</option>
								{departments.map((dept) => (
									<option key={dept.id} value={dept.name}>
										{dept.name}
									</option>
								))}
							</select>
						</div>

						{/* HOD Name */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								HOD Name
							</label>
							<input
								type="text"
								value={hodName}
								onChange={(e) => setHodName(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								placeholder="Enter HOD Name"
							/>
						</div>

						{/* Total Faculties */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Total No of Faculties
							</label>
							<input
								type="number"
								min="0"
								value={totalFaculties}
								onChange={(e) =>
									handleTotalFacultiesChange(e.target.value)
								}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								placeholder="Enter Total Faculties"
							/>
						</div>

						{/* Faculty Name & Role */}
						{faculties.map((faculty, index) => (
							<div key={index} className="flex gap-4 mb-3">
								<input
									type="text"
									value={faculty.name}
									onChange={(e) => updateFaculty(index, 'name', e.target.value)}
									className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									placeholder="Faculty Name"
								/>
								<input
									type="text"
									value={faculty.role}
									onChange={(e) => updateFaculty(index, 'role', e.target.value)}
									className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									placeholder="Faculty Role"
								/>
								<input
									type="text"
									value={faculty.id}
									readOnly
									className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500"
									placeholder="Faculty ID"
								/>
							</div>
						))}

						{/* Submit Button */}
						<div className="flex justify-end mt-6">
							<button
								onClick={handleSubmit}
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
							>
								Submit
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}