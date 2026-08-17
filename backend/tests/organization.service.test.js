process.env.NODE_ENV = 'test';
process.env.SKIP_DB_CONNECT = 'true';

jest.mock('../src/models', () => ({
  Organization: { create: jest.fn(), find: jest.fn(), findOne: jest.fn() },
  User: { updateOne: jest.fn() },
  Queue: { find: jest.fn() },
  QueueEntry: { find: jest.fn() },
}));
jest.mock('../src/services/auditService', () => ({ record: jest.fn().mockResolvedValue({}) }));

const { Organization, User, Queue, QueueEntry } = require('../src/models');
const service = require('../src/services/organizationService');

const req = { id: 'req_test' };
const organizer = { _id: '507f1f77bcf86cd799439011', roleNames: ['organization_admin'] };

describe('organization service', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates an organization for an organization admin and assigns membership', async () => {
    Organization.findOne.mockResolvedValue(null);
    Organization.create.mockResolvedValue({ id: 'org1', _id: '507f1f77bcf86cd799439013', name: 'QueueIt Test Organization', slug: 'queueit-test-organization' });
    const org = await service.create({ name: 'QueueIt Test Organization' }, organizer, req);
    expect(org.slug).toBe('queueit-test-organization');
    expect(User.updateOne).toHaveBeenCalledWith({ _id: organizer._id }, expect.objectContaining({ $set: { organizationId: org._id } }));
  });

  test('rejects organization creation by customers', async () => {
    await expect(service.create({ name: 'Bad Org' }, { _id: organizer._id, roleNames: ['user'] }, req)).rejects.toThrow('Only organization admins');
  });

  test('loads dashboard data within the organizer organization scope', async () => {
    const organization = { _id: '507f1f77bcf86cd799439013', name: 'Org' };
    Organization.findOne.mockResolvedValue(organization);
    Queue.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    QueueEntry.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    const dashboard = await service.dashboard(organization._id, organizer);
    expect(dashboard.organization.name).toBe('Org');
    expect(Queue.find).toHaveBeenCalledWith(expect.objectContaining({ organizationId: organization._id }));
  });
});
