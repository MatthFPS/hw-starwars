const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const express = require('express');
const { createCharacterController } = require('./controllers/characterController');
const { createCharacterService } = require('./services/characterService');
const { logger } = require('./middleware/logger');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

async function downloadTextFile(res, text) {
    const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'hw-starwars-'));
    const filePath = path.join(tempDirectory, 'characters.txt');
    try {
        await fs.writeFile(filePath, text);
        await new Promise((resolve, reject) => {
            res.download(filePath, 'characters.txt', (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    } finally {
        await fs.rm(tempDirectory, { recursive: true, force: true });
    }
}

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
        const rebels = characters.filter((c) => c.role === 'Rebel');
        const text = rebels.map(c => `${c.name} (${c.role}) - ${c.planet}`).join('\n');
        await downloadTextFile(res, text);
    });
    app.get('/go-to-luke', async (req, res) => {
        const characters = await characterService.getAllCharacters();
        const luke = characters.find((character) => character.name === 'Luke Skywalker');
        if (!luke) {
            return res.status(404).json({ error: 'Character not found' });
        }
        return res.redirect(302, `/characters/${luke.id}`);
    });
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
