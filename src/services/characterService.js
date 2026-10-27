/**
 * Creates the character rules on top of an injected repository.
 * @param {{ getAll: () => Promise<object[]>, getById: (id: number) => Promise<object | undefined>, add: (character: object) => Promise<object> }} characterRepository
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
        // TODO issue 5: replaceCharacter(id, data) and deleteCharacter(id)
    };
}

module.exports = { createCharacterService };