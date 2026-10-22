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
