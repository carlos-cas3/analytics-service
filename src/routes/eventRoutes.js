const { Router } = require('express');
const healthController = require('../controllers/healthController');
const eventController = require('../controllers/eventController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');

const router = Router();

router.get('/api/health', healthController.check);
router.post('/api/events', apiKeyAuth, eventController.create);

module.exports = router;
