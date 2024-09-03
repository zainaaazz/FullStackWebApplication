const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to create a new course
const createCourse = async (req, res) => {
    const { courseName, courseDescription } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('CourseName', sql.NVarChar, courseName)
            .input('CourseDescription', sql.NVarChar, courseDescription)
            .query('INSERT INTO dbo.tblCourse (CourseName, CourseDescription) VALUES (@CourseName, @CourseDescription)');
        res.status(201).json({ message: 'Course created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error creating course: ' + err.message });
    }
};

// Function to retrieve all courses
const getAllCourses = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblCourse');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving courses: ' + err.message });
    }
};

// Function to get details of a specific course
const getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('CourseID', sql.Int, id)
            .query('SELECT * FROM dbo.tblCourse WHERE CourseID = @CourseID');
        const course = result.recordset[0];
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ error: 'Course not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving course: ' + err.message });
    }
};

// Function to update course information
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { courseName, courseDescription } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('CourseID', sql.Int, id)
            .input('CourseName', sql.NVarChar, courseName)
            .input('CourseDescription', sql.NVarChar, courseDescription)
            .query('UPDATE dbo.tblCourse SET CourseName = @CourseName, CourseDescription = @CourseDescription WHERE CourseID = @CourseID');
        res.status(200).json({ message: 'Course updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating course: ' + err.message });
    }
};

// Function to delete a course
const deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('CourseID', sql.Int, id)
            .query('DELETE FROM dbo.tblCourse WHERE CourseID = @CourseID');
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting course: ' + err.message });
    }
};

module.exports = { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse };
