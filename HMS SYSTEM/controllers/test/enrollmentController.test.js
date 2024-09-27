const request = require('supertest');
const express = require('express');
const sql = require('mssql');
const { enrollStudent, getAllEnrollments, removeEnrollment } = require('../enrollmentController.js'); // Update the path as needed

const app = express();
app.use(express.json());
app.post('/enroll', enrollStudent);
app.get('/enrollments', getAllEnrollments);
app.delete('/enrollments/:id', removeEnrollment);

// Mock the database connection
jest.mock('mssql');

describe('Enrollment Controller', () => {
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

    test('should enroll a student', async () => {
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful query

        const response = await request(app)
            .post('/enroll')
            .send({ studentId: 1, moduleId: 2 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Student enrolled successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('StudentID', sql.Int, 1);
        expect(mockPool.input).toHaveBeenCalledWith('ModuleID', sql.Int, 2);
        expect(mockPool.query).toHaveBeenCalledWith('INSERT INTO tblStudentModuleEnrollment (StudentID, ModuleID) VALUES (@StudentID, @ModuleID)');
    });

    test('should retrieve all enrollments', async () => {
        const mockEnrollments = [{ EnrollmentID: 1, StudentID: 1, ModuleID: 2 }];
        mockPool.query.mockResolvedValueOnce({ recordset: mockEnrollments });

        const response = await request(app).get('/enrollments');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEnrollments);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM tblStudentModuleEnrollment');
    });

    test('should remove an enrollment', async () => {
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful delete

        const response = await request(app).delete('/enrollments/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Enrollment removed successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('EnrollmentID', sql.Int, '1');
        expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM tblStudentModuleEnrollment WHERE EnrollmentID = @EnrollmentID');
    });

    test('should return 500 for enroll student error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .post('/enroll')
            .send({ studentId: 1, moduleId: 2 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error enrolling student: Database error' });
    });

    test('should return 500 for get all enrollments error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/enrollments');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error retrieving enrollments: Database error' });
    });

    test('should return 500 for remove enrollment error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).delete('/enrollments/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error removing enrollment: Database error' });
    });
});
