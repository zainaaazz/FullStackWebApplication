const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to enroll a student in a module
const enrollStudent = async (req, res) => {
    const { studentId, moduleId } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('StudentID', sql.Int, studentId)
            .input('ModuleID', sql.Int, moduleId)
            .query('INSERT INTO tblStudentModuleEnrollment (StudentID, ModuleID) VALUES (@StudentID, @ModuleID)');
        res.status(201).json({ message: 'Student enrolled successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error enrolling student: ' + err.message });
    }
};

// Function to retrieve all enrollments
const getAllEnrollments = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM tblStudentModuleEnrollment');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving enrollments: ' + err.message });
    }
};

// Function to remove a student from a module
const removeEnrollment = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('EnrollmentID', sql.Int, id)
            .query('DELETE FROM tblStudentModuleEnrollment WHERE EnrollmentID = @EnrollmentID');
        res.status(200).json({ message: 'Enrollment removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error removing enrollment: ' + err.message });
    }
};

module.exports = { enrollStudent, getAllEnrollments, removeEnrollment };
