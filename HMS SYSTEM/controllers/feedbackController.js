const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately
const { Parser } = require('json2csv');  // For converting JSON to CSV
const fs = require('fs');
const path = require('path');

// Function to provide feedback on a submission
const provideFeedback = async (req, res) => {
    const { submissionId, lectureId, feedbackText, mark } = req.body; // Include mark
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('SubmissionID', sql.Int, submissionId)
            .input('Lecture_ID', sql.Int, lectureId)
            .input('FeedbackText', sql.NVarChar, feedbackText)
            .input('Mark', sql.Int, mark) // Include mark
            .query('INSERT INTO dbo.tblFeedback (SubmissionID, Lecture_ID, FeedbackText, Mark) VALUES (@SubmissionID, @Lecture_ID, @FeedbackText, @Mark)');
        res.status(201).json({ message: 'Feedback provided successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error providing feedback: ' + err.message });
    }
};

// Function to retrieve all feedback
const getAllFeedback = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT TOP (1000) SubmissionID, FeedbackText, Mark, Lecture_ID FROM dbo.tblFeedback');
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
            .query('SELECT SubmissionID, FeedbackText, Mark, Lecture_ID FROM dbo.tblFeedback WHERE FeedbackID = @FeedbackID');
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

// Update feedback by ID
const updateFeedback = async (req, res) => {
    const { id } = req.params;
    const { feedbackText } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('FeedbackID', sql.Int, id)
            .query('SELECT * FROM dbo.tblFeedback WHERE FeedbackID = @FeedbackID');
        
        const feedback = result.recordset[0];
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        await pool.request()
            .input('FeedbackID', sql.Int, id)
            .input('FeedbackText', sql.NVarChar, feedbackText)
            .query('UPDATE dbo.tblFeedback SET FeedbackText = @FeedbackText WHERE FeedbackID = @FeedbackID');
        
        res.status(200).json({ message: 'Feedback updated successfully', feedback: { ...feedback, FeedbackText: feedbackText } });
    } catch (error) {
        res.status(500).json({ message: 'Error updating feedback', error });
    }
};

// Delete feedback by ID
const deleteFeedback = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('FeedbackID', sql.Int, id)
            .query('SELECT * FROM dbo.tblFeedback WHERE FeedbackID = @FeedbackID');
        
        const feedback = result.recordset[0];
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        await pool.request()
            .input('FeedbackID', sql.Int, id)
            .query('DELETE FROM dbo.tblFeedback WHERE FeedbackID = @FeedbackID');
        
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting feedback', error });
    }
};

// Function to generate and download feedback as CSV
const downloadFeedbackCSV = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT SubmissionID, FeedbackText, Mark, Lecture_ID FROM dbo.tblFeedback');
        const feedbackData = result.recordset;

        if (feedbackData.length === 0) {
            return res.status(404).json({ message: 'No feedback data found' });
        }

        // Convert JSON data to CSV
        const json2csvParser = new Parser({ fields: ['SubmissionID', 'FeedbackText', 'Mark', 'Lecture_ID'] });
        const csv = json2csvParser.parse(feedbackData);

        // Define the file path and name
        const filePath = path.join(__dirname, '../temp', `feedback_${Date.now()}.csv`);
        
        // Save the CSV file to the server
        fs.writeFileSync(filePath, csv);

        // Send the file for download
        res.download(filePath, 'feedback.csv', (err) => {
            if (err) {
                console.error('Error sending the file:', err);
                res.status(500).json({ message: 'Error downloading feedback CSV' });
            }

            // Remove the file after download to clean up the server
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        res.status(500).json({ error: 'Error generating feedback CSV: ' + err.message });
    }
};


module.exports = {
    provideFeedback,
    getAllFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
    downloadFeedbackCSV
};
