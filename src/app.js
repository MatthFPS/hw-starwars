const path = require('node:path');
const express = require('express');
const { createCharacterController } = require('./controllers/characterController');
const { createCharacterService } = require('./services/characterService');
const { logger } = require('./middleware/logger');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

/**
 * Builds the Express app using the supplied character repository.
 * @param {{ characterRepository: object }} dependencies
 */
function createApp({ characterRepository }) {
    const app = express();
    const characterService = createCharacterService(characterRepository);
    const characterController = createCharacterController(characterService);
    const router = express.Router();
    const publicPath = path.join(__dirname, '..', 'public');

    app.use(logger);
    app.use(express.json());
    app.use(express.static(publicPath));
    router.get('/', characterController.handleGetAll);
    router.get('/:id', characterController.handleGetOne);
    router.post('/', characterController.handleCreate);
    router.put('/:id', characterController.handleReplace);
    router.delete('/:id', characterController.handleDelete);
    app.use('/characters', router);
    // TODO issue 6: add GET /download and GET /go-to-luke here
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
