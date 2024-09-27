const { submitAssignment, getAllSubmissions, getSubmissionById, updateSubmission, deleteSubmission } = require('../submissionController');
const sql = require('mssql');

// Mock `mssql`
jest.mock('mssql');

describe('Submission Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('submitAssignment', () => {
        it('should submit an assignment successfully', async () => {
            req.body = {
                studentId: 1,
                assignmentId: 101,
                submissionText: 'My assignment submission',
                videoId: 202
            };

            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({})
            });

            await submitAssignment(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Assignment submitted successfully' });
        });

        it('should return 500 if there is a database error', async () => {
            req.body = {
                studentId: 1,
                assignmentId: 101,
                submissionText: 'My assignment submission',
                videoId: 202
            };

            sql.connect.mockRejectedValueOnce(new Error('Database error'));

            await submitAssignment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error submitting assignment: Database error' });
        });
    });

    describe('getAllSubmissions', () => {
        it('should retrieve all submissions', async () => {
            const submissions = [{ submissionId: 1, studentId: 1, assignmentId: 101 }];
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({ recordset: submissions })
            });

            await getAllSubmissions(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(submissions);
        });

        it('should return 500 if there is a database error', async () => {
            sql.connect.mockRejectedValueOnce(new Error('Database error'));

            await getAllSubmissions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving submissions: Database error' });
        });
    });

    describe('getSubmissionById', () => {
        it('should return the submission by ID', async () => {
            req.params.id = 1;
            const submission = { submissionId: 1, studentId: 1, assignmentId: 101 };
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({ recordset: [submission] })
            });

            await getSubmissionById(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(submission);
        });

        it('should return 404 if the submission is not found', async () => {
            req.params.id = 1;
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({ recordset: [] })
            });

            await getSubmissionById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Submission not found' });
        });

        it('should return 500 if there is a database error', async () => {
            req.params.id = 1;
            sql.connect.mockRejectedValueOnce(new Error('Database error'));

            await getSubmissionById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving submission: Database error' });
        });
    });

    describe('updateSubmission', () => {
        it('should update the submission status successfully', async () => {
            req.params.id = 1;
            req.body.status = 'Completed';
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({})
            });

            await updateSubmission(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Submission status updated successfully' });
        });

        it('should return 500 if there is a database error', async () => {
            req.params.id = 1;
            req.body.status = 'Completed';
            sql.connect.mockRejectedValueOnce(new Error('Database error'));

            await updateSubmission(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error updating submission status: Database error' });
        });
    });

    describe('deleteSubmission', () => {
        it('should delete a submission successfully', async () => {
            req.params.id = 1;
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({})
            });

            await deleteSubmission(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Submission deleted successfully' });
        });

        it('should return 500 if there is a database error', async () => {
            req.params.id = 1;
            sql.connect.mockRejectedValueOnce(new Error('Database error'));

            await deleteSubmission(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting submission: Database error' });
        });
    });
});
