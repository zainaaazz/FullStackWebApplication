const request = require('supertest');
const express = require('express');
const sql = require('mssql');
const app = express();
const bodyParser = require('body-parser');

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Mock the database connection and the controller
jest.mock('mssql');
const {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} = require('../courseController.js');

app.post('/courses', createCourse);
app.get('/courses', getAllCourses);
app.get('/courses/:id', getCourseById);
app.put('/courses/:id', updateCourse);
app.delete('/courses/:id', deleteCourse);

describe('Course Controller', () => {
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

    test('should create a course', async () => {
        const newCourse = {
            courseCode: 'CS101',
            courseName: 'Computer Science',
            duration: 4,
            year: 2023
        };

        const response = await request(app)
            .post('/courses')
            .send(newCourse);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Course created successfully' });
        expect(pool.request).toHaveBeenCalled();
        expect(pool.request().input).toHaveBeenCalledTimes(4);
    });

    test('should retrieve all courses', async () => {
        pool.query.mockResolvedValue({
            recordset: [
                { CourseID: 1, CourseCode: 'CS101', CourseName: 'Computer Science', Duration: 4, Year: 2023 }
            ]
        });

        const response = await request(app).get('/courses');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('CourseName', 'Computer Science');
    });

    test('should retrieve a course by ID', async () => {
        pool.query.mockResolvedValue({
            recordset: [
                { CourseID: 1, CourseCode: 'CS101', CourseName: 'Computer Science', Duration: 4, Year: 2023 }
            ]
        });

        const response = await request(app).get('/courses/1');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('CourseName', 'Computer Science');
    });

    test('should return 404 for non-existing course', async () => {
        pool.query.mockResolvedValue({ recordset: [] });

        const response = await request(app).get('/courses/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Course not found' });
    });

    test('should update a course', async () => {
        const updatedCourse = {
            courseCode: 'CS102',
            courseName: 'Advanced Computer Science',
            duration: 5,
            year: 2024
        };

        const response = await request(app)
            .put('/courses/1')
            .send(updatedCourse);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Course updated successfully' });
    });

    test('should delete a course', async () => {
        const response = await request(app).delete('/courses/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Course deleted successfully' });
    });
});
