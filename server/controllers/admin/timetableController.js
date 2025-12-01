const { db } = require('../../config/firebaseAdmin');

const addTimetable = async (req, res) => {
    try {
        const { timetableName, collegeStartTime, collegeEndTime, schedule } = req.body;

        if (!timetableName || !collegeStartTime || !collegeEndTime || !schedule || !Array.isArray(schedule)) {
            return res.status(400).json({ success: false, message: 'All fields are required and schedule must be an array' });
        }

        const timetableData = {
            collegeStartTime,
            collegeEndTime,
            schedule: schedule.sort((a, b) => new Date(`1970-01-01T${a.startTime}`) - new Date(`1970-01-01T${b.startTime}`)),
            createdAt: new Date().toISOString(),
        };

        await db.collection('timetables').doc(timetableName).set(timetableData);

        return res.status(201).json({ success: true, message: 'Timetable added successfully' });
    } catch (error) {
        console.error('Error adding timetable:', error);
        return res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

const getTimetables = async (req, res) => {
    try {
        const timetablesSnapshot = await db.collection('timetables').get();

        if (timetablesSnapshot.empty) {
            return res.status(404).json({ success: false, message: 'No timetables found' });
        }

        const timetables = timetablesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return res.status(200).json({ success: true, data: timetables });
    } catch (error) {
        console.error('Error fetching timetables:', error);
        return res.status(500).json({ success: false, message: 'Server error', details: error.message });
    }
};

module.exports = { addTimetable, getTimetables };
