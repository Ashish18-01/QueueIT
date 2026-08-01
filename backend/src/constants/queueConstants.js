const QUEUE_STATUSES = ['draft', 'active', 'paused', 'closed', 'archived'];
const QUEUE_VISIBILITIES = ['public', 'private', 'internal'];
const TOKEN_STRATEGIES = ['sequential', 'daily_reset', 'manual'];
const QUEUE_CATEGORIES = ['hospital_opd', 'bank_counter', 'library_desk', 'college_cafeteria', 'help_desk', 'general'];
const QUEUE_ACTION_ROLES = ['venue_manager', 'organization_admin', 'super_admin', 'admin', 'owner'];
const MUTABLE_STATUSES = ['draft', 'active', 'paused', 'closed'];
const ALLOWED_STATUS_TRANSITIONS = {
  draft: ['active', 'archived'],
  active: ['paused', 'closed', 'archived'],
  paused: ['active', 'closed', 'archived'],
  closed: ['archived'],
  archived: ['closed'],
};
const QUEUE_TEMPLATES = {
  hospital_opd: { name: 'Hospital OPD', category: 'hospital_opd', tokenPrefix: 'OPD', tokenStrategy: 'daily_reset', averageServiceTimeMinutes: 10, maximumCapacity: 150, dailyCapacity: 500, visibility: 'public', priorityEnabled: true },
  bank_counter: { name: 'Bank Counter', category: 'bank_counter', tokenPrefix: 'BNK', tokenStrategy: 'daily_reset', averageServiceTimeMinutes: 8, maximumCapacity: 75, dailyCapacity: 300, visibility: 'public', priorityEnabled: false },
  library_desk: { name: 'Library Desk', category: 'library_desk', tokenPrefix: 'LIB', tokenStrategy: 'sequential', averageServiceTimeMinutes: 5, maximumCapacity: 50, dailyCapacity: 200, visibility: 'public', priorityEnabled: false },
  college_cafeteria: { name: 'College Cafeteria', category: 'college_cafeteria', tokenPrefix: 'CAF', tokenStrategy: 'daily_reset', averageServiceTimeMinutes: 3, maximumCapacity: 200, dailyCapacity: 1000, visibility: 'public', priorityEnabled: false },
  help_desk: { name: 'Help Desk', category: 'help_desk', tokenPrefix: 'HLP', tokenStrategy: 'sequential', averageServiceTimeMinutes: 12, maximumCapacity: 100, dailyCapacity: 350, visibility: 'public', priorityEnabled: true },
};
module.exports = { QUEUE_STATUSES, QUEUE_VISIBILITIES, TOKEN_STRATEGIES, QUEUE_CATEGORIES, QUEUE_ACTION_ROLES, MUTABLE_STATUSES, ALLOWED_STATUS_TRANSITIONS, QUEUE_TEMPLATES };
