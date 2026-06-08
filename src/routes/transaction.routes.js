// transaction.routes.js
const express = require('express');
const router = express.Router();
const { getAll, getOne, create, cancel, exportCsv } = require('../controllers/transaction.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

router.get('/', authenticate, getAll);
router.get('/export/csv', authenticate, adminOnly, exportCsv);
router.get('/:id', authenticate, getOne);
router.post('/', authenticate, create);
router.patch('/:id/cancel', authenticate, adminOnly, cancel);

module.exports = router;
