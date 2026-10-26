const notImplemented = (res) => res.status(501).json({ error: 'Not implemented' });

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

/**
 * Creates HTTP handlers for character operations.
 * @param {{ getAllCharacters: () => Promise<object[]>, getCharacterById: (id: number) => Promise<object | null>, createCharacter: (data: object) => Promise<object> }} characterService
 */
function createCharacterController(characterService) {
    // Example of the pattern: call the service, answer 200, and on errors log the real
    // error and send a fixed text. Use the same shape for the other handlers.
    const handleGetAll = async (req, res) => {
        try {
            return res.status(200).json(await characterService.getAllCharacters());
        } catch (error) {
            console.error('Failed to get characters:', error);
            return res.status(500).json({ error: 'Could not get the characters' });
        }
    };

    const handleGetOne = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const character = await characterService.getCharacterById(id);
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }
            return res.status(200).json(character);
        } catch (error) {
            console.error('Failed to get the character:', error);
            return res.status(500).json({ error: 'Could not get the character' });
        }
    };

    const handleCreate = async (req, res) => {
        const validationError = validateCharacter(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        try {

            const newCharacter = await characterService.createCharacter(req.body);
            return res.status(201).json(newCharacter);
        } catch (error) {
            console.error('Failed to create the character:', error);
            return res.status(500).json({ error: 'Could not create the character' });
        }
    };

    // TODO issue 5: validate all fields, replace, 200 or 404
    const handleReplace = async (req, res) => notImplemented(res);

    // TODO issue 5: 204 with no body, 404 if it does not exist
    const handleDelete = async (req, res) => notImplemented(res);

    return { handleGetAll, handleGetOne, handleCreate, handleReplace, handleDelete };
}

module.exports = { createCharacterController, validateCharacter };