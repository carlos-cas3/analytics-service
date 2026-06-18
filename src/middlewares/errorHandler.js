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
