const sql = require('mssql');
const bcrypt = require('bcryptjs'); // For hashing passwords
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

// New function to register a user
const registerUser = async (req, res) => {
    const { Username, Password, UserRole } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const hashedPassword = await bcrypt.hash(Password, 10);
        await pool.request()
            .input('Username', sql.NVarChar, Username)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .input('UserRole', sql.NVarChar, UserRole)
            .query('INSERT INTO dbo.tblUser (Username, PasswordHash, UserRole) VALUES (@Username, @PasswordHash, @UserRole)');
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user: ' + err.message });
    }
};

// New function to update user details
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { Username, UserRole } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('UserID', sql.Int, id)
            .input('Username', sql.NVarChar, Username)
            .input('UserRole', sql.NVarChar, UserRole)
            .query('UPDATE dbo.tblUser SET Username = @Username, UserRole = @UserRole WHERE UserID = @UserID');
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating user: ' + err.message });
    }
};

// New function to delete a user
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('UserID', sql.Int, id)
            .query('DELETE FROM dbo.tblUser WHERE UserID = @UserID');
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user: ' + err.message });
    }
};

module.exports = { getAllUsers, getUserById, registerUser, updateUser, deleteUser };
