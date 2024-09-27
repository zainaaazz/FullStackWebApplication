const request = require('supertest');
const express = require('express');
const sql = require('mssql');
const {
    createModule,
    getAllModules,
    getModuleById,
    updateModule,
    deleteModule
} = require('../moduleController.js'); // Update the path as needed

const app = express();
app.use(express.json());
app.post('/modules', createModule);
app.get('/modules', getAllModules);
app.get('/modules/:id', getModuleById);
app.put('/modules/:id', updateModule);
app.delete('/modules/:id', deleteModule);

// Mock the database connection
jest.mock('mssql');

describe('Module Controller', () => {
    let mockPool;

    beforeEach(() => {
        mockPool = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn(),
        };
        sql.connect.mockResolvedValue(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create a new module', async () => {
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful insert

        const response = await request(app)
            .post('/modules')
            .send({
                moduleCode: 'CS101',
                moduleName: 'Introduction to Computer Science',
                moduleDescription: 'Basic concepts of computer science.',
                lecturerId: 1
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Module created successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('ModuleCode', sql.VarChar, 'CS101');
        expect(mockPool.input).toHaveBeenCalledWith('ModuleName', sql.NVarChar, 'Introduction to Computer Science');
        expect(mockPool.input).toHaveBeenCalledWith('ModuleDescription', sql.NVarChar, 'Basic concepts of computer science.');
        expect(mockPool.input).toHaveBeenCalledWith('Lecturer', sql.Int, 1);
        expect(mockPool.query).toHaveBeenCalledWith('INSERT INTO dbo.tblModule (ModuleCode, ModuleName, Description, Lecturer) VALUES (@ModuleCode, @ModuleName, @ModuleDescription, @Lecturer)');
    });

    test('should retrieve all modules', async () => {
        const mockModules = [{ ModuleID: 1, ModuleCode: 'CS101', ModuleName: 'Introduction to Computer Science', Description: 'Basic concepts of computer science.', Lecturer: 1 }];
        mockPool.query.mockResolvedValueOnce({ recordset: mockModules });

        const response = await request(app).get('/modules');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockModules);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM dbo.tblModule');
    });

    test('should retrieve a module by ID', async () => {
        const mockModule = { ModuleID: 1, ModuleCode: 'CS101', ModuleName: 'Introduction to Computer Science', Description: 'Basic concepts of computer science.', Lecturer: 1 };
        mockPool.query.mockResolvedValueOnce({ recordset: [mockModule] });

        const response = await request(app).get('/modules/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockModule);
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('ModuleID', sql.Int, '1');
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM dbo.tblModule WHERE ModuleID = @ModuleID');
    });

    test('should return 404 if module not found', async () => {
        mockPool.query.mockResolvedValueOnce({ recordset: [] });

        const response = await request(app).get('/modules/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Module not found' });
    });

    test('should update module information', async () => {
        const mockModule = { ModuleID: 1, ModuleCode: 'CS101', ModuleName: 'Introduction to Computer Science', Description: 'Basic concepts of computer science.', Lecturer: 1 };
        mockPool.query.mockResolvedValueOnce({ recordset: [mockModule] }); // Simulate module found
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful update

        const response = await request(app)
            .put('/modules/1')
            .send({
                moduleCode: 'CS102',
                moduleName: 'Advanced Computer Science',
                moduleDescription: 'In-depth concepts of computer science.',
                lecturerId: 2
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Module updated successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('ModuleID', sql.Int, '1');
        expect(mockPool.input).toHaveBeenCalledWith('ModuleCode', sql.VarChar, 'CS102');
        expect(mockPool.input).toHaveBeenCalledWith('ModuleName', sql.NVarChar, 'Advanced Computer Science');
        expect(mockPool.input).toHaveBeenCalledWith('ModuleDescription', sql.NVarChar, 'In-depth concepts of computer science.');
        expect(mockPool.input).toHaveBeenCalledWith('Lecturer', sql.Int, 2);
        expect(mockPool.query).toHaveBeenCalledWith('UPDATE dbo.tblModule SET ModuleCode = @ModuleCode, ModuleName = @ModuleName, Description = @ModuleDescription, Lecturer = @Lecturer WHERE ModuleID = @ModuleID');
    });

    test('should return 404 if module to update not found', async () => {
        mockPool.query.mockResolvedValueOnce({ recordset: [] }); // Simulate module not found

        const response = await request(app)
            .put('/modules/1')
            .send({
                moduleCode: 'CS102',
                moduleName: 'Advanced Computer Science',
                moduleDescription: 'In-depth concepts of computer science.',
                lecturerId: 2
            });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Module not found' });
    });

    test('should delete a module', async () => {
        const mockModule = { ModuleID: 1, ModuleCode: 'CS101', ModuleName: 'Introduction to Computer Science', Description: 'Basic concepts of computer science.', Lecturer: 1 };
        mockPool.query.mockResolvedValueOnce({ recordset: [mockModule] }); // Simulate module found
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful delete

        const response = await request(app).delete('/modules/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Module deleted successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('ModuleID', sql.Int, '1');
        expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM dbo.tblModule WHERE ModuleID = @ModuleID');
    });

    test('should return 404 if module to delete not found', async () => {
        mockPool.query.mockResolvedValueOnce({ recordset: [] }); // Simulate module not found

        const response = await request(app).delete('/modules/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Module not found' });
    });

    test('should return 500 for create module error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .post('/modules')
            .send({
                moduleCode: 'CS101',
                moduleName: 'Introduction to Computer Science',
                moduleDescription: 'Basic concepts of computer science.',
                lecturerId: 1
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error creating module: Database error' });
    });

    test('should return 500 for get all modules error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/modules');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error retrieving modules: Database error' });
    });

    test('should return 500 for get module by ID error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/modules/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error retrieving module: Database error' });
    });

    test('should return 500 for update module error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .put('/modules/1')
            .send({
                moduleCode: 'CS102',
                moduleName: 'Advanced Computer Science',
                moduleDescription: 'In-depth concepts of computer science.',
                lecturerId: 2
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error updating module: Database error' });
    });

    test('should return 500 for delete module error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).delete('/modules/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error deleting module: Database error' });
    });
});
