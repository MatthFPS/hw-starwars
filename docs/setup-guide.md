# Opsætningsguide: sådan laver man skelettet til et Node og Express projekt

Til når man vil sætte et nyt projekt op fra bunden, med mapper, lint, tests og agent instruktioner. Trinene er de samme, som er brugt her.

## 1. Opret repo og hent det ned

Opret et tomt repo på GitHub, og hent det ned:

```bash
git clone https://github.com/<bruger>/<repo>.git
cd <repo>
```

Tjek altid, at du står i den rigtige mappe, før du laver filer (`Split-Path -Leaf $PWD` i PowerShell, `pwd` i bash).

Tjek også, hvad hovedbranchen hedder (`git branch --show-current`). Den hedder enten `main` eller `master`. CI filen i trin 7 virker med begge.

## 2. Lav package.json og installer pakker

```bash
npm init -y
npm install express
npm install --save-dev eslint @eslint/js
```

Skift derefter `scripts` i `package.json`, så de sådan ud:

```json
"scripts": {
  "start": "node src/server.js",
  "test": "node --test",
  "lint": "eslint .",
  "check": "npm test && npm run lint"
}
```

Sæt også `"type": "commonjs"`. `npm run check` er det, I kører før hver pull request.

## 3. Lav mapperne

```
src/
  controllers/    læser request, validerer input, vælger statuskode
  services/       reglerne
  repositories/   dér hvor data gemmes (her en array)
  middleware/     logging, 404 og fejlhåndtering
  app.js          samler det hele (createApp)
  server.js       starter serveren
public/           frontend (HTML og JavaScript)
tests/            automatiske tests
docs/             guides og noter
postman/          Postman Collection
.github/          copilot instructions, PR skabelon og CI
```

Hvert lag kender kun laget under sig. Controlleren kender HTTP, servicen kender reglerne, og repositoryet kender, hvor data ligger. Så kan man skifte ét lag uden at røre de andre.

Det er `app.js`, der kobler lagene sammen med dependency injection: `server.js` laver repositoryet og giver det til `createApp({ characterRepository })`. Derfor kan tests give appen et nyt repository hver gang.

## 4. .gitignore

```
node_modules/
.idea/
.env
*.log
```

Så kommer `node_modules` og editorens egne indstillinger (`.idea/` i WebStorm) aldrig med i Git. Hvis `.idea/` allerede er committet, fjernes den fra Git (ikke fra din computer) med `git rm -r --cached .idea`.

## 5. ESLint (eslint.config.js)

Filen sætter regler for koden, så den holdes simpel og læsbar:

* `complexity` 6: hver funktion må ikke have for mange grene
* `max-lines-per-function` 40 og `max-lines` 120: korte funktioner og filer
* `max-params` 4: ikke for mange parametre
* `no-var` og `prefer-const`: moderne JavaScript
* `no-unused-vars`: fanger variabler og parametre, der ikke bruges

Filerne i `public/` er browserkode, så de får browser globals (`document`, `fetch`). Filerne i `src/` og `tests/` er Node kode (`require`, `module`).

## 6. AGENTS.md og copilot instructions

`AGENTS.md` i roden er reglerne til AI agenter: hvad projektet er, hvilken struktur der gælder, hvilke API regler og hvad agenten skal gøre, før den siger "færdig" (`npm run check` skal være grøn). Hold den kort, ellers læses den ikke ordentligt.

`.github/copilot-instructions.md` er den fil, GitHub Copilot selv læser. Den indeholder bare en linje, som peger videre til `AGENTS.md`:

```
Read and follow AGENTS.md in the project root.
```

Så har man reglerne ét sted, og både Copilot og andre agenter bruger dem.

## 7. Pull request skabelon og CI

`.github/pull_request_template.md` er en tjekliste, der automatisk bliver indsat i hver pull request. `.github/workflows/test.yml` kører `npm ci`, `npm test` og `npm run lint` på GitHub, hver gang der laves en pull request eller pushes til `main`. Husk, at `npm ci` kræver en `package-lock.json`, så den skal committes.

## 8. Første commit og branches

```bash
git add .
git commit -m "chore: add project skeleton"
git push
```

Arbejd derefter på en branch pr. issue (`git checkout -b feature/navn`), lav en pull request, og få den reviewet, før den merges.

## 9. Tjek, at det virker

```bash
npm install
npm run check
npm start
```

Tests og lint skal være grønne, og `http://localhost:3000` skal åbne siden.
