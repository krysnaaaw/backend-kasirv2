// dashboard.routes.js
const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
router.get('/', authenticate, adminOnly, getDashboard);
module.exports = router;
