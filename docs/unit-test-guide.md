# Unit Test Guide

Tests use Node's built in test runner and assert module. No extra packages.

```bash
npm test
```

`npm test` runs `node --test`, which finds all files named `*.test.js` in `tests/`.

## Naming

`method_scenario_expectedResult`

Example: `getAll_initialCharacters_returnsCopyOfCharacters`

## AAA: Arrange, Act, Assert

Every test follows this structure, with the three comments.

```js
test('getUnknownRoute_unmatchedPath_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/route-that-does-not-exist`);

    // Assert
    assert.equal(response.status, 404);
});
```

## Through HTTP

`createApp` receives its repository, so the whole app can be started on a random port (`app.listen(0)`) and called with the built in `fetch`. The in-memory repository is its own fake, because `createCharacterRepository(initialCharacters)` gives every test a fresh array. Close the server with `t.after(() => server.close())`.

## Rules of thumb

1. One behaviour per test. If it fails, you should know exactly what went wrong.
2. Test the limits: missing fields, wrong types (`name: 123`), empty text, only spaces, broken JSON.
3. Test error cases: unknown id (404), unknown route (404), invalid input (400).
4. Invalid requests must not change the data. Check that with a GET afterwards.
5. No logic in tests. No if, no loops.
6. Test behaviour, not implementation.
