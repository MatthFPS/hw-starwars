/**
 * Logs the HTTP method and URL of every request.
 */
function logger(req, res, next) {
    // TODO issue 2: write method and URL with console.log
    next();
}

module.exports = { logger };
