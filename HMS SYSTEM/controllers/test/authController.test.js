// authController.test.js

const request = require('supertest');
const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const { register, login, logout } = require('../authController.js');
const dbConfig = require('../../config/dbConfig');

// Set up express app for testing
const app = express();
app.use(express.json());
app.post('/register', register);
app.post('/login', login);
app.post('/logout', logout);

// Mock the mssql connection and methods
jest.mock('mssql');

describe('Auth Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /register', () => {
        it('should register a user successfully', async () => {
            const userData = {
                UserNumber: 1,
                Password: 'Password123',
                FirstName: 'John',
                LastName: 'Doe',
                Email: 'john.doe@example.com',
                CourseID: 1,
                UserRole: 'Student',
            };

            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({}),
            });

            const response = await request(app).post('/register').send(userData);
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ message: 'User registered' });
        });

        it('should return an error if registration fails', async () => {
            const userData = {
                UserNumber: 1,
                Password: 'Password123',
                FirstName: 'John',
                LastName: 'Doe',
                Email: 'john.doe@example.com',
                CourseID: 1,
                UserRole: 'Student',
            };

            sql.connect.mockRejectedValue(new Error('Database connection error'));

            const response = await request(app).post('/register').send(userData);
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error registering user: Database connection error');
        });
    });

    describe('POST /login', () => {
        it('should log in a user and return an access token', async () => {
            const userData = {
                UserNumber: 1,
                Password: 'Password123',
            };

            const hashedPassword = await bcrypt.hash(userData.Password, 10);

            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({
                    recordset: [{ UserNumber: userData.UserNumber, PasswordHash: hashedPassword, UserRole: 'Student' }],
                }),
            });

            const response = await request(app).post('/login').send(userData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
        });

        it('should return an error for invalid credentials', async () => {
            const userData = {
                UserNumber: 1,
                Password: 'WrongPassword',
            };

            sql.connect.mockResolvedValue({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({
                    recordset: [{ UserNumber: userData.UserNumber, PasswordHash: 'hashedpassword' }],
                }),
            });

            const response = await request(app).post('/login').send(userData);
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Invalid credentials' });
        });

        it('should return an error if login fails', async () => {
            const userData = {
                UserNumber: 1,
                Password: 'Password123',
            };

            sql.connect.mockRejectedValue(new Error('Database connection error'));

            const response = await request(app).post('/login').send(userData);
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error logging in: Database connection error');
        });
    });

    describe('POST /logout', () => {
        it('should log out a user', async () => {
            const response = await request(app).post('/logout');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'User logged out' });
        });
    });
});
