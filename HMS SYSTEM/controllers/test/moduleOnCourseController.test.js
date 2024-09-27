const request = require('supertest');
const express = require('express');
const sql = require('mssql');
const {
    addModuleToCourse,
    removeModuleFromCourse
} = require('../moduleOnCourseController.js'); // Update the path as needed

const app = express();
app.use(express.json());
app.post('/modulesOnCourse', addModuleToCourse);
app.delete('/modulesOnCourse/:id', removeModuleFromCourse);

// Mock the database connection
jest.mock('mssql');

describe('Module on Course Controller', () => {
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

    test('should add a module to a course', async () => {
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful insert

        const response = await request(app)
            .post('/modulesOnCourse')
            .send({ courseId: 1, moduleId: 2 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Module added to course successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('CourseID', sql.Int, 1);
        expect(mockPool.input).toHaveBeenCalledWith('ModuleID', sql.Int, 2);
        expect(mockPool.query).toHaveBeenCalledWith('INSERT INTO dbo.tblModuleOnCourse (CourseID, ModuleID) VALUES (@CourseID, @ModuleID)');
    });

    test('should return 500 for add module to course error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .post('/modulesOnCourse')
            .send({ courseId: 1, moduleId: 2 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error adding module to course: Database error' });
    });

    test('should remove a module from a course', async () => {
        mockPool.query.mockResolvedValueOnce({ rowsAffected: [1] }); // Mocking successful deletion

        const response = await request(app).delete('/modulesOnCourse/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Module removed from course successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('ID', sql.Int, '1');
        expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM dbo.tblModuleOnCourse WHERE ID = @ID');
    });

    test('should return 404 if module to remove not found', async () => {
        mockPool.query.mockResolvedValueOnce({ rowsAffected: [0] }); // Simulate module not found

        const response = await request(app).delete('/modulesOnCourse/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Module not found' });
    });

    test('should return 500 for remove module from course error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).delete('/modulesOnCourse/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error removing module from course: Database error' });
    });
});
