const { Queue } = require('../models');

// Controlled read service: AI workflows have no direct model access or write path.
exports.listEligibleQueues = (user) => {
  if (!user.organizationId) return Promise.resolve([]);
  return Queue.find({ organizationId: user.organizationId, status: 'active', isActive: true, deletedAt: null, visibility: 'public' })
    .select('name description organizationId branchId venueId maximumCapacity averageServiceTimeMinutes statistics category').lean();
};
