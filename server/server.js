const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// =============================Import Admin Route=====================================
const timetableRoute = require('./routes/admin/timetableRoute');
const departmentRoute = require('./routes/admin/departmentRoute');
const facultyRoute = require('./routes/admin/facultyRoute');
const studentRoute = require('./routes/admin/studentRoute');
const subjectsRoute = require('./routes/admin/subjectsRoute');
const generateRoute = require('./routes/admin/generateRoute');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// ========================Mount Admin routes==============================
app.use('/admin/timetable', timetableRoute);
app.use('/admin/department', departmentRoute);
app.use('/admin/faculty', facultyRoute);
app.use('/admin/student', studentRoute);
app.use('/admin/subject', subjectsRoute);
app.use('/admin/generate', generateRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).send('Something went wrong!');
});

// Handle 404 (Not Found) - should be last
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});


// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log('✅ Connected to CSP Database Successfully...');
});
