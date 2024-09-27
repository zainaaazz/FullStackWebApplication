const request = require('supertest');
const express = require('express');
const sql = require('mssql');
const {
    provideFeedback,
    getAllFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback
} = require('../feedbackController.js'); // Update the path as needed

const app = express();
app.use(express.json());
app.post('/feedback', provideFeedback);
app.get('/feedback', getAllFeedback);
app.get('/feedback/:id', getFeedbackById);
app.put('/feedback/:id', updateFeedback);
app.delete('/feedback/:id', deleteFeedback);

// Mock the database connection
jest.mock('mssql');

describe('Feedback Controller', () => {
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

    test('should provide feedback', async () => {
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful insert

        const response = await request(app)
            .post('/feedback')
            .send({ submissionId: 1, lectureId: 2, feedbackText: 'Great work!', mark: 85 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Feedback provided successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('SubmissionID', sql.Int, 1);
        expect(mockPool.input).toHaveBeenCalledWith('Lecture_ID', sql.Int, 2);
        expect(mockPool.input).toHaveBeenCalledWith('FeedbackText', sql.NVarChar, 'Great work!');
        expect(mockPool.input).toHaveBeenCalledWith('Mark', sql.Int, 85);
        expect(mockPool.query).toHaveBeenCalledWith('INSERT INTO dbo.tblFeedback (SubmissionID, Lecture_ID, FeedbackText, Mark) VALUES (@SubmissionID, @Lecture_ID, @FeedbackText, @Mark)');
    });

    test('should retrieve all feedback', async () => {
        const mockFeedback = [{ SubmissionID: 1, FeedbackText: 'Great work!', Mark: 85, Lecture_ID: 2 }];
        mockPool.query.mockResolvedValueOnce({ recordset: mockFeedback });

        const response = await request(app).get('/feedback');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockFeedback);
        expect(mockPool.query).toHaveBeenCalledWith('SELECT TOP (1000) SubmissionID, FeedbackText, Mark, Lecture_ID FROM dbo.tblFeedback');
    });

    test('should retrieve feedback by ID', async () => {
        const mockFeedback = { SubmissionID: 1, FeedbackText: 'Great work!', Mark: 85, Lecture_ID: 2 };
        mockPool.query.mockResolvedValueOnce({ recordset: [mockFeedback] });

        const response = await request(app).get('/feedback/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockFeedback);
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('FeedbackID', sql.Int, '1');
        expect(mockPool.query).toHaveBeenCalledWith('SELECT SubmissionID, FeedbackText, Mark, Lecture_ID FROM dbo.tblFeedback WHERE FeedbackID = @FeedbackID');
    });

    test('should return 404 if feedback not found', async () => {
        mockPool.query.mockResolvedValueOnce({ recordset: [] });

        const response = await request(app).get('/feedback/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Feedback not found' });
    });

    test('should update feedback by ID', async () => {
        const mockFeedback = { SubmissionID: 1, FeedbackText: 'Great work!', Mark: 85, Lecture_ID: 2 };
        mockPool.query.mockResolvedValueOnce({ recordset: [mockFeedback] }); // Simulate feedback found
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful update

        const response = await request(app)
            .put('/feedback/1')
            .send({ feedbackText: 'Updated feedback text' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Feedback updated successfully', feedback: expect.any(Object) });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('FeedbackID', sql.Int, '1');
        expect(mockPool.input).toHaveBeenCalledWith('FeedbackText', sql.NVarChar, 'Updated feedback text');
        expect(mockPool.query).toHaveBeenCalledWith('UPDATE dbo.tblFeedback SET FeedbackText = @FeedbackText WHERE FeedbackID = @FeedbackID');
    });

    test('should return 404 if feedback to update not found', async () => {
        mockPool.query.mockResolvedValueOnce({ recordset: [] }); // Simulate feedback not found

        const response = await request(app).put('/feedback/1').send({ feedbackText: 'Some feedback' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Feedback not found' });
    });

    test('should delete feedback by ID', async () => {
        const mockFeedback = { SubmissionID: 1, FeedbackText: 'Great work!', Mark: 85, Lecture_ID: 2 };
        mockPool.query.mockResolvedValueOnce({ recordset: [mockFeedback] }); // Simulate feedback found
        mockPool.query.mockResolvedValueOnce({}); // Mocking a successful delete

        const response = await request(app).delete('/feedback/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Feedback deleted successfully' });
        expect(mockPool.request).toHaveBeenCalled();
        expect(mockPool.input).toHaveBeenCalledWith('FeedbackID', sql.Int, '1');
        expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM dbo.tblFeedback WHERE FeedbackID = @FeedbackID');
    });

    test('should return 404 if feedback to delete not found', async () => {
        mockPool.query.mockResolvedValueOnce({ recordset: [] }); // Simulate feedback not found

        const response = await request(app).delete('/feedback/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Feedback not found' });
    });

    test('should return 500 for provide feedback error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .post('/feedback')
            .send({ submissionId: 1, lectureId: 2, feedbackText: 'Great work!', mark: 85 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error providing feedback: Database error' });
    });

    test('should return 500 for get all feedback error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/feedback');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error retrieving feedback: Database error' });
    });

    test('should return 500 for get feedback by ID error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/feedback/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error retrieving feedback: Database error' });
    });

    test('should return 500 for update feedback error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).put('/feedback/1').send({ feedbackText: 'Some feedback' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error updating feedback', error: expect.any(Object) });
    });

    test('should return 500 for delete feedback error', async () => {
        mockPool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).delete('/feedback/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error deleting feedback', error: expect.any(Object) });
    });
});
