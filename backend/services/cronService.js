const cron = require('node-cron');
const { Op } = require('sequelize');
const { Task, User } = require('../models');
const { sendDueDateReminder } = require('../utils/email');
const logger = require('../utils/logger');

const toDateStr = (d) => d.toISOString().split('T')[0];

const getOffsetDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateStr(d);
};

// Run daily at 8 AM
cron.schedule('0 8 * * *', async () => {
  try {
    const today     = toDateStr(new Date());
    const tomorrow  = getOffsetDate(1);
    const in3Days   = getOffsetDate(3);

    const tasks = await Task.findAll({
      where: {
        status: { [Op.ne]: 'Completed' },
        dueDate: { [Op.lte]: in3Days },
      },
      include: [{ model: User, attributes: ['email', 'name'] }],
    });

    let sent = 0;
    for (const task of tasks) {
      const due = task.dueDate;
      let subject, emoji, message;

      if (due < today) {
        emoji = '🚨'; subject = `Overdue: "${task.name}"`;
        message = `Your task <b>${task.name}</b> was due on <b>${due}</b> and is now <span style="color:red">overdue</span>. Please complete it immediately.`;
      } else if (due === tomorrow) {
        emoji = '⏰'; subject = `Due Tomorrow: "${task.name}"`;
        message = `Your task <b>${task.name}</b> is due <b>tomorrow (${due})</b>. Don't forget to complete it!`;
      } else if (due === in3Days) {
        emoji = '⚠️'; subject = `Due in 3 Days: "${task.name}"`;
        message = `Your task <b>${task.name}</b> is due in <b>3 days (${due})</b>. Plan accordingly.`;
      } else {
        continue;
      }

      await sendDueDateReminder(task.User.email, task.name, due, subject, emoji, message);
      sent++;
    }

    logger.info(`Cron: sent ${sent} reminders`);
  } catch (err) {
    logger.error('Cron error: ' + err.message);
  }
});
