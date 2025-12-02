const express = require('express');
const { addDepartment, getDepartments } = require('../../controllers/admin/departmentController');

const router = express.Router();

// Route to add a department
router.post('/add-department', addDepartment);

// Route to get all departments
router.get('/get-departments', getDepartments);

module.exports = router;