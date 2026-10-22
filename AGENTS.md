# Agent instructions: Star Wars API

Small Node.js and Express app (REST API with a plain HTML frontend). Work in small steps, one issue at a time. We must be able to explain every line, so keep the code simple.

## Before you say done

1. Run `npm run check`. It must be green.
2. Tell us which files you changed, and if you changed anything we did not ask for.

If lint fails, fix the code. Never use `eslint-disable`. If a lint rule does not fit the task, stop and ask us. Changes to `eslint.config.js` need their own issue.

## Structure

CommonJS only. Server on port 3000. Each layer only knows the one below it.

1. `server.js` creates the repository and starts the server. `app.js` has `createApp({ characterRepository })` and registers the endpoints. Only these two files wire dependencies together.
2. Middleware order in `createApp`: `logger`, `express.json()`, `express.static` for `public/`, endpoints under `/characters`, `notFound`, then `errorHandler`.
3. The controller handles `req` and `res`, validates input and chooses status codes. The service has the rules. The repository holds the characters in an array (no database, data is lost on restart).
4. Dependencies come in as parameters through `createXxx` functions. Use `path.join(__dirname, ...)` for paths.

## API

1. GET `/characters` gives 200 and a list. GET `/characters/:id` gives 200 or 404.
2. POST `/characters` gives 201 and the new character. The server creates a unique id. Invalid input gives 400.
3. PUT `/characters/:id` replaces the character and needs all fields (name, role, planet). Invalid input gives 400, unknown id gives 404.
4. DELETE `/characters/:id` gives 204 with no body. Unknown id gives 404.
5. GET `/download` sends a text file. GET `/go-to-luke` redirects to `/characters/1`.
6. Unknown route gives 404. Invalid JSON gives 400. Other errors give 500.

Validation: `name` is text with at least 2 characters after trim, `role` is Jedi, Sith, Rebel or Smuggler, `planet` is non-empty text. Trim text on the server. Wrong types (fx `name: 123`) must give 400, never crash.

Errors are `{ "error": "..." }` with a fixed text, never `err.message` or a stack trace. Log the real error with `console.error` on the server.

## Frontend

1. Plain JavaScript with `fetch`. POST needs `Content-Type: application/json` and `JSON.stringify(...)`.
2. Never call `response.json()` on DELETE, it has no body.
3. Use `createElement` and `textContent`, never `innerHTML`.
4. Check `response.ok` and show an error message.

## Rules

1. Everything in code is in English: identifiers, comments and commit messages.
2. async/await, never callbacks. No new packages without asking.
3. Only edit the files in the issue, on the branch for that issue. Merge the main branch (`main` or `master`) in before a PR.
4. If something looks wrong or there is a merge conflict, stop and tell us.
5. Make a short plan first and wait for our OK before you change code.
6. The README reflection answers are ours. Do not write them.
