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
            const character = {
                name: data.name.trim(),
                role: data.role,
                planet: data.planet.trim()
            };
            return characterRepository.add(character);
        },
        replaceCharacter: async (id, data) => {
            const character = {
                name: data.name.trim(),
                role: data.role,
                planet: data.planet.trim()
            };
            return characterRepository.replace(id, character);
        },
        deleteCharacter: async (id) => characterRepository.remove(id),
    };
}

module.exports = { createCharacterService };