const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/user.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

router.get('/', authenticate, adminOnly, getAll);
router.post('/', authenticate, adminOnly, create);
router.put('/:id', authenticate, adminOnly, update);
router.delete('/:id', authenticate, adminOnly, remove);

module.exports = router;
