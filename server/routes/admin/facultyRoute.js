const express = require('express');
const { addFaculty, getAllFaculties, getFacultiesCollection } = require('../../controllers/admin/facultyController');

const router = express.Router();

// Route to add faculty
router.post('/add-faculty', addFaculty);

// Route to get all faculties
router.get('/get-all-faculties', getAllFaculties);

// Route to get faculties collection
router.get('/get-faculties', getFacultiesCollection);

module.exports = router;