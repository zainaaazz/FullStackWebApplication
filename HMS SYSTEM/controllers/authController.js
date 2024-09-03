const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

const register = async (req, res) => {
    const { Username, Password, UserRole } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const hashedPassword = await bcrypt.hash(Password, 10);
        await pool.request()
            .input('Username', sql.NVarChar, Username)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .input('UserRole', sql.NVarChar, UserRole)
            .query('INSERT INTO dbo.tblUser (Username, PasswordHash, UserRole) VALUES (@Username, @PasswordHash, @UserRole)');
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user: ' + err.message });
    }
};

const login = async (req, res) => {
    const { Username, Password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Username', sql.NVarChar, Username)
            .query('SELECT * FROM dbo.tblUser WHERE Username = @Username');
        const user = result.recordset[0];
        if (user && await bcrypt.compare(Password, user.PasswordHash)) {
            const accessToken = jwt.sign({ Username: user.Username, UserRole: user.UserRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    // Placeholder logout logic, typically handled on the client side
    res.status(200).json({ message: 'User logged out' });
};

module.exports = { register, login, logout };
