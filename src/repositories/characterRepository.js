const DEFAULT_CHARACTERS = [
    { id: 1, name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' },
    { id: 2, name: 'Darth Vader', role: 'Sith', planet: 'Mustafar' },
    { id: 3, name: 'Han Solo', role: 'Smuggler', planet: 'Corellia' },
    { id: 4, name: 'Leia Organa', role: 'Rebel', planet: 'Alderaan' },
];

/**
 * Keeps the characters in an array in memory (no database, data is lost on restart).
 * Every method is async on purpose, so the repository can be swapped for a file
 * or a database later without changing the service.
 * @param {object[]} initialCharacters Starting data. Tests pass their own list.
 */
function createCharacterRepository(initialCharacters = DEFAULT_CHARACTERS) {
    const characters = [...initialCharacters];

    return {
        // Example of the pattern: copy the array, so callers cannot change it by accident.
        getAll: async () => [...characters],
        // TODO issue 3: getById(id) returns the character or undefined
        // TODO issue 4: add(character) with a unique id (not the array length)
        // TODO issue 5: replace(id, character) and remove(id)
    };
}

module.exports = { createCharacterRepository };
