const express = require('express');
const router = express.Router();
const { documentController, usageController } = require('../controllers');
const { upload, rateLimit } = require('../middleware');

// Render main page
router.get('/', (req, res) => {
  res.render('index');
});

// Generate document endpoint
router.post('/api/generate', 
  rateLimit,
  upload.single('image'), 
  documentController.generateDocument
);

// Usage endpoints
router.get('/api/usage', usageController.getUsage);
router.post('/api/usage/reset', usageController.resetUsage);

module.exports = router;
