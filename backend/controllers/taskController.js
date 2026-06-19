const { Op } = require('sequelize');
const { Task, Project } = require('../models');
const { log } = require('../services/activityService');

const getTasks = async (req, res) => {
  try {
    const { search, status, priority, type, sort = 'newest', page = 1, limit = 10, projectId } = req.query;
    const where = { userId: req.user.id };
    if (projectId) where.projectId = projectId;
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    const order = sort === 'oldest' ? [['createdAt', 'ASC']] : [['createdAt', 'DESC']];
    const offset = (page - 1) * limit;
    const { count, rows } = await Task.findAndCountAll({
      where, order, limit: +limit, offset: +offset,
      include: [{ model: Project, attributes: ['id', 'name'] }]
    });
    res.json({ tasks: rows, total: count, page: +page, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id }, include: [{ model: Project, attributes: ['id', 'name'] }] });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { id: req.body.projectId, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const task = await Task.create({ ...req.body, userId: req.user.id });
    await log(req.user.id, `Created task "${task.name}"`, 'Task', task.id);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.update(req.body);
    await log(req.user.id, `Updated task "${task.name}"`, 'Task', task.id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await log(req.user.id, `Deleted task "${task.name}"`, 'Task', task.id);
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
