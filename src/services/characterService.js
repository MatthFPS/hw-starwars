/**
 * Creates the character rules on top of an injected repository.
 * @param {{ getAll: () => Promise<object[]> }} characterRepository
 */
function createCharacterService(characterRepository) {
    return {
        getAllCharacters: () => characterRepository.getAll(),
        // TODO issue 3: getCharacterById(id), returns the character or null
        // TODO issue 4: createCharacter(data), the server decides the id
        // TODO issue 5: replaceCharacter(id, data) and deleteCharacter(id)
    };
}

module.exports = { createCharacterService };
