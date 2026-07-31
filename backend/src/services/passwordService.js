const bcrypt = require('bcrypt');
const { ValidationError } = require('../errors');
const rounds = 12;
const assertStrong = (password) => {
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(password || '')) throw new ValidationError('Password is too weak');
};
const hashPassword = (password) => bcrypt.hash(password, rounds);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash || '');
const assertNotReused = async (password, hashes = []) => { for (const h of hashes) if (await bcrypt.compare(password, h.hash || h)) throw new ValidationError('Password was used previously'); };
module.exports = { assertStrong, hashPassword, verifyPassword, assertNotReused };
