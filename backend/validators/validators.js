const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const projectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('status').optional().isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Invalid status value'),
  body('startDate').optional({ nullable: true, checkFalsy: true }).isDate().withMessage('Invalid start date'),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isDate().withMessage('Invalid end date'),
];

const taskRules = [
  body('name').trim().notEmpty().withMessage('Task name is required'),
  body('projectId').notEmpty().withMessage('Project ID is required').isInt().withMessage('Project ID must be an integer'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority value'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status value'),
  body('type').optional().isIn(['Feature', 'Bug', 'Enhancement']).withMessage('Invalid type value'),
  body('dueDate').optional({ nullable: true, checkFalsy: true }).isDate().withMessage('Invalid due date'),
  body('estimatedHours').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
];

module.exports = { validate, registerRules, loginRules, projectRules, taskRules };
