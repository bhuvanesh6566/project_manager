const { Op, fn, col, literal } = require('sequelize');
const { Project, Task, ActivityLog } = require('../models');
const sequelize = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [totalProjects, totalTasks, completedTasks, pendingTasks, inProgressProjects, overdueTasks] = await Promise.all([
      Project.count({ where: { userId } }),
      Task.count({ where: { userId } }),
      Task.count({ where: { userId, status: 'Completed' } }),
      Task.count({ where: { userId, status: 'Pending' } }),
      Project.count({ where: { userId, status: 'In Progress' } }),
      Task.count({ where: { userId, status: { [Op.ne]: 'Completed' }, dueDate: { [Op.lt]: now } } }),
    ]);

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Task status pie chart
    const taskStatusData = await Task.findAll({
      where: { userId },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // Task priority bar chart
    const taskPriorityData = await Task.findAll({
      where: { userId },
      attributes: ['priority', [fn('COUNT', col('id')), 'count']],
      group: ['priority'],
      raw: true,
    });

    // Weekly completed tasks line chart (last 7 weeks)
    const weeklyData = await sequelize.query(
      `SELECT WEEK(updatedAt) as week, COUNT(*) as count FROM Tasks 
       WHERE userId = :userId AND status = 'Completed' AND updatedAt >= DATE_SUB(NOW(), INTERVAL 7 WEEK)
       GROUP BY WEEK(updatedAt) ORDER BY week ASC`,
      { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
    );

    // Recently updated projects
    const recentProjects = await Project.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: 5,
    });

    // Activity logs
    const activityLogs = await ActivityLog.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      stats: { totalProjects, totalTasks, completedTasks, pendingTasks, inProgressProjects, overdueTasks, completionPercentage },
      charts: { taskStatus: taskStatusData, taskPriority: taskPriorityData, weeklyCompleted: weeklyData },
      recentProjects,
      activityLogs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard };
