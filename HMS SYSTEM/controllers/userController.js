const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

const getAllUsers = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblUser');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving users: ' + err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('UserID', sql.Int, id)
            .query('SELECT * FROM dbo.tblUser WHERE UserID = @UserID');
        const user = result.recordset[0];
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving user: ' + err.message });
    }
};

module.exports = { getAllUsers, getUserById };