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

test('add_newCharacter_returnsCharacterWithId', async () => {
    // Arrange
    const repository = createCharacterRepository([]);

    // Act
    const result = await repository.add({ name: 'Yoda', role: 'Jedi', planet: 'Dagobah' });

    // Assert
    assert.deepEqual(result, { id: 1, name: 'Yoda', role: 'Jedi', planet: 'Dagobah' });
});

test('add_twoCharacters_getDifferentIds', async () => {
    // Arrange
    const luke = { id: 5, name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' };
    const repository = createCharacterRepository([luke]);

    // Act
    const first = await repository.add({ name: 'Yoda', role: 'Jedi', planet: 'Dagobah' });
    const second = await repository.add({ name: 'Lando', role: 'Smuggler', planet: 'Bespin' });

    // Assert
    assert.equal(first.id, 6);
    assert.equal(second.id, 7);
});