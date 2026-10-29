const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createApp } = require('../src/app');
const { createCharacterRepository } = require('../src/repositories/characterRepository');
const { errorHandler } = require('../src/middleware/errorHandler');
const { logger } = require('../src/middleware/logger');

// The in-memory repository is its own fake: every test gets a fresh one.
function startTestServer(t, initialCharacters = []) {
    const characterRepository = createCharacterRepository(initialCharacters);
    const app = createApp({ characterRepository });
    const server = app.listen(0);
    t.after(() => server.close());
    return `http://localhost:${server.address().port}`;
}

function startErrorTestServer(t) {
    const app = express();
    app.get('/unexpected-error', async () => {
        throw new Error('Sensitive error details');
    });
    app.use(errorHandler);
    const server = app.listen(0);
    t.after(() => server.close());
    return `http://localhost:${server.address().port}`;
}

function startFailingCharacterServer(t, error) {
    const characterRepository = {
        getAll: async () => {
            throw error;
        },
    };
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
    assert.deepEqual(await response.json(), { error: 'Route not found' });
});

test('logger_request_logsMethodAndUrlAndCallsNext', () => {
    // Arrange
    const originalConsoleLog = console.log;
    const loggedMessages = [];
    let nextWasCalled = false;
    console.log = (message) => loggedMessages.push(message);

    // Act
    try {
        logger({ method: 'GET', url: '/characters' }, {}, () => {
            nextWasCalled = true;
        });
    } finally {
        console.log = originalConsoleLog;
    }

    // Assert
    assert.deepEqual(loggedMessages, ['GET /characters']);
    assert.equal(nextWasCalled, true);
});

test('errorHandler_invalidJson_returns400', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name":',
    });

    // Assert
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Invalid JSON' });
});

test('errorHandler_unexpectedError_returnsFixed500AndLogsRealError', async (t) => {
    // Arrange
    const baseUrl = startErrorTestServer(t);
    const originalConsoleError = console.error;
    const loggedErrors = [];
    console.error = (error) => loggedErrors.push(error);

    // Act
    try {
        const response = await fetch(`${baseUrl}/unexpected-error`);
        const responseBody = await response.json();

        // Assert
        assert.equal(response.status, 500);
        assert.deepEqual(responseBody, { error: 'Internal server error' });
        assert.equal(loggedErrors.length, 1);
        assert.equal(loggedErrors[0].message, 'Sensitive error details');
    } finally {
        console.error = originalConsoleError;
    }
});

test('getAll_unexpectedRepositoryError_reachesCentralErrorHandler', async (t) => {
    // Arrange
    const error = new Error('Repository failure details');
    const baseUrl = startFailingCharacterServer(t, error);
    const originalConsoleError = console.error;
    const loggedErrors = [];
    console.error = (loggedError) => loggedErrors.push(loggedError);

    // Act
    try {
        const response = await fetch(`${baseUrl}/characters`);

        // Assert
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { error: 'Internal server error' });
        assert.deepEqual(loggedErrors, [error]);
    } finally {
        console.error = originalConsoleError;
    }
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

test('getOne_nonNumericId_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [luke]);

    // Act
    const response = await fetch(`${baseUrl}/characters/abc`);
    const body = await response.json();

    // Assert
    assert.equal(response.status, 404);
    assert.deepEqual(body, { error: 'Character not found' });
});

test('getDownload_mixedRoles_returnsOnlyRebelsAsTextFile', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [
        { id: 1, name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' },
        { id: 2, name: 'Darth Vader', role: 'Sith', planet: 'Mustafar' },
        { id: 3, name: 'Leia Organa', role: 'Rebel', planet: 'Alderaan' },
    ]);

    // Act
    const response = await fetch(`${baseUrl}/download`);

    // Assert
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-disposition'), 'attachment; filename=characters.txt');
    assert.match(response.headers.get('content-type'), /text\/plain/);
    assert.equal(await response.text(), 'Leia Organa (Rebel) - Alderaan');
});

test('getGoToLuke_lukeHasNonOneId_redirectsToLukeCharacter', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [
        { id: 8, name: 'Luke Skywalker', role: 'Jedi', planet: 'Tatooine' },
    ]);

    // Act
    const response = await fetch(`${baseUrl}/go-to-luke`, { redirect: 'manual' });

    // Assert
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/characters/8');
});

test('getGoToLuke_lukeDoesNotExist_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [
        { id: 8, name: 'Leia Organa', role: 'Rebel', planet: 'Alderaan' },
    ]);

    // Act
    const response = await fetch(`${baseUrl}/go-to-luke`);

    // Assert
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Character not found' });
});
function postCharacter(baseUrl, body) {
    return fetch(`${baseUrl}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

function putCharacter(baseUrl, id, body) {
    return fetch(`${baseUrl}/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

test('postCharacter_validBody_returns201WithNewCharacter', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await postCharacter(baseUrl, { name: 'Yoda', role: 'Jedi', planet: 'Dagobah' });

    // Assert
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { id: 1, name: 'Yoda', role: 'Jedi', planet: 'Dagobah' });
});

test('postCharacter_spacesAroundValues_savesTrimmedValues', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await postCharacter(baseUrl, { name: '  Yoda  ', role: 'Jedi', planet: ' Dagobah ' });

    // Assert
    assert.deepEqual(await response.json(), { id: 1, name: 'Yoda', role: 'Jedi', planet: 'Dagobah' });
});

test('postCharacter_clientSendsId_ignoresItAndCreatesOwnId', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await postCharacter(baseUrl, { id: 99, name: 'Yoda', role: 'Jedi', planet: 'Dagobah' });

    // Assert
    assert.equal((await response.json()).id, 1);
});

test('postCharacter_invalidRole_returns400WithError', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await postCharacter(baseUrl, { name: 'Yoda', role: 'Wookiee', planet: 'Dagobah' });

    // Assert
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Role must be Jedi, Sith, Rebel or Smuggler' });
});

test('putCharacter_validBody_replacesCharacterUsingUrlId', async (t) => {
    // Arrange
    const anotherCharacter = { id: 2, name: 'Han Solo', role: 'Smuggler', planet: 'Corellia' };
    const baseUrl = startTestServer(t, [luke, anotherCharacter]);

    // Act
    const response = await putCharacter(baseUrl, 1, {
        id: 99,
        name: '  Yoda  ',
        role: 'Jedi',
        planet: ' Dagobah ',
    });

    // Assert
    assert.equal(response.status, 200);
    const updatedCharacter = { id: 1, name: 'Yoda', role: 'Jedi', planet: 'Dagobah' };
    assert.deepEqual(await response.json(), updatedCharacter);
    const updatedResponse = await fetch(`${baseUrl}/characters/1`);
    assert.deepEqual(await updatedResponse.json(), updatedCharacter);
    const unchangedResponse = await fetch(`${baseUrl}/characters/2`);
    assert.deepEqual(await unchangedResponse.json(), anotherCharacter);
});

test('putCharacter_missingField_returns400', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [luke]);

    // Act
    const response = await putCharacter(baseUrl, 1, { name: 'Yoda', role: 'Jedi' });

    // Assert
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Planet must be text' });
});

test('putCharacter_invalidBody_returns400AndLeavesCharacterUnchanged', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [luke]);

    // Act
    const response = await putCharacter(baseUrl, 1, {
        name: 'Yoda',
        role: 'Jedi',
        planet: '   ',
    });
    const characterResponse = await fetch(`${baseUrl}/characters/1`);

    // Assert
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Planet must not be empty' });
    assert.deepEqual(await characterResponse.json(), luke);
});

test('putCharacter_unknownId_returns404EvenWithInvalidBody', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [luke]);

    // Act
    const response = await putCharacter(baseUrl, 999, { name: 'Yoda' });

    // Assert
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Character not found' });
});

test('deleteCharacter_existingId_returns204WithoutBody', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [luke]);

    // Act
    const response = await fetch(`${baseUrl}/characters/1`, { method: 'DELETE' });

    // Assert
    assert.equal(response.status, 204);
    assert.equal(await response.text(), '');
    const deletedResponse = await fetch(`${baseUrl}/characters/1`);
    assert.equal(deletedResponse.status, 404);
});

test('deleteCharacter_unknownId_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [luke]);

    // Act
    const response = await fetch(`${baseUrl}/characters/999`, { method: 'DELETE' });

    // Assert
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Character not found' });
});
