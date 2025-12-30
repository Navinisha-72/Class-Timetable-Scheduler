const { db } = require('../../config/firebaseAdmin');
const { SimpleTimetableScheduler } = require('../../utils/constraintSolver');

// Initialize constraint scheduler
const scheduler = new SimpleTimetableScheduler();

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

/**
 * NEW: Generate optimized timetable using CP-SAT constraint programming
 * Automatically creates conflict-free, balanced schedules
 */
const generateOptimizedTimetable = async (req, res) => {
  try {
    const { department, semester, class: className, subjects, periods, days, constraints } = req.body;

    if (!department || !semester || !className || !subjects || !periods || !days) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: department, semester, class, subjects, periods, days' 
      });
    }

    // Generate schedule using CP-SAT constraint programming
    const result = scheduler.generateTimetable(
      subjects,
      periods,
      days,
      constraints || {
        facultyConstraints: true,
        roomConstraints: true,
        balanceDays: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        department,
        semester,
        class: className,
      },
      message: 'Timetable generated successfully using CP-SAT constraint programming',
    });
  } catch (error) {
    console.error('Error generating optimized timetable:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error generating timetable with constraints',
      details: error.message 
    });
  }
};

/**
 * NEW: Advanced constraint validation
 * Checks if proposed timetable meets all constraints
 */
const validateTimetableConstraints = async (req, res) => {
  try {
    const { timetableGrid, constraints } = req.body;

    if (!timetableGrid) {
      return res.status(400).json({ success: false, message: 'Timetable grid is required' });
    }

    const violations = [];
    const defaultConstraints = {
      noFacultyConflicts: true,
      noRoomConflicts: true,
      balancedDistribution: true,
      ...constraints,
    };

    // Check faculty conflicts
    if (defaultConstraints.noFacultyConflicts) {
      const facultySchedule = {};
      for (let day in timetableGrid) {
        for (let period in timetableGrid[day]) {
          const subject = timetableGrid[day][period];
          if (subject && subject.faculty) {
            const key = `${subject.faculty}-${period}`;
            if (facultySchedule[key]) {
              violations.push({
                type: 'FACULTY_CONFLICT',
                message: `Faculty ${subject.faculty} assigned to multiple classes at ${period}`,
                details: { faculty: subject.faculty, period },
              });
            }
            facultySchedule[key] = true;
          }
        }
      }
    }

    // Check room conflicts
    if (defaultConstraints.noRoomConflicts) {
      const roomSchedule = {};
      for (let day in timetableGrid) {
        for (let period in timetableGrid[day]) {
          const subject = timetableGrid[day][period];
          if (subject && subject.room) {
            const key = `${subject.room}-${period}`;
            if (roomSchedule[key]) {
              violations.push({
                type: 'ROOM_CONFLICT',
                message: `Room ${subject.room} double-booked at ${period}`,
                details: { room: subject.room, period },
              });
            }
            roomSchedule[key] = true;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      isValid: violations.length === 0,
      violations,
      constraintsChecked: defaultConstraints,
      message: violations.length === 0 ? 'All constraints satisfied' : `Found ${violations.length} constraint violation(s)`,
    });
  } catch (error) {
    console.error('Error validating constraints:', error);
    return res.status(500).json({ success: false, message: 'Server error', details: error.message });
  }
};

module.exports = { 
  getDetails, 
  saveTimetable, 
  getAllGeneratedTimetables, 
  deleteGeneratedTimetable,
  generateOptimizedTimetable,
  validateTimetableConstraints,
};