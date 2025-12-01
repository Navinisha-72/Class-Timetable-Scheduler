const { db } = require('../../config/firebaseAdmin');

const addDepartment = async (req, res) => {
    try {
        const { department, totalClasses, totalLabs, classes, labs } = req.body;

        // Adjusted validation logic to match the provided payload structure
        if (!department || !department.name || !department.code) {
            return res.status(400).json({ success: false, message: 'Department details are required and must be valid' });
        }

        if (
            totalClasses === undefined ||
            totalLabs === undefined ||
            !Array.isArray(classes) ||
            !Array.isArray(labs) ||
            classes.some(cls => !cls.name || !cls.number) ||
            labs.some(lab => !lab.name || !lab.number)
        ) {
            return res.status(400).json({ success: false, message: 'All fields are required and must be valid' });
        }

        const departmentData = {
            department,
            totalClasses: Number(totalClasses),
            totalLabs: Number(totalLabs),
            classes,
            labs,
            createdAt: new Date().toISOString(),
        };

        // Use Firestore auto-generated ID
        const docRef = await db.collection('departments').add(departmentData);

        return res.status(201).json({ success: true, message: 'Department added successfully', id: docRef.id });
    } catch (error) {
        console.error('Error adding department:', error);
        return res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

module.exports = { addDepartment };