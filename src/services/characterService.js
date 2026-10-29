const ALLOWED_ROLES = ['Jedi', 'Sith', 'Rebel', 'Smuggler'];

class CharacterValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CharacterValidationError';
    }
}

function validateName(name) {
    if (typeof name !== 'string') {
        return 'Name must be text';
    }
    if (name.trim().length < 2) {
        return 'Name must be at least 2 characters';
    }
    return null;
}

function validateRole(role) {
    if (!ALLOWED_ROLES.includes(role)) {
        return 'Role must be Jedi, Sith, Rebel or Smuggler';
    }
    return null;
}

function validatePlanet(planet) {
    if (typeof planet !== 'string') {
        return 'Planet must be text';
    }
    if (planet.trim().length === 0) {
        return 'Planet must not be empty';
    }
    return null;
}

function validateCharacter(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return 'Request body must be a JSON object';
    }
    return validateName(data.name) || validateRole(data.role) || validatePlanet(data.planet);
}

function throwIfInvalid(data) {
    const validationError = validateCharacter(data);
    if (validationError) {
        throw new CharacterValidationError(validationError);
    }
}

function toCleanCharacter(data) {
    return {
        name: data.name.trim(),
        role: data.role,
        planet: data.planet.trim(),
    };
}

/**
 * Creates the character rules on top of an injected repository.
 * @param {{ getAll: () => Promise<object[]>, getById: (id: number) => Promise<object | undefined>, add: (character: object) => Promise<object>, replace: (id: number, character: object) => Promise<object | undefined>, remove: (id: number) => Promise<boolean> }} characterRepository
 */
function createCharacterService(characterRepository) {
    return {
        getAllCharacters: () => characterRepository.getAll(),
        getCharacterById: async (id) => {
            const character = await characterRepository.getById(id);
            return character || null;
        },
        createCharacter: async (data) => {
            throwIfInvalid(data);
            const character = toCleanCharacter(data);
            return characterRepository.add(character);
        },
        replaceCharacter: async (id, data) => {
            const validationError = validateCharacter(data);
            if (validationError) {
                const existingCharacter = await characterRepository.getById(id);
                if (!existingCharacter) {
                    return undefined;
                }
                throw new CharacterValidationError(validationError);
            }
            const character = toCleanCharacter(data);
            return characterRepository.replace(id, character);
        },
        deleteCharacter: async (id) => characterRepository.remove(id),
    };
}

module.exports = { createCharacterService, CharacterValidationError, validateCharacter };