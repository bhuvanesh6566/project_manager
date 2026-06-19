const { Op } = require('sequelize');
const { Project, Task } = require('../models');
const { log } = require('../services/activityService');

const getProjects = async (req, res) => {
  try {
    const { search, status, sort = 'newest', page = 1, limit = 10 } = req.query;
    const where = { userId: req.user.id };
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (status) where.status = status;
    const order = sort === 'oldest' ? [['createdAt', 'ASC']] : [['createdAt', 'DESC']];
    const offset = (page - 1) * limit;
    const { count, rows } = await Project.findAndCountAll({ where, order, limit: +limit, offset: +offset });
    const projectsWithProgress = await Promise.all(rows.map(async (p) => {
      const total = await Task.count({ where: { projectId: p.id } });
      const completed = await Task.count({ where: { projectId: p.id, status: 'Completed' } });
      return { ...p.toJSON(), progress: total > 0 ? Math.round((completed / total) * 100) : 0, taskCount: total };
    }));
    res.json({ projects: projectsWithProgress, total: count, page: +page, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id }, include: [{ model: Task, order: [['createdAt', 'DESC']] }] });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const total = project.Tasks.length;
    const completed = project.Tasks.filter(t => t.status === 'Completed').length;
    res.json({ ...project.toJSON(), progress: total > 0 ? Math.round((completed / total) * 100) : 0, taskCount: total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }
    const project = await Project.create({ name, description, status, startDate, endDate, userId: req.user.id });
    await log(req.user.id, `Created project "${project.name}"`, 'Project', project.id);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { name, description, status, startDate, endDate } = req.body;
    const newStart = startDate || project.startDate;
    const newEnd = endDate || project.endDate;
    if (newStart && newEnd && new Date(newEnd) < new Date(newStart)) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }
    await project.update({ name, description, status, startDate, endDate });
    await log(req.user.id, `Updated project "${project.name}"`, 'Project', project.id);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const taskCount = await Task.count({ where: { projectId: project.id } });
    await log(req.user.id, `Deleted project "${project.name}" (${taskCount} tasks removed)`, 'Project', project.id);
    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
