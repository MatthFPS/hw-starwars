/**
 * Central handler for unexpected errors. Express needs all four parameters.
 */
function errorHandler(err, req, res, next) {
    // TODO issue 2: log the real error with console.error, answer 400 for invalid JSON
    // (err.type === 'entity.parse.failed') and 500 for everything else, with a fixed text.
    res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };
