const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to provide feedback on a submission
const provideFeedback = async (req, res) => {
    const { submissionId, lecturerId, feedbackText } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('SubmissionID', sql.Int, submissionId)
            .input('LecturerID', sql.Int, lecturerId)
            .input('FeedbackText', sql.NVarChar, feedbackText)
            .query('INSERT INTO dbo.tblFeedback (SubmissionID, LecturerID, FeedbackText) VALUES (@SubmissionID, @LecturerID, @FeedbackText)');
        res.status(201).json({ message: 'Feedback provided successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error providing feedback: ' + err.message });
    }
};

// Function to retrieve all feedback
const getAllFeedback = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblFeedback');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving feedback: ' + err.message });
    }
};

// Function to get details of specific feedback
const getFeedbackById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('FeedbackID', sql.Int, id)
            .query('SELECT * FROM dbo.tblFeedback WHERE FeedbackID = @FeedbackID');
        const feedback = result.recordset[0];
        if (feedback) {
            res.json(feedback);
        } else {
            res.status(404).json({ error: 'Feedback not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving feedback: ' + err.message });
    }
};

module.exports = { provideFeedback, getAllFeedback, getFeedbackById };
