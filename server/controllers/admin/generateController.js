const { db } = require('../../config/firebaseAdmin');

const getDetails = async (req, res) => {
  try {
    // Fetch departments, semesters, classes, and subjects
    const subjectsSnapshot = await db.collection('subjects').get();
    const subjects = subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch timetables
    const timetablesSnapshot = await db.collection('timetables').get();
    const timetables = timetablesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({
      success: true,
      data: {
        subjects,
        timetables,
      },
    });
  } catch (error) {
    console.error('Error fetching details:', error);
    return res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

const saveTimetable = async (req, res) => {
  try {
    const {
      department,
      semester,
      class: className,
      timetableTemplate,
      generatedTimetable,
    } = req.body;

    if (!department || !semester || !className || !timetableTemplate || !generatedTimetable) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const timetableData = {
      department,
      semester,
      class: className,
      timetableTemplate,
      generatedTimetable,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    const timetableRef = await db.collection('generatedTimetables').add(timetableData);

    return res.status(201).json({
      success: true,
      message: 'Timetable saved successfully',
      timetableId: timetableRef.id,
    });
  } catch (error) {
    console.error('Error saving timetable:', error);
    return res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

const getAllGeneratedTimetables = async (req, res) => {
  try {
    const timetableSnapshot = await db.collection('generatedTimetables').get();

    if (timetableSnapshot.empty) {
      return res.status(404).json({ success: false, message: 'No generated timetables found' });
    }

    const timetables = timetableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({
      success: true,
      data: timetables,
    });
  } catch (error) {
    console.error('Error fetching all generated timetables:', error);
    return res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

const deleteGeneratedTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Timetable ID is required' });
    }

    // Delete the timetable from Firestore
    await db.collection('generatedTimetables').doc(id).delete();

    return res.status(200).json({ success: true, message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    return res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

module.exports = { getDetails, saveTimetable, getAllGeneratedTimetables, deleteGeneratedTimetable };