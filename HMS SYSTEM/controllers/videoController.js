const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to upload a video
const uploadVideo = async (req, res) => {
    const { videoTitle, videoUrl } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('VideoTitle', sql.NVarChar, videoTitle)
            .input('VideoUrl', sql.NVarChar, videoUrl)
            .query('INSERT INTO dbo.tblVideo (VideoTitle, VideoUrl) VALUES (@VideoTitle, @VideoUrl)');
        res.status(201).json({ message: 'Video uploaded successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error uploading video: ' + err.message });
    }
};

// Function to retrieve all videos
const getAllVideos = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblVideo');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving videos: ' + err.message });
    }
};

// Function to get details of a specific video
const getVideoById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('VideoID', sql.Int, id)
            .query('SELECT * FROM dbo.tblVideo WHERE VideoID = @VideoID');
        const video = result.recordset[0];
        if (video) {
            res.json(video);
        } else {
            res.status(404).json({ error: 'Video not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving video: ' + err.message });
    }
};

// Function to delete a video
const deleteVideo = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('VideoID', sql.Int, id)
            .query('DELETE FROM dbo.tblVideo WHERE VideoID = @VideoID');
        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting video: ' + err.message });
    }
};

module.exports = { uploadVideo, getAllVideos, getVideoById, deleteVideo };
