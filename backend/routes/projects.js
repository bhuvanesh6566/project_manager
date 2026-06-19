const router = require('express').Router();
const auth = require('../middleware/auth');
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { projectRules, validate } = require('../validators/validators');

router.use(auth);
router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', projectRules, validate, createProject);
router.put('/:id', projectRules, validate, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
