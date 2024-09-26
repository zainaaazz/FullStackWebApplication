const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to download a video using the URL
const downloadFile = async (req, res) => {
    const { id } = req.params;

    try {
        // Connect to the database and retrieve the video URL using the ID
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('VideoID', sql.Int, id)
            .query('SELECT VideoURL FROM dbo.tblVideo WHERE VideoID = @VideoID');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const videoUrl = result.recordset[0].VideoURL;

        // Fetch the video from the URL
        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        });

        // Define the path where the video will be saved temporarily
        const tempPath = path.join(__dirname, '../temp', `video_${id}.mp4`);
        const writer = fs.createWriteStream(tempPath);

        // Pipe the response stream to the file
        response.data.pipe(writer);

        writer.on('finish', () => {
            // Send the video file as the download response
            res.download(tempPath, `video_${id}.mp4`, (err) => {
                if (err) {
                    console.error('Error sending the file:', err);
                    return res.status(500).json({ error: 'Error downloading video' });
                }

                // Clean up the temporary file after download
                fs.unlink(tempPath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting temp file:', unlinkErr);
                    }
                });
            });
        });

        writer.on('error', (err) => {
            console.error('Error writing the file:', err);
            res.status(500).json({ error: 'Error saving video file' });
        });
    } catch (err) {
        console.error('Error downloading video:', err);
        res.status(500).json({ error: 'Error downloading video: ' + err.message });
    }
};

// Function to stream a file
const streamFile = async (req, res) => {
    const { id } = req.params;

    try {
        // Connect to the database and retrieve the video URL using the ID
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('VideoID', sql.Int, id)
            .query('SELECT VideoURL FROM dbo.tblVideo WHERE VideoID = @VideoID');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const videoUrl = result.recordset[0].VideoURL;

        // Fetch the video from the URL and stream it
        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        });

        // Set the content type and pipe the response to the client
        res.setHeader('Content-Type', 'video/mp4');
        response.data.pipe(res);
    } catch (err) {
        console.error('Error streaming video:', err);
        res.status(500).json({ error: 'Error streaming video: ' + err.message });
    }
};







// Function to retrieve all roles
const getAllRoles = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblRole');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving roles: ' + err.message });
    }
};

// Function to update user role
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('UserID', sql.Int, id)
            .input('Role', sql.NVarChar, role)
            .query('UPDATE dbo.tblUser SET UserRole = @Role WHERE UserID = @UserID');
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating user role: ' + err.message });
    }
};

module.exports = { downloadFile, streamFile, getAllRoles, updateUserRole };
