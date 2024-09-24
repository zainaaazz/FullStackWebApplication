const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

const register = async (req, res) => {
    const { UserNumber, Password, FirstName, LastName, Email, CourseID } = req.body;
    
    // Determine UserRole based on UserNumber
    let UserRole;
    if (UserNumber.toString().startsWith('1') || UserNumber.toString().startsWith('2')) {
        UserRole = 'Lecture';
    } else if (UserNumber.toString().startsWith('3') || UserNumber.toString().startsWith('4')) {
        UserRole = 'Student';
    } else if (UserNumber.toString().startsWith('5')) {
        UserRole = 'Admin';
    } else {
        return res.status(400).json({ error: 'Invalid UserNumber' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const hashedPassword = await bcrypt.hash(Password, 10);
        await pool.request()
            .input('UserNumber', sql.INT, UserNumber)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .input('FirstName', sql.NVarChar, FirstName)
            .input('LastName', sql.NVarChar, LastName)
            .input('Email', sql.NVarChar, Email)
            .input('UserRole', sql.NVarChar, UserRole)
            .input('CourseID', sql.INT, CourseID)
            .query('INSERT INTO dbo.tblUser (UserNumber, PasswordHash, FirstName, LastName, Email, UserRole, CourseID) VALUES (@UserNumber, @PasswordHash, @FirstName, @LastName, @Email, @UserRole, @CourseID)');
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user: ' + err.message });
    }
};

const login = async (req, res) => {
    const { UserNumber, Password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('UserNumber', sql.INT, UserNumber)
            .query('SELECT * FROM dbo.tblUser WHERE UserNumber = @UserNumber');
        const user = result.recordset[0];
        if (user && await bcrypt.compare(Password, user.PasswordHash)) {
            const accessToken = jwt.sign({ UserNumber: user.UserNumber, UserRole: user.UserRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ accessToken });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error logging in: ' + err.message });
    }
};

// New logout function
const logout = (req, res) => {
    res.status(200).json({ message: 'User logged out' });
};

module.exports = { register, login, logout };
