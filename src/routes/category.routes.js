const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/category.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

router.get('/', authenticate, getAll);
router.post('/', authenticate, adminOnly, create);
router.put('/:id', authenticate, adminOnly, update);
router.delete('/:id', authenticate, adminOnly, remove);

module.exports = router;
