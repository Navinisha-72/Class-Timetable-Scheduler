const { db } = require('../../config/firebaseAdmin');

const getClasses = async (req, res) => {
    try {
        const { department } = req.body;

        if (!department) {
            return res.status(400).json({ success: false, message: 'Department is required' });
        }

        const departmentSnapshot = await db.collection('departments').where('department.name', '==', department).get();

        if (departmentSnapshot.empty) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        const departmentData = departmentSnapshot.docs[0].data();
        const classes = departmentData.classes || [];

        return res.status(200).json({ success: true, classes });
    } catch (error) {
        console.error('Error fetching classes:', error);
        return res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

const addStudents = async (req, res) => {
    try {
        const { department, batch, class: className, totalStudents, students } = req.body;

        // Validate the payload
        if (!department || !batch || !className || !totalStudents || !Array.isArray(students) || students.some(s => !s.rollNo || !s.name)) {
            return res.status(400).json({ success: false, message: 'All fields are required and must be valid' });
        }

        const studentData = {
            department,
            batch,
            class: className,
            totalStudents: Number(totalStudents),
            students,
            createdAt: new Date().toISOString(),
        };

        // Use Firestore auto-generated ID
        const docRef = await db.collection('students').add(studentData);

        return res.status(201).json({ success: true, message: 'Students added successfully', id: docRef.id });
    } catch (error) {
        console.error('Error adding students:', error);
        return res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const studentsSnapshot = await db.collection('students').get();
        const students = studentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
};

const deleteStudentByRollNo = async (req, res) => {
    const { rollNo } = req.params;

    try {
        const studentsRef = db.collection('students');
        const snapshot = await studentsRef.get();

        let studentFound = false;

        snapshot.forEach(async (doc) => {
            const studentData = doc.data();
            const updatedStudents = studentData.students.filter((student) => student.rollNo !== rollNo);

            if (updatedStudents.length !== studentData.students.length) {
                studentFound = true;
                await doc.ref.update({
                    students: updatedStudents,
                    totalStudents: updatedStudents.length,
                });
            }
        });

        if (!studentFound) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ success: false, message: 'Failed to delete student' });
    }
};

module.exports = { getClasses, addStudents, getStudents, deleteStudentByRollNo };