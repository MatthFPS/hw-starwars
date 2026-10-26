const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCharacter } = require('../src/controllers/characterController');

function validBody() {
    return { name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' };
}

test('validateCharacter_validBody_returnsNull', () => {
    // Arrange
    const body = validBody();

    // Act
    const result = validateCharacter(body);

    // Assert
    assert.equal(result, null);
});

test('validateCharacter_nameWithSpacesAroundValidText_returnsNull', () => {
    // Arrange
    const body = { ...validBody(), name: '  Yo  ', planet: '  Hoth  ' };

    // Act
    const result = validateCharacter(body);

    // Assert
    assert.equal(result, null);
});

test('validateCharacter_shortName_returnsNameError', () => {
    // Arrange
    const body = { ...validBody(), name: ' A ' };

    // Act
    const result = validateCharacter(body);

    // Assert
    assert.equal(result, 'Name must be at least 2 characters');
});

test('validateCharacter_nameIsNumber_returnsNameError', () => {
    // Arrange
    const body = { ...validBody(), name: 123 };

    // Act
    const result = validateCharacter(body);

    // Assert
    assert.equal(result, 'Name must be text');
});

test('validateCharacter_unknownRole_returnsRoleError', () => {
    // Arrange
    const body = { ...validBody(), role: 'Wookiee' };

    // Act
    const result = validateCharacter(body);

    // Assert
    assert.equal(result, 'Role must be Jedi, Sith, Rebel or Smuggler');
});

test('validateCharacter_emptyPlanet_returnsPlanetError', () => {
    // Arrange
    const body = { ...validBody(), planet: '   ' };

    // Act
    const result = validateCharacter(body);

    // Assert
    assert.equal(result, 'Planet must not be empty');
});

test('validateCharacter_planetIsNumber_returnsPlanetError', () => {
    // Arrange
    const body = { ...validBody(), planet: 42 };

    // Act
    const result = validateCharacter(body);

    // Assert
    assert.equal(result, 'Planet must be text');
});

test('validateCharacter_missingBody_returnsBodyError', () => {
    // Arrange
    const body = undefined;

    // Act
    const result = validateCharacter(body);

    // Assert
    assert.equal(result, 'Request body must be a JSON object');
});