const express = require('express');
const { getClasses, addStudents, getStudents, deleteStudentByRollNo } = require('../../controllers/admin/studentController');


const router = express.Router();

// Route to get classes
router.post('/get-classes', getClasses);

// Route to add students
router.post('/add-students', addStudents);

// Route to get students
router.get('/get-students', getStudents);

// Route to delete a student by roll number
router.delete('/delete/:rollNo', deleteStudentByRollNo);

module.exports = router;