const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to submit an assignment
const submitAssignment = async (req, res) => {
    const { studentId, assignmentId, submissionText, videoId } = req.body; // Added videoId
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('StudentID', sql.Int, studentId)
            .input('AssignmentID', sql.Int, assignmentId)
            .input('SubmissionText', sql.NVarChar, submissionText)
            .input('VideoID', sql.Int, videoId) // Added VideoID
            .query('INSERT INTO dbo.tblSubmission (StudentID, AssignmentID, SubmissionText, VideoID) VALUES (@StudentID, @AssignmentID, @SubmissionText, @VideoID)');
        res.status(201).json({ message: 'Assignment submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error submitting assignment: ' + err.message });
    }
};

// Function to retrieve all submissions
const getAllSubmissions = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblSubmission');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving submissions: ' + err.message });
    }
};

// Function to get details of a specific submission
const getSubmissionById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('SubmissionID', sql.Int, id)
            .query('SELECT * FROM dbo.tblSubmission WHERE SubmissionID = @SubmissionID');
        const submission = result.recordset[0];
        if (submission) {
            res.json(submission);
        } else {
            res.status(404).json({ error: 'Submission not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving submission: ' + err.message });
    }
};

// Function to update submission status
const updateSubmission = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('SubmissionID', sql.Int, id)
            .input('Status', sql.NVarChar, status)
            .query('UPDATE dbo.tblSubmission SET Status = @Status WHERE SubmissionID = @SubmissionID');
        res.status(200).json({ message: 'Submission status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating submission status: ' + err.message });
    }
};

// Function to delete a submission
const deleteSubmission = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('SubmissionID', sql.Int, id)
            .query('DELETE FROM dbo.tblSubmission WHERE SubmissionID = @SubmissionID');
        res.status(200).json({ message: 'Submission deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting submission: ' + err.message });
    }
};

module.exports = { submitAssignment, getAllSubmissions, getSubmissionById, updateSubmission, deleteSubmission };
