const test = require('node:test');
const assert = require('node:assert/strict');
const { createCharacterService, CharacterValidationError } = require('../src/services/characterService');
const { createCharacterRepository } = require('../src/repositories/characterRepository');

function validCharacter() {
    return { name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' };
}

test('createCharacter_invalidData_rejectsWithoutAddingCharacter', async () => {
    // Arrange
    const repository = createCharacterRepository([]);
    const service = createCharacterService(repository);

    // Act / Assert
    await assert.rejects(
        service.createCharacter({ name: 123, role: 'Jedi', planet: 'Tatooine' }),
        { name: 'CharacterValidationError', message: 'Name must be text' }
    );
    assert.deepEqual(await repository.getAll(), []);
});

test('replaceCharacter_invalidData_rejectsWithoutChangingCharacter', async () => {
    // Arrange
    const originalCharacter = { id: 1, ...validCharacter() };
    const repository = createCharacterRepository([originalCharacter]);
    const service = createCharacterService(repository);

    // Act / Assert
    await assert.rejects(
        service.replaceCharacter(1, { name: 'Yoda', role: 'Jedi', planet: '   ' }),
        { name: 'CharacterValidationError', message: 'Planet must not be empty' }
    );
    assert.deepEqual(await repository.getById(1), originalCharacter);
});

test('replaceCharacter_unknownIdAndInvalidData_returnsUndefined', async () => {
    // Arrange
    const service = createCharacterService(createCharacterRepository([]));

    // Act
    const result = await service.replaceCharacter(1, { name: 123, role: 'Jedi', planet: 'Tatooine' });

    // Assert
    assert.equal(result, undefined);
});

test('createCharacter_validData_trimsText', async () => {
    // Arrange
    const service = createCharacterService(createCharacterRepository([]));

    // Act
    const result = await service.createCharacter({
        name: '  Yoda  ',
        role: 'Jedi',
        planet: ' Dagobah ',
    });

    // Assert
    assert.deepEqual(result, { id: 1, name: 'Yoda', role: 'Jedi', planet: 'Dagobah' });
});

test('createCharacter_invalidData_throwsCharacterValidationError', async () => {
    // Arrange
    const service = createCharacterService(createCharacterRepository([]));

    // Act / Assert
    await assert.rejects(
        service.createCharacter({ name: 'Yoda', role: 'Wookiee', planet: 'Dagobah' }),
        CharacterValidationError
    );
});
