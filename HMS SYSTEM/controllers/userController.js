const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// Helper function to check if the user is an admin
const isAdmin = (req) => req.user && req.user.UserRole === 'Admin';

const getAllUsers = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblUser');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving users: ' + err.message });
    }
};

const getUserById = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }

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

// Removed the registerUser function since new user registration is not allowed

const updateUser = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const { id } = req.params;
    const { Username, FirstName, LastName, Email, UserRole, CourseID } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('UserID', sql.Int, id)
            .input('Username', sql.VarChar, Username)
            .input('FirstName', sql.VarChar, FirstName)
            .input('LastName', sql.VarChar, LastName)
            .input('Email', sql.VarChar, Email)
            .input('UserRole', sql.VarChar, UserRole)
            .input('CourseID', sql.Int, CourseID)
            .query(`
                UPDATE dbo.tblUser 
                SET Username = @Username, 
                    FirstName = @FirstName, 
                    LastName = @LastName, 
                    Email = @Email, 
                    UserRole = @UserRole, 
                    CourseID = @CourseID 
                WHERE UserID = @UserID
            `);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating user: ' + err.message });
    }
};

const deleteUser = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }

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

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
