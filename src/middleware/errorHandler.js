/**
 * Central handler for unexpected errors. Express needs all four parameters.
 */
function errorHandler(err, req, res, next) {
    console.error(err);
    if (res.headersSent) {
        return next(err);
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };
