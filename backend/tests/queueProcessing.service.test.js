process.env.NODE_ENV = 'test';
process.env.SKIP_DB_CONNECT = 'true';

jest.mock('../src/repositories/queueEntryRepository', () => ({
  findById: jest.fn(), findNextWaiting: jest.fn(), update: jest.fn(), findActiveOrdered: jest.fn(), countByStatus: jest.fn(), averageCompletedWaitMs: jest.fn(),
}));
jest.mock('../src/repositories/queueRepository', () => ({ findById: jest.fn(), update: jest.fn() }));
jest.mock('../src/services/auditService', () => ({ record: jest.fn().mockResolvedValue({}) }));

const entryRepo = require('../src/repositories/queueEntryRepository');
const queueRepo = require('../src/repositories/queueRepository');
const service = require('../src/services/queueProcessingService');

const manager = { _id: '507f1f77bcf86cd799439016', roleNames: ['counter_operator'], organizationId: '507f1f77bcf86cd799439013' };
const user = { _id: '507f1f77bcf86cd799439011', roleNames: ['user'] };
const queue = { _id: '507f1f77bcf86cd799439012', id: '507f1f77bcf86cd799439012', organizationId: '507f1f77bcf86cd799439013', branchId: '507f1f77bcf86cd799439014', venueId: '507f1f77bcf86cd799439015', status: 'active', isActive: true, averageServiceTimeMinutes: 6 };
const entry = { _id: '507f1f77bcf86cd799439017', queueId: queue.id, organizationId: queue.organizationId, branchId: queue.branchId, venueId: queue.venueId, status: 'waiting', tokenNumber: 1 };
const req = { id: 'req_test', ip: '127.0.0.1', get: () => 'jest' };

describe('queue processing service', () => {
  beforeEach(() => { jest.clearAllMocks(); queueRepo.findById.mockResolvedValue(queue); entryRepo.findActiveOrdered.mockResolvedValue([]); entryRepo.countByStatus.mockResolvedValue(0); entryRepo.averageCompletedWaitMs.mockResolvedValue(0); });

  test('calls the next waiting customer', async () => {
    entryRepo.findNextWaiting.mockResolvedValue(entry);
    entryRepo.update.mockResolvedValue({ ...entry, status: 'called' });
    const updated = await service.callNext(queue.id, {}, manager, req);
    expect(updated.status).toBe('called');
    expect(entryRepo.findNextWaiting).toHaveBeenCalledWith(queue.id);
  });

  test('rejects unauthorized queue processors', async () => {
    await expect(service.callNext(queue.id, {}, user, req)).rejects.toThrow('can process queues');
  });

  test('prevents invalid transitions', async () => {
    entryRepo.findById.mockResolvedValue({ ...entry, status: 'waiting' });
    await expect(service.completeService(entry._id, manager, req)).rejects.toThrow('Invalid queue entry transition');
  });

  test('rejects an entry changed concurrently by another operator', async () => {
    entryRepo.findNextWaiting.mockResolvedValue(entry);
    entryRepo.update.mockResolvedValue(null);
    await expect(service.callNext(queue.id, {}, manager, req)).rejects.toThrow('changed by another operator');
    expect(entryRepo.update).toHaveBeenCalledWith(entry._id, expect.any(Object), expect.objectContaining({ status: 'called' }), 'waiting');
  });

  test('starts and completes service with timestamps', async () => {
    entryRepo.findById.mockResolvedValue({ ...entry, status: 'called' });
    entryRepo.update.mockResolvedValueOnce({ ...entry, status: 'in_service' });
    await expect(service.startService(entry._id, {}, manager, req)).resolves.toMatchObject({ status: 'in_service' });
    expect(entryRepo.update.mock.calls[0][2].serviceStartedAt).toBeInstanceOf(Date);
    entryRepo.findById.mockResolvedValue({ ...entry, status: 'in_service' });
    entryRepo.update.mockResolvedValueOnce({ ...entry, status: 'completed' });
    await expect(service.completeService(entry._id, manager, req)).resolves.toMatchObject({ status: 'completed' });
    expect(entryRepo.update.mock.calls.at(-1)[2].serviceCompletedAt).toBeInstanceOf(Date);
  });
});
