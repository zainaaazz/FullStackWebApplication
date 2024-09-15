const sql = require('mssql');
const dbConfig = require('../config/dbConfig');
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const { StorageSharedKeyCredential } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Function to generate a SAS token for a blob
function generateSasToken(blobName) {
    const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY);
    const containerName = 'videos';  // Your container name

    // Set token permissions and expiration
    const sasOptions = {
        containerName: containerName,
        blobName: blobName,
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),  // 1 hour expiration
        permissions: BlobSASPermissions.parse("r"),  // Read permissions
    };

    // Generate the SAS token
    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
    return sasToken;
}

// Function to upload a video to Azure Blob and save the URL (with SAS) to the database
const uploadVideo = async (req, res) => {
    const { videoTitle } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
        return res.status(400).json({ error: 'No video file uploaded' });
    }

    try {
        // Step 1: Upload the video to Azure Blob Storage
        const containerClient = blobServiceClient.getContainerClient('videos');
        const blobName = uuidv4() + '-' + videoFile.originalname;  // Generate unique blob name
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload the video file to Azure Blob Storage
        await blockBlobClient.uploadData(videoFile.buffer, {
            blobHTTPHeaders: { blobContentType: videoFile.mimetype }
        });

        // Step 2: Generate SAS token for the uploaded blob
        const sasToken = generateSasToken(blobName);

        // Step 3: Combine the blob URL with the SAS token to create the accessible URL
        const videoUrl = `${blockBlobClient.url}?${sasToken}`;

        // Step 4: Save the video details (VideoTitle and VideoURL) to the database
        const pool = await sql.connect(dbConfig);
        const insertVideo = await pool.request()
            .input('VideoTitle', sql.NVarChar(255), videoTitle)
            .input('VideoUrl', sql.NVarChar(sql.MAX), videoUrl)
            .query('INSERT INTO dbo.tblVideo (VideoTitle, VideoURL) VALUES (@VideoTitle, @VideoUrl); SELECT SCOPE_IDENTITY() AS VideoID;');

        const newVideoID = insertVideo.recordset[0].VideoID;

        // Step 5: Respond with the video details
        res.status(201).json({ message: 'Video uploaded successfully', videoId: newVideoID, videoUrl });
    } catch (err) {
        console.error('Error uploading video:', err);
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
        const result = await pool.request()
            .input('VideoID', sql.Int, id)
            .query('SELECT * FROM dbo.tblVideo WHERE VideoID = @VideoID');
        const video = result.recordset[0];

        if (video) {
            // Step 1: Delete the video from Azure Blob Storage
            const videoUrl = video.VideoURL;
            const blobName = videoUrl.split('/').pop().split('?')[0];  // Extract the blob name
            const containerClient = blobServiceClient.getContainerClient('videos');
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.delete();  // Delete the blob from Azure

            // Step 2: Delete the video entry from the database
            await pool.request()
                .input('VideoID', sql.Int, id)
                .query('DELETE FROM dbo.tblVideo WHERE VideoID = @VideoID');

            res.status(200).json({ message: 'Video deleted successfully' });
        } else {
            res.status(404).json({ error: 'Video not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error deleting video: ' + err.message });
    }
};

module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    deleteVideo,
};
