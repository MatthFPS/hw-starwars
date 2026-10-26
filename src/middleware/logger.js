/**
 * Logs the HTTP method and URL of every request.
 */
function logger(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}

module.exports = { logger };
