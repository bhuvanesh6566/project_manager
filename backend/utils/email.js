const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendDueDateReminder = async (to, taskName, dueDate, subject, emoji, message) => {
  await transporter.sendMail({
    from: `"DevFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: subject || `Reminder: Task "${taskName}"`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#2563eb;">⚡ DevFlow Task Reminder</h2>
        <div style="font-size:2rem;margin:16px 0;">${emoji || '📋'}</div>
        <p style="font-size:15px;color:#374151;">${message || `Your task <b>${taskName}</b> is due on <b>${dueDate}</b>.`}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
        <p style="font-size:12px;color:#9ca3af;">This is an automated reminder from DevFlow. Log in to update your task status.</p>
      </div>
    `,
  });
};

module.exports = { sendDueDateReminder };
