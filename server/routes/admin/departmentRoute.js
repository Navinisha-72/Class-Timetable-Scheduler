const express = require('express');
const { addDepartment } = require('../../controllers/admin/departmentController');

const router = express.Router();

// Route to add a department
router.post('/add-department', addDepartment);

module.exports = router;