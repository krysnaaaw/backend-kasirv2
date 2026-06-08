const express = require('express');
const router = express.Router();
const { getAll, getOne, getByBarcode, create, update, remove, getLowStock } = require('../controllers/product.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', authenticate, getAll);
router.get('/low-stock', authenticate, getLowStock);
router.get('/barcode/:barcode', authenticate, getByBarcode);
router.get('/:id', authenticate, getOne);
router.post('/', authenticate, adminOnly, upload.single('gambar'), create);
router.put('/:id', authenticate, adminOnly, upload.single('gambar'), update);
router.delete('/:id', authenticate, adminOnly, remove);

module.exports = router;
