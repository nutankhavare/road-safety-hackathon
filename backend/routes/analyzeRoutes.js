const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { analyzeRoad } = require('../controllers/analyzeController');

router.post('/', upload.single('media'), analyzeRoad);

module.exports = router;
