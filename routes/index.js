const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');

// Render main page
router.get('/', (req, res) => {
  res.render('index');
});

// Generate document endpoint
router.post('/api/generate', 
  upload.single('image'), 
  documentController.generateDocument
);

module.exports = router;
