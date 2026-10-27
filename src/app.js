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
    app.get('/download', async (req, res) => {
        const characters = await characterService.getAllCharacters();
        const text = characters.map(c => `${c.name} (${c.role}) - ${c.planet}`).join('\n');
        res.attachment('characters.txt');
        res.type('text/plain');
        res.send(text);
    });
    app.get('/go-to-luke', (req, res) => {
        res.redirect('/characters/1');
    });
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
