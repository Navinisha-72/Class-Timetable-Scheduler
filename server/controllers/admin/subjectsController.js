const { db } = require('../../config/firebaseAdmin');

const addSubjects = async (req, res) => {
    try {
        const { department, class: className, semester, totalSubjects, subjects } = req.body;

        // Validate the payload
        if (!department || !className || !semester || !totalSubjects || !Array.isArray(subjects) || subjects.some(s => !s.name || !s.code || !s.handler || !s.department)) {
            return res.status(400).json({ success: false, message: 'All fields are required and must be valid' });
        }

        const subjectData = {
            department,
            class: className,
            semester,
            totalSubjects: Number(totalSubjects),
            subjects,
            createdAt: new Date().toISOString(),
        };

        // Use Firestore auto-generated ID
        const docRef = await db.collection('subjects').add(subjectData);

        return res.status(201).json({ success: true, message: 'Subjects added successfully', id: docRef.id });
    } catch (error) {
        console.error('Error adding subjects:', error);
        return res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

const getSubjects = async (req, res) => {
    try {
        const subjectsSnapshot = await db.collection('subjects').get();
        const subjects = subjectsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, data: subjects });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
    }
};

const deleteSubject = async (req, res) => {
    const { id } = req.params;

    try {
        const subjectRef = db.collection('subjects').doc(id);
        const subject = await subjectRef.get();

        if (!subject.exists) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        await subjectRef.delete();
        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ success: false, message: 'Failed to delete subject' });
    }
};

module.exports = { addSubjects, getSubjects, deleteSubject };