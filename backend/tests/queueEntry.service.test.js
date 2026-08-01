process.env.NODE_ENV = 'test';
process.env.SKIP_DB_CONNECT = 'true';

jest.mock('../src/repositories/queueEntryRepository', () => ({
  create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), countActive: jest.fn(), findActiveByCustomer: jest.fn(), nextTokenNumber: jest.fn(), update: jest.fn(), findActiveOrdered: jest.fn(), countByStatus: jest.fn(), averageCompletedWaitMs: jest.fn(),
}));
jest.mock('../src/repositories/queueRepository', () => ({ findById: jest.fn(), update: jest.fn() }));
jest.mock('../src/services/auditService', () => ({ record: jest.fn().mockResolvedValue({}) }));

const entryRepo = require('../src/repositories/queueEntryRepository');
const queueRepo = require('../src/repositories/queueRepository');
const service = require('../src/services/queueEntryService');

const user = { _id: '507f1f77bcf86cd799439011', roleNames: ['user'] };
const manager = { _id: '507f1f77bcf86cd799439016', roleNames: ['venue_manager'] };
const queue = { _id: '507f1f77bcf86cd799439012', id: '507f1f77bcf86cd799439012', organizationId: '507f1f77bcf86cd799439013', branchId: '507f1f77bcf86cd799439014', venueId: '507f1f77bcf86cd799439015', tokenPrefix: 'Q', status: 'active', isActive: true, maximumCapacity: 2, averageServiceTimeMinutes: 5 };
const req = { id: 'req_test', ip: '127.0.0.1', get: () => 'jest' };

describe('queue entry service', () => {
  beforeEach(() => { jest.clearAllMocks(); entryRepo.findActiveOrdered.mockResolvedValue([]); entryRepo.countByStatus.mockResolvedValue(0); entryRepo.averageCompletedWaitMs.mockResolvedValue(0); });

  test('joins an active queue with sequential FIFO token', async () => {
    queueRepo.findById.mockResolvedValue(queue);
    entryRepo.findActiveByCustomer.mockResolvedValue(null);
    entryRepo.countActive.mockResolvedValue(1);
    entryRepo.nextTokenNumber.mockResolvedValue(2);
    entryRepo.create.mockImplementation(async (payload) => ({ ...payload, id: 'entry1' }));
    const entry = await service.join(queue.id, {}, user, req);
    expect(entry.tokenNumber).toBe(2);
    expect(entry.token).toBe('Q-0002');
  });

  test('rejects duplicate active joins', async () => {
    queueRepo.findById.mockResolvedValue(queue);
    entryRepo.findActiveByCustomer.mockResolvedValue({});
    await expect(service.join(queue.id, {}, user, req)).rejects.toThrow('already has an active entry');
  });

  test('rejects paused queues', async () => {
    queueRepo.findById.mockResolvedValue({ ...queue, status: 'paused', isActive: false });
    await expect(service.join(queue.id, {}, user, req)).rejects.toThrow('not accepting');
  });

  test('enforces capacity', async () => {
    queueRepo.findById.mockResolvedValue(queue);
    entryRepo.findActiveByCustomer.mockResolvedValue(null);
    entryRepo.countActive.mockResolvedValue(2);
    await expect(service.join(queue.id, {}, user, req)).rejects.toThrow('capacity');
  });

  test('lets a manager cancel an active entry', async () => {
    entryRepo.findById.mockResolvedValue({ _id: 'entry1', customerId: user._id, status: 'waiting', queueId: queue.id, organizationId: queue.organizationId, branchId: queue.branchId, venueId: queue.venueId });
    entryRepo.update.mockResolvedValue({ status: 'cancelled' });
    await expect(service.cancel('entry1', manager, req)).resolves.toEqual({ status: 'cancelled' });
  });
});
