/**
 * Global Express error handler.
 *
 * Catches unhandled errors from the request pipeline, logs them to
 * stderr with request context, and returns a generic 500 response.
 *
 * @function
 * @param {Error} err - The thrown error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function (unused)
 * @returns {void} Sends a 500 JSON response
 *
 * @example
 * // Registered as the last middleware in app.js:
 * app.use(errorHandler);
 */
function errorHandler(err, req, res, next) {
  console.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
