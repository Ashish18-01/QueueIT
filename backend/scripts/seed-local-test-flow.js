const mongoose = require('mongoose');
const { config, validateEnv } = require('../src/config/env');
const { connectDatabase, disconnectDatabase } = require('../src/database/connection');
const { User, Session, AuthToken, QueueEntry } = require('../src/models');
const passwords = require('../src/services/passwordService');

const ids = {
  organizationId: new mongoose.Types.ObjectId(process.env.LOCAL_TEST_ORGANIZATION_ID || '66bce0000000000000000001'),
  branchId: new mongoose.Types.ObjectId(process.env.LOCAL_TEST_BRANCH_ID || '66bce0000000000000000002'),
  venueId: new mongoose.Types.ObjectId(process.env.LOCAL_TEST_VENUE_ID || '66bce0000000000000003'),
};

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for local test seeding`);
  return value;
};

const upsertUser = async ({ email, name, roleNames, password, tenant }) => {
  passwords.assertStrong(password);
  const passwordHash = await passwords.hashPassword(password);
  const update = {
    email,
    name,
    passwordHash,
    passwordHistory: [{ hash: passwordHash, changedAt: new Date() }],
    passwordChangedAt: new Date(),
    emailVerified: true,
    emailVerifiedAt: new Date(),
    roleNames,
    status: 'active',
    ...tenant,
  };
  return User.findOneAndUpdate({ email }, { $set: update }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
};

async function main() {
  if (config.isProduction) throw new Error('Refusing to seed local test users when NODE_ENV=production');
  validateEnv();
  await connectDatabase();

  const adminEmail = process.env.LOCAL_TEST_ADMIN_EMAIL || 'admin@queueit.local';
  const customerEmail = process.env.LOCAL_TEST_CUSTOMER_EMAIL || 'customer@queueit.local';
  const adminPassword = required('LOCAL_TEST_ADMIN_PASSWORD');
  const customerPassword = required('LOCAL_TEST_CUSTOMER_PASSWORD');

  const users = await User.find({ email: { $in: [adminEmail, customerEmail] } }).select('_id');
  const userIds = users.map((user) => user._id);
  if (userIds.length) {
    await Promise.all([
      Session.deleteMany({ user: { $in: userIds } }),
      AuthToken.deleteMany({ user: { $in: userIds } }),
      QueueEntry.deleteMany({ customerId: { $in: userIds } }),
    ]);
  }

  const admin = await upsertUser({
    email: adminEmail,
    name: 'QueueIt Test Admin',
    password: adminPassword,
    roleNames: ['organization_admin'],
    tenant: ids,
  });
  const customer = await upsertUser({
    email: customerEmail,
    name: 'QueueIt Test Customer',
    password: customerPassword,
    roleNames: ['user'],
    tenant: {},
  });

  console.log(JSON.stringify({
    admin: { id: admin.id, email: admin.email, roleNames: admin.roleNames },
    customer: { id: customer.id, email: customer.email, roleNames: customer.roleNames },
    tenant: Object.fromEntries(Object.entries(ids).map(([key, value]) => [key, String(value)])),
  }, null, 2));
}

main().catch((err) => { console.error(err); process.exitCode = 1; }).finally(async () => { await disconnectDatabase(); });
