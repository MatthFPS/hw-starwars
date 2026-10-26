const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createCharacterRepository } = require('../src/repositories/characterRepository');

// The in-memory repository is its own fake: every test gets a fresh one.
function startTestServer(t, initialCharacters = []) {
    const characterRepository = createCharacterRepository(initialCharacters);
    const app = createApp({ characterRepository });
    const server = app.listen(0);
    t.after(() => server.close());
    return `http://localhost:${server.address().port}`;
}

test('getUnknownRoute_unmatchedPath_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/route-that-does-not-exist`);

    // Assert
    assert.equal(response.status, 404);
});

// TODO: add tests for each issue next to the code you write (see docs/unit-test-guide.md).

const luke = { id: 1, name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' };

test('getOne_existingId_returns200WithCharacter', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [luke]);

    // Act
    const response = await fetch(`${baseUrl}/characters/1`);
    const body = await response.json();

    // Assert
    assert.equal(response.status, 200);
    assert.deepEqual(body, luke);
});

test('getOne_unknownId_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [luke]);

    // Act
    const response = await fetch(`${baseUrl}/characters/999`);
    const body = await response.json();

    // Assert
    assert.equal(response.status, 404);
    assert.deepEqual(body, { error: 'Character not found' });
});
