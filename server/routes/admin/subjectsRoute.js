const express = require('express');
const { addSubjects, getSubjects } = require('../../controllers/admin/subjectsController');

const router = express.Router();

// Route to add subjects
router.post('/add-subjects', addSubjects);

// Route to get all subjects
router.get('/get-subjects', getSubjects);

module.exports = router;