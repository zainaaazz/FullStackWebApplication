const { downloadFile, streamFile, getAllRoles, updateUserRole } = require('../utilityController');
const sql = require('mssql');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

jest.mock('mssql');
jest.mock('axios');
jest.mock('fs');
jest.mock('path');
jest.mock('../../config/dbConfig', () => ({}));

describe('Utility Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      download: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      mockReq.params = { id: '1' };
      
      const mockPool = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [{ VideoURL: 'http://example.com/video.mp4' }] })
      };
      sql.connect.mockResolvedValue(mockPool);

      const mockStream = {
        pipe: jest.fn(),
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'finish') callback();
          return mockStream;
        })
      };
      axios.mockResolvedValue({ data: mockStream });

      fs.createWriteStream.mockReturnValue(mockStream);
      path.join.mockReturnValue('/temp/video_1.mp4');

      await downloadFile(mockReq, mockRes);

      expect(mockRes.download).toHaveBeenCalledWith('/temp/video_1.mp4', 'video_1.mp4', expect.any(Function));
    });

    it('should handle video not found', async () => {
      mockReq.params = { id: '1' };
      
      const mockPool = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [] })
      };
      sql.connect.mockResolvedValue(mockPool);

      await downloadFile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Video not found' });
    });
  });

  describe('streamFile', () => {
    it('should stream a file successfully', async () => {
      mockReq.params = { id: '1' };
      
      const mockPool = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [{ VideoURL: 'http://example.com/video.mp4' }] })
      };
      sql.connect.mockResolvedValue(mockPool);

      const mockStream = {
        pipe: jest.fn()
      };
      axios.mockResolvedValue({ data: mockStream });

      await streamFile(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'video/mp4');
      expect(mockStream.pipe).toHaveBeenCalledWith(mockRes);
    });

    it('should handle video not found', async () => {
      mockReq.params = { id: '1' };
      
      const mockPool = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [] })
      };
      sql.connect.mockResolvedValue(mockPool);

      await streamFile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Video not found' });
    });
  });

  describe('getAllRoles', () => {
    it('should retrieve all roles successfully', async () => {
      const mockRoles = [{ RoleID: 1, RoleName: 'Admin' }, { RoleID: 2, RoleName: 'User' }];
      const mockPool = {
        request: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: mockRoles })
      };
      sql.connect.mockResolvedValue(mockPool);

      await getAllRoles(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockRoles);
    });

    it('should handle database errors', async () => {
      sql.connect.mockRejectedValue(new Error('Database error'));

      await getAllRoles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: expect.stringContaining('Error retrieving roles') });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { role: 'Admin' };

      const mockPool = {
        request: jest.fn().mockReturnThis(),
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({})
      };
      sql.connect.mockResolvedValue(mockPool);

      await updateUserRole(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User role updated successfully' });
    });

    it('should handle database errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { role: 'Admin' };

      sql.connect.mockRejectedValue(new Error('Database error'));

      await updateUserRole(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: expect.stringContaining('Error updating user role') });
    });
  });
});