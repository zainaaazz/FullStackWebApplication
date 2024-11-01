const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately



// Function to create a new assignment
const createAssignment = async (req, res) => {
    const { title, instructions, dueDate, ModuleID } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Instructions', sql.NVarChar, instructions)
            .input('DueDate', sql.DateTime, dueDate)
            .input('ModuleID', sql.Int, ModuleID)
            .query('INSERT INTO dbo.tblAssignment (Title, Instructions, DueDate, ModuleID) VALUES (@Title, @Instructions, @DueDate, @ModuleID)');
        res.status(201).json({ message: 'Assignment created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error creating assignment: ' + err.message });
    }
};

// Function to retrieve all assignments
const getAllAssignments = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT AssignmentID, Title, Instructions, CreatedAt, DueDate, ModuleID FROM dbo.tblAssignment');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving assignments: ' + err.message });
    }
};

//Updated Function By Simphiwe: Reason Had issues testing
// Function to get details of a specific assignment by AssignmentID
const getAssignmentById = async (req, res) => {
    const assignmentId = parseInt(req.params.id, 10);  // Parse ID to integer
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('AssignmentID', sql.Int, assignmentId)  // Pass as integer
            .query('SELECT AssignmentID, Title, Instructions, CreatedAt, DueDate, ModuleID FROM dbo.tblAssignment WHERE AssignmentID = @AssignmentID');
        
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


// Function to get all assignments for a specific module by ModuleID
const getAllAssignmentsByModuleId = async (req, res) => {
    const { ModuleID } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('ModuleID', sql.Int, ModuleID)
            .query('SELECT AssignmentID, Title, Instructions, CreatedAt, DueDate, ModuleID FROM dbo.tblAssignment WHERE ModuleID = @ModuleID');
        
        const assignments = result.recordset;
        if (assignments.length > 0) {
            res.json(assignments);
        } else {
            res.status(404).json({ error: 'No assignments found for this module' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving assignments: ' + err.message });
    }
};

// Function to update assignment information
const updateAssignment = async (req, res) => {
    const assignmentId = parseInt(req.params.id, 10);  // Parse ID to integer
    const { title, instructions, dueDate, ModuleID } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('AssignmentID', sql.Int, assignmentId)  // Pass as integer
            .input('Title', sql.NVarChar, title)
            .input('Instructions', sql.NVarChar, instructions)
            .input('DueDate', sql.DateTime, dueDate)
            .input('ModuleID', sql.Int, ModuleID)
            .query('UPDATE dbo.tblAssignment SET Title = @Title, Instructions = @Instructions, DueDate = @DueDate, ModuleID = @ModuleID WHERE AssignmentID = @AssignmentID');

        res.status(200).json({ message: 'Assignment updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating assignment: ' + err.message });
    }
};




// Function to delete an assignment
const deleteAssignment = async (req, res) => {
    const assignmentId = parseInt(req.params.id, 10);  // Parse ID to integer

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('AssignmentID', sql.Int, assignmentId)  // Pass as integer
            .query('DELETE FROM dbo.tblAssignment WHERE AssignmentID = @AssignmentID');

        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting assignment: ' + err.message });
    }
};

module.exports = { 
    createAssignment, 
    getAllAssignments, 
    getAllAssignmentsByModuleId, 
    getAssignmentById, 
    updateAssignment, 
    deleteAssignment 
};
