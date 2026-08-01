process.env.NODE_ENV = 'test';
process.env.SKIP_DB_CONNECT = 'true';

jest.mock('../src/repositories/queueRepository', () => ({
  create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn(), restore: jest.fn(), softDelete: jest.fn(), findDuplicateName: jest.fn(),
}));
jest.mock('../src/services/auditService', () => ({ record: jest.fn().mockResolvedValue({}) }));

const repo = require('../src/repositories/queueRepository');
const service = require('../src/services/queueService');

const manager = { _id: '507f1f77bcf86cd799439011', roleNames: ['venue_manager'] };
const req = { id: 'req_test', ip: '127.0.0.1', get: () => 'jest' };
const base = { _id: '507f1f77bcf86cd799439012', id: '507f1f77bcf86cd799439012', name: 'Main', organizationId: '507f1f77bcf86cd799439013', branchId: '507f1f77bcf86cd799439014', venueId: '507f1f77bcf86cd799439015', status: 'draft', isActive: false };

describe('queue service', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a queue from a reusable template', async () => {
    repo.findDuplicateName.mockResolvedValue(null);
    repo.create.mockImplementation(async (payload) => ({ ...payload, id: base.id }));
    const created = await service.create({ ...base, templateKey: 'hospital_opd', averageServiceTimeMinutes: 9, maximumCapacity: 10 }, manager, req);
    expect(created.tokenPrefix).toBe('OPD');
    expect(created.category).toBe('hospital_opd');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ createdBy: manager._id }));
  });

  test('rejects duplicate names within a venue', async () => {
    repo.findDuplicateName.mockResolvedValue(base);
    await expect(service.create({ ...base, averageServiceTimeMinutes: 5, maximumCapacity: 10 }, manager, req)).rejects.toThrow('unique within the same venue');
  });

  test('enforces approved status transitions', async () => {
    repo.findById.mockResolvedValue({ ...base, status: 'draft' });
    await expect(service.transition(base.id, 'closed', 'closed', manager, req)).rejects.toThrow('Invalid queue status transition');
  });

  test('pauses an active queue', async () => {
    repo.findById.mockResolvedValue({ ...base, status: 'active', isActive: true });
    repo.update.mockResolvedValue({ ...base, status: 'paused', isActive: false });
    const paused = await service.transition(base.id, 'paused', 'paused', manager, req);
    expect(paused.status).toBe('paused');
    expect(repo.update).toHaveBeenCalledWith(base.id, expect.any(Object), expect.objectContaining({ status: 'paused', isActive: false }));
  });

  test('prevents non-manager queue creation', async () => {
    await expect(service.create(base, { _id: manager._id, roleNames: ['user'] }, req)).rejects.toThrow('Only venue managers');
  });
});
