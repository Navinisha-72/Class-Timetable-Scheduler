const express = require('express');
const { getDetails, saveTimetable, getAllGeneratedTimetables, deleteGeneratedTimetable } = require('../../controllers/admin/generateController');

const router = express.Router();

// Route to get details
router.get('/get-student-details', getDetails);

// Route to save generated timetable
router.post('/save-timetable', saveTimetable);

// Route to get generated timetable
router.get('/get-generated-timetable', getAllGeneratedTimetables);

// Route to delete a generated timetable
router.delete('/delete-timetable/:id', deleteGeneratedTimetable);

module.exports = router;