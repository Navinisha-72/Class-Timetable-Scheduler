const express = require('express');
const { addTimetable, getTimetables } = require('../../controllers/admin/timetableController');

const router = express.Router();

// Route to add a timetable
router.post('/add-timetable', addTimetable);

// Route to get all timetables
router.get('/get-timetables', getTimetables);

module.exports = router;