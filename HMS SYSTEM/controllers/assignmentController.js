const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to create a new assignment
const createAssignment = async (req, res) => {
    const { assignmentTitle, assignmentDescription, dueDate } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('AssignmentTitle', sql.NVarChar, assignmentTitle)
            .input('AssignmentDescription', sql.NVarChar, assignmentDescription)
            .input('DueDate', sql.DateTime, dueDate)
            .query('INSERT INTO dbo.tblAssignment (AssignmentTitle, AssignmentDescription, DueDate) VALUES (@AssignmentTitle, @AssignmentDescription, @DueDate)');
        res.status(201).json({ message: 'Assignment created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error creating assignment: ' + err.message });
    }
};

// Function to retrieve all assignments
const getAllAssignments = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblAssignment');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving assignments: ' + err.message });
    }
};

// Function to get details of a specific assignment
const getAssignmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('AssignmentID', sql.Int, id)
            .query('SELECT * FROM dbo.tblAssignment WHERE AssignmentID = @AssignmentID');
        const assignment = result.recordset[0];
        if (assignment) {
            res.json(assignment);
        } else {
            res.status(404).json({ error: 'Assignment not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving assignment: ' + err.message });
    }
};

// Function to update assignment information
const updateAssignment = async (req, res) => {
    const { id } = req.params;
    const { assignmentTitle, assignmentDescription, dueDate } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('AssignmentID', sql.Int, id)
            .input('AssignmentTitle', sql.NVarChar, assignmentTitle)
            .input('AssignmentDescription', sql.NVarChar, assignmentDescription)
            .input('DueDate', sql.DateTime, dueDate)
            .query('UPDATE dbo.tblAssignment SET AssignmentTitle = @AssignmentTitle, AssignmentDescription = @AssignmentDescription, DueDate = @DueDate WHERE AssignmentID = @AssignmentID');
        res.status(200).json({ message: 'Assignment updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating assignment: ' + err.message });
    }
};

// Function to delete an assignment
const deleteAssignment = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('AssignmentID', sql.Int, id)
            .query('DELETE FROM dbo.tblAssignment WHERE AssignmentID = @AssignmentID');
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting assignment: ' + err.message });
    }
};

module.exports = { createAssignment, getAllAssignments, getAssignmentById, updateAssignment, deleteAssignment };
