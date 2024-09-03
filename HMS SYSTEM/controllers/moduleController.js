const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Assuming dbConfig is stored separately

// Function to create a new module
const createModule = async (req, res) => {
    const { moduleName, moduleDescription } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('ModuleName', sql.NVarChar, moduleName)
            .input('ModuleDescription', sql.NVarChar, moduleDescription)
            .query('INSERT INTO dbo.tblModule (ModuleName, ModuleDescription) VALUES (@ModuleName, @ModuleDescription)');
        res.status(201).json({ message: 'Module created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error creating module: ' + err.message });
    }
};

// Function to retrieve all modules
const getAllModules = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM dbo.tblModule');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving modules: ' + err.message });
    }
};

// Function to get details of a specific module
const getModuleById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('ModuleID', sql.Int, id)
            .query('SELECT * FROM dbo.tblModule WHERE ModuleID = @ModuleID');
        const module = result.recordset[0];
        if (module) {
            res.json(module);
        } else {
            res.status(404).json({ error: 'Module not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving module: ' + err.message });
    }
};

// Function to update module information
const updateModule = async (req, res) => {
    const { id } = req.params;
    const { moduleName, moduleDescription } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('ModuleID', sql.Int, id)
            .input('ModuleName', sql.NVarChar, moduleName)
            .input('ModuleDescription', sql.NVarChar, moduleDescription)
            .query('UPDATE dbo.tblModule SET ModuleName = @ModuleName, ModuleDescription = @ModuleDescription WHERE ModuleID = @ModuleID');
        res.status(200).json({ message: 'Module updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating module: ' + err.message });
    }
};

// Function to delete a module
const deleteModule = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('ModuleID', sql.Int, id)
            .query('DELETE FROM dbo.tblModule WHERE ModuleID = @ModuleID');
        res.status(200).json({ message: 'Module deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting module: ' + err.message });
    }
};

module.exports = { createModule, getAllModules, getModuleById, updateModule, deleteModule };
