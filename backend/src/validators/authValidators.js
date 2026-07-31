const { body, param, validationResult } = require('express-validator');
const { ValidationError } = require('../errors');
const validate = (rules) => [...rules, (req, _res, next) => { const result = validationResult(req); return result.isEmpty() ? next() : next(new ValidationError('Validation failed', result.array())); }];
const password = body('password').isString().isLength({ min: 12 });
module.exports = {
  validate,
  register: validate([body('email').isEmail(), body('name').trim().isLength({ min: 1 }), password]),
  login: validate([body('email').isEmail(), body('password').isString().notEmpty()]),
  tokenBody: validate([body('refreshToken').optional().isString()]),
  forgot: validate([body('email').isEmail()]),
  reset: validate([body('token').isString().notEmpty(), password]),
  change: validate([body('currentPassword').isString().notEmpty(), body('password').isString().isLength({ min: 12 })]),
  verify: validate([body('token').optional().isString(), param('token').optional().isString()]),
  google: validate([body('idToken').optional().isString(), body('email').optional().isEmail(), body('googleId').optional().isString()]),
  roleAssign: validate([body('roles').isArray()]),
  permissionAssign: validate([body('permissions').isArray()]),
};
