const { Router } = require('express');
const eventController = require('../controllers/eventController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');

const router = Router();

router.post('/api/events', apiKeyAuth, eventController.create);

module.exports = router;
