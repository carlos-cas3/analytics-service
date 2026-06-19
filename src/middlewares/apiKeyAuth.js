/**
 * API key authentication middleware.
 *
 * Validates the `x-api-key` header against the `INTERNAL_API_KEY`
 * environment variable. Requests with a missing or incorrect key
 * receive a 401 response and are not passed to the next handler.
 *
 * @function
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void} Calls `next()` on success or sends 401 JSON response on failure
 *
 * @example
 * router.post('/api/events', apiKeyAuth, eventController.create);
 */
function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

module.exports = apiKeyAuth;
