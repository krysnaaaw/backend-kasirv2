const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/report.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

router.get('/', authenticate, adminOnly, getReports);

module.exports = router;
