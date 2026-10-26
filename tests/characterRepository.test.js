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

test('getById_existingId_returnsCharacter', async () => {
    // Arrange
    const luke = { id: 1, name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' };
    const repository = createCharacterRepository([luke]);

    // Act
    const result = await repository.getById(1);

    // Assert
    assert.deepEqual(result, luke);
});

test('getById_unknownId_returnsUndefined', async () => {
    // Arrange
    const luke = { id: 1, name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' };
    const repository = createCharacterRepository([luke]);

    // Act
    const result = await repository.getById(2);

    // Assert
    assert.strictEqual(result, undefined);
});
