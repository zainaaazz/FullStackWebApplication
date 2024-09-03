const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to add a module to a course
const addModuleToCourse = async (req, res) => {
    const { courseId, moduleId } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('CourseID', sql.Int, courseId)
            .input('ModuleID', sql.Int, moduleId)
            .query('INSERT INTO dbo.tblModuleOnCourse (CourseID, ModuleID) VALUES (@CourseID, @ModuleID)');
        res.status(201).json({ message: 'Module added to course successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error adding module to course: ' + err.message });
    }
};

// Function to remove a module from a course
const removeModuleFromCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM dbo.tblModuleOnCourse WHERE ID = @ID');
        res.status(200).json({ message: 'Module removed from course successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error removing module from course: ' + err.message });
    }
};

module.exports = { addModuleToCourse, removeModuleFromCourse };
