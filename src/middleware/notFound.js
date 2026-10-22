/**
 * Answers 404 when no route matched the request.
 */
function notFound(req, res) {
    // TODO issue 2: decide the final error text (see AGENTS.md)
    res.status(404).json({ error: 'Route not found' });
}

module.exports = { notFound };
