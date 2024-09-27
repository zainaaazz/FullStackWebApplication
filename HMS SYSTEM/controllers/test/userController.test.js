const { getAllUsers, getUserById, updateUser, deleteUser } = require('../userController');
const sql = require('mssql');

// Mock `sql.connect` and `sql.request` for database interaction
jest.mock('mssql');

// Helper function to mock admin user
const mockAdminRequest = () => ({
    user: { UserRole: 'Admin' },
    params: { id: 1 },
    body: {
        Username: 'updatedUser',
        FirstName: 'Updated',
        LastName: 'User',
        Email: 'updated@example.com',
        UserRole: 'Student',
        CourseID: 101
    }
});

// Helper function to mock non-admin user
const mockNonAdminRequest = () => ({
    user: { UserRole: 'User' }
});

describe('User Controller', () => {
    let res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();  // Clear mock function history after each test
    });

    describe('getAllUsers', () => {
        it('should return all users for admin', async () => {
            const req = mockAdminRequest();
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({ recordset: [{ id: 1, Username: 'User1' }] })
            });

            await getAllUsers(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalledWith(403);  // Admin should not get 403
            expect(res.json).toHaveBeenCalledWith([{ id: 1, Username: 'User1' }]);
        });

        it('should deny access to non-admin users', async () => {
            const req = mockNonAdminRequest();
            await getAllUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Access denied: Admins only' });
        });
    });

    describe('getUserById', () => {
        it('should return the user by ID for admin', async () => {
            const req = mockAdminRequest();
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({ recordset: [{ id: 1, Username: 'User1' }] })
            });

            await getUserById(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalledWith(403);  // Admin should not get 403
            expect(res.json).toHaveBeenCalledWith({ id: 1, Username: 'User1' });
        });

        it('should return 404 if user not found', async () => {
            const req = mockAdminRequest();
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({ recordset: [] })  // No user found
            });

            await getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should deny access to non-admin users', async () => {
            const req = mockNonAdminRequest();
            await getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Access denied: Admins only' });
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully for admin', async () => {
            const req = mockAdminRequest();
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({})  // Simulate successful update
            });

            await updateUser(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully' });
        });

        it('should deny access to non-admin users', async () => {
            const req = mockNonAdminRequest();
            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Access denied: Admins only' });
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully for admin', async () => {
            const req = mockAdminRequest();
            sql.connect.mockResolvedValueOnce({
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValueOnce({})  // Simulate successful delete
            });

            await deleteUser(req, res);

            expect(sql.connect).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });

        it('should deny access to non-admin users', async () => {
            const req = mockNonAdminRequest();
            await deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Access denied: Admins only' });
        });
    });
});
