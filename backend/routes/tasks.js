const router = require('express').Router();
const auth = require('../middleware/auth');
const { getTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { taskRules, validate } = require('../validators/validators');

router.use(auth);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', taskRules, validate, createTask);
router.put('/:id', taskRules, validate, updateTask);
router.delete('/:id', deleteTask);

// Quick complete shortcut
router.patch('/:id/complete', async (req, res) => {
  try {
    const { Task } = require('../models');
    const { log } = require('../services/activityService');
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.update({ status: 'Completed' });
    await log(req.user.id, `Completed task "${task.name}"`, 'Task', task.id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
