const test = require('node:test');
const assert = require('node:assert/strict');
const { createCharacterRepository } = require('../src/repositories/characterRepository');

test('getAll_initialCharacters_returnsCopyOfCharacters', async () => {
    // Arrange
    const initial = [{ id: 1, name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' }];
    const repository = createCharacterRepository(initial);

    // Act
    const result = await repository.getAll();
    result.push({ id: 2, name: 'Test', role: 'Jedi', planet: 'Test' });

    // Assert
    assert.deepEqual(await repository.getAll(), initial);
});
