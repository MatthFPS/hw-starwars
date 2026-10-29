const { CharacterValidationError } = require('../services/characterService');

function createReplaceHandler(characterService) {
    return async (req, res) => {
        const id = Number(req.params.id);
        let updatedCharacter;
        try {
            updatedCharacter = await characterService.replaceCharacter(id, req.body);
        } catch (error) {
            if (error instanceof CharacterValidationError) {
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
        if (!updatedCharacter) {
            return res.status(404).json({ error: 'Character not found' });
        }
        return res.status(200).json(updatedCharacter);
    };
}

function createDeleteHandler(characterService) {
    return async (req, res) => {
        const id = Number(req.params.id);
        const deleted = await characterService.deleteCharacter(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Character not found' });
        }
        return res.status(204).end();
    };
}

/**
 * Creates HTTP handlers for character operations.
 * @param {{ getAllCharacters: () => Promise<object[]>, getCharacterById: (id: number) => Promise<object | null>, createCharacter: (data: object) => Promise<object>, replaceCharacter: (id: number, data: object) => Promise<object | undefined>, deleteCharacter: (id: number) => Promise<boolean> }} characterService
 */
function createCharacterController(characterService) {
    const handleGetAll = async (req, res) =>
        res.status(200).json(await characterService.getAllCharacters());

    const handleGetOne = async (req, res) => {
        const id = Number(req.params.id);
        const character = await characterService.getCharacterById(id);
        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }
        return res.status(200).json(character);
    };

    const handleCreate = async (req, res) => {
        try {
            const newCharacter = await characterService.createCharacter(req.body);
            return res.status(201).json(newCharacter);
        } catch (error) {
            if (error instanceof CharacterValidationError) {
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    };

    const handleReplace = createReplaceHandler(characterService);
    const handleDelete = createDeleteHandler(characterService);

    return { handleGetAll, handleGetOne, handleCreate, handleReplace, handleDelete };
}

module.exports = { createCharacterController };