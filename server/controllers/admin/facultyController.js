const { db } = require('../../config/firebaseAdmin');

const addFaculty = async (req, res) => {
    try {
        const { department, hodName, totalFaculties, faculties } = req.body;

        // Validate the payload
        if (!department || !hodName || totalFaculties === undefined || !Array.isArray(faculties) || faculties.some(f => !f.name || !f.role)) {
            return res.status(400).json({ success: false, message: 'All fields are required and must be valid' });
        }

        const facultyData = {
            department,
            hodName,
            totalFaculties: Number(totalFaculties),
            faculties,
            createdAt: new Date().toISOString(),
        };

        // Use Firestore auto-generated ID
        const docRef = await db.collection('faculties').add(facultyData);

        return res.status(201).json({ success: true, message: 'Faculty added successfully', id: docRef.id });
    } catch (error) {
        console.error('Error adding faculty:', error);
        return res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

const getAllFaculties = async (req, res) => {
    try {
        const facultiesSnapshot = await db.collection('faculties').get();

        if (facultiesSnapshot.empty) {
            return res.status(404).json({ message: 'No faculties found' });
        }

        const departments = {};

        facultiesSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const { department, faculties } = data;

            if (!departments[department]) {
                departments[department] = { faculties: [] };
            }

            departments[department].faculties.push(...faculties);
        });

        res.status(200).json({ departments });
    } catch (error) {
        console.error('Error fetching faculties:', error);
        res.status(500).json({ message: 'Failed to fetch faculties', error: error.message });
    }
};

const getFacultiesCollection = async (req, res) => {
    try {
        const facultiesSnapshot = await db.collection('faculties').get();

        if (facultiesSnapshot.empty) {
            return res.status(404).json({ message: 'No faculties found' });
        }

        const faculties = facultiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ faculties });
    } catch (error) {
        console.error('Error fetching faculties collection:', error);
        res.status(500).json({ message: 'Failed to fetch faculties collection', error: error.message });
    }
};

module.exports = {
    addFaculty,
    getAllFaculties,
    getFacultiesCollection,
};