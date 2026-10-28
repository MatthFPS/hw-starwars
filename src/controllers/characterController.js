const ALLOWED_ROLES = ['Jedi', 'Sith', 'Rebel', 'Smuggler'];

// Returns an error message, or null if the name is valid
function validateName(name) {
    if (typeof name !== 'string') {
        return 'Name must be text';
    }
    if (name.trim().length < 2) {
        return 'Name must be at least 2 characters';
    }
    return null;
}

// Returns an error message, or null if the role is valid
function validateRole(role) {
    if (!ALLOWED_ROLES.includes(role)) {
        return 'Role must be Jedi, Sith, Rebel or Smuggler';
    }
    return null;
}

// Returns an error message, or null if the planet is valid
function validatePlanet(planet) {
    if (typeof planet !== 'string') {
        return 'Planet must be text';
    }
    if (planet.trim().length === 0) {
        return 'Planet must not be empty';
    }
    return null;
}

// Returns an error message, or null if the whole character is valid
function validateCharacter(body) {
    if (!body || typeof body !== 'object') {
        return 'Request body must be a JSON object';
    }
    return validateName(body.name) || validateRole(body.role) || validatePlanet(body.planet);
}

function createReplaceHandler(characterService) {
    return async (req, res) => {
        const id = Number(req.params.id);
        const existingCharacter = await characterService.getCharacterById(id);
        if (!existingCharacter) {
            return res.status(404).json({ error: 'Character not found' });
        }
        const validationError = validateCharacter(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const updatedCharacter = await characterService.replaceCharacter(id, req.body);
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
        const validationError = validateCharacter(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const newCharacter = await characterService.createCharacter(req.body);
        return res.status(201).json(newCharacter);
    };

    const handleReplace = createReplaceHandler(characterService);
    const handleDelete = createDeleteHandler(characterService);

    return { handleGetAll, handleGetOne, handleCreate, handleReplace, handleDelete };
}

module.exports = { createCharacterController, validateCharacter };