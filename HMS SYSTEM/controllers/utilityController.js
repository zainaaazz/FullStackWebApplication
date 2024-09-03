const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to download a file
const downloadFile = async (req, res) => {
    const { id } = req.params;
    // Implement file download logic here
    res.status(200).json({ message: 'File download functionality not yet implemented' });
};

// Function to stream a file
const streamFile = async (req, res) => {
    const { id } = req.params;
    // Implement file streaming logic here
    res.status(200).json({ message: 'File streaming functionality not yet implemented' });
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
