/**
 * Creates the character rules on top of an injected repository.
 * @param {{ getAll: () => Promise<object[]>, getById: (id: number) => Promise<object | undefined> }} characterRepository
 */
function createCharacterService(characterRepository) {
    return {
        getAllCharacters: () => characterRepository.getAll(),
        getCharacterById: async (id) => {
            const character = await characterRepository.getById(id);
            return character || null;
        },
        // TODO issue 4: createCharacter(data), the server decides the id
        // TODO issue 5: replaceCharacter(id, data) and deleteCharacter(id)
    };
}

module.exports = { createCharacterService };