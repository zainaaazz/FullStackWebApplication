const request = require('supertest');
const express = require('express');
const sql = require('mssql');
const app = express();
const bodyParser = require('body-parser');

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

jest.mock('mssql');
const { 
    createAssignment, 
    getAllAssignments, 
    getAllAssignmentsByModuleId, 
    getAssignmentById, 
    updateAssignment, 
    deleteAssignment 
} = require('../assignmentController.js');

app.post('/assignments', createAssignment);
app.get('/assignments', getAllAssignments);
app.get('/assignments/:id', getAssignmentById);
app.get('/modules/:ModuleID/assignments', getAllAssignmentsByModuleId);
app.put('/assignments/:id', updateAssignment);
app.delete('/assignments/:id', deleteAssignment);

describe('Assignment Controller', () => {
    let pool;

    beforeAll(() => {
        pool = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };
        sql.connect.mockResolvedValue(pool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create an assignment', async () => {
        const newAssignment = {
            title: 'Test Assignment',
            instructions: 'Instructions for test',
            dueDate: new Date().toISOString(),  // Ensure the date is properly formatted
            ModuleID: 1
        };

        pool.query.mockResolvedValueOnce({});  // Mock the query for assignment creation

        const response = await request(app)
            .post('/assignments')
            .send(newAssignment);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Assignment created successfully' });
        expect(pool.request).toHaveBeenCalled();
        expect(pool.request().input).toHaveBeenCalledTimes(4);  // Expect 4 inputs
        expect(pool.request().input).toHaveBeenCalledWith('Title', sql.NVarChar, 'Test Assignment');
        expect(pool.request().input).toHaveBeenCalledWith('Instructions', sql.NVarChar, 'Instructions for test');
    });

    test('should retrieve all assignments', async () => {
        pool.query.mockResolvedValue({
            recordset: [
                { AssignmentID: 1, Title: 'Test Assignment', Instructions: 'Instructions', CreatedAt: new Date().toISOString(), DueDate: new Date().toISOString(), ModuleID: 1 }
            ]
        });

        const response = await request(app).get('/assignments');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('Title', 'Test Assignment');
        expect(pool.query).toHaveBeenCalledTimes(1);  // Ensure the query was called once
    });

    test('should retrieve an assignment by ID', async () => {
        pool.query.mockResolvedValue({
            recordset: [
                { AssignmentID: 1, Title: 'Test Assignment', Instructions: 'Instructions', CreatedAt: new Date().toISOString(), DueDate: new Date().toISOString(), ModuleID: 1 }
            ]
        });

        const response = await request(app).get('/assignments/1');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('Title', 'Test Assignment');
        expect(pool.request().input).toHaveBeenCalledWith('AssignmentID', sql.Int, 1);  // Ensure ID was passed correctly
    });

    test('should return 404 for non-existing assignment', async () => {
        pool.query.mockResolvedValue({ recordset: [] });

        const response = await request(app).get('/assignments/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Assignment not found' });
    });

    test('should retrieve assignments by ModuleID', async () => {
        pool.query.mockResolvedValue({
            recordset: [
                { AssignmentID: 1, Title: 'Module Assignment', Instructions: 'Instructions', CreatedAt: new Date().toISOString(), DueDate: new Date().toISOString(), ModuleID: 1 }
            ]
        });

        const response = await request(app).get('/modules/1/assignments');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('Title', 'Module Assignment');
    });

    test('should update an assignment', async () => {
        const updatedAssignment = {
            title: 'Updated Assignment',
            instructions: 'Updated Instructions',
            dueDate: new Date().toISOString(),
            ModuleID: 2
        };

        pool.query.mockResolvedValueOnce({});  // Mock the query for assignment update

        const response = await request(app)
            .put('/assignments/1')
            .send(updatedAssignment);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Assignment updated successfully' });
        expect(pool.request().input).toHaveBeenCalledWith('AssignmentID', sql.Int, 1);  // Check if ID input is correct
    });

    test('should delete an assignment', async () => {
        pool.query.mockResolvedValueOnce({});  // Mock the query for deletion

        const response = await request(app).delete('/assignments/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Assignment deleted successfully' });
        expect(pool.request().input).toHaveBeenCalledWith('AssignmentID', sql.Int, 1);  // Check if ID input is correct
    });
});
