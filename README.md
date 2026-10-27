# Star Wars API (Jedi Data Archives)

## Hvad laver programmet?

En Express server med et REST API, der kan oprette, hente, erstatte og slette Star Wars karakterer, og en simpel hjemmeside, der henter og viser dem med `fetch()`. Karaktererne ligger i en array i hukommelsen, så de forsvinder, når serveren genstartes.

## Kom i gang

```bash
npm install
npm start
```

Åbn derefter `http://localhost:3000` i browseren. Kør tests og lint med `npm run check`.

## API

Alle svar er JSON, undtagen `/download`. Fejl har formen `{ "error": "..." }`. Fejlbeskeder fra API'et er på engelsk.

| Metode og URL | Body | Svar |
| --- | --- | --- |
| GET `/characters` | | 200 med et array af karakterer |
| GET `/characters/:id` | | 200 med karakteren, 404 hvis id'et ikke findes |
| POST `/characters` | `{ name, role, planet }` | 201 med den nye karakter (serveren vælger id), 400 ved ugyldigt input |
| PUT `/characters/:id` | `{ name, role, planet }` | 200 med den erstattede karakter, 400 ved ugyldigt input, 404 hvis id'et ikke findes |
| DELETE `/characters/:id` | | 204 uden body, 404 hvis id'et ikke findes |
| GET `/download` | | 200, tekstfilen `characters.txt` |
| GET `/go-to-luke` | | 302 redirect til `/characters/1` |

Gyldigt input: `name` er tekst med mindst 2 tegn efter trim, `role` er Jedi, Sith, Rebel eller Smuggler, og `planet` er tekst og ikke tom.

Andre fejl: ukendt route giver 404 `{ "error": "Route not found" }`, ugyldig JSON giver 400 `{ "error": "Invalid JSON" }`, og uventede fejl giver 500 `{ "error": "Internal server error" }`.

## Struktur

* `public/`: frontend (HTML og JavaScript, Bootstrap fra CDN)
* `src/app.js`: samler middleware og routes (`createApp`)
* `src/server.js`: opretter repository og starter serveren på port 3000
* `src/controllers/`: læser request, validerer input og vælger statuskode
* `src/services/`: regler for karakterer
* `src/repositories/`: gemmer karaktererne i en array
* `src/middleware/`: logging, 404 og fejlhåndtering
* `tests/`: automatiske tests
* `postman/`: eksporteret Postman Collection

Flere regler står i [AGENTS.md](AGENTS.md), test reglerne i [docs/unit-test-guide.md](docs/unit-test-guide.md), og en guide til opsætningen i [docs/setup-guide.md](docs/setup-guide.md).

## Arkitektur (issue 1)

```mermaid
flowchart TD
    Browser["Browser (fetch) og Postman"] --> App["app.js: middleware og routes"]
    App --> Controller["Controller: input, validering, statuskode"]
    App --> Errors["notFound og errorHandler"]
    Controller --> Service["Service: regler"]
    Service --> Repository["Repository: array i hukommelsen"]
```

Rækkefølgen i `app.js`: logger, `express.json()`, `express.static`, routes under `/characters`, `notFound`, `errorHandler`.

### Svar på opgavens spørgsmål

* **Hvor håndteres HTTP requests?** I controlleren. Den læser `req`, tjekker input og vælger statuskode. `app.js` kobler URL og metode til de rigtige funktioner.
* **Hvor gemmes karakterdata?** I repositoryet, i en array i hukommelsen.
* **Hvor placeres valideringen?** I controlleren, i funktionen `validateCharacter`. Det er input fra HTTP, og det giver 400. Så kan servicen regne med, at data er gyldigt.
* **Fordele:** Hvert lag har ét ansvar. Lagene kan testes hver for sig. Repositoryet kan skiftes til en fil eller en database uden at ændre service og controller. Strukturen kender vi fra To Do Taming.
* **Ulemper:** Til en lille opgave er servicen tynd og gør ikke meget mere end at give data videre og finde en karakter. Der er flere filer, end der strengt taget er brug for. Validering i controlleren kan ikke genbruges, hvis der kommer en anden indgang end HTTP. Karaktererne forsvinder, når serveren genstartes.

### Ansvarsfordeling

* `app.js`: samler middleware og routes
* Controller: HTTP, input, validering, statuskode og logning af fejl
* Service: reglerne (find karakter, giv besked, hvis den ikke findes)
* Repository: den eneste, der kender arrayet
* Middleware: logning, 404 og central fejlhåndtering

### Hvad fungerer godt

Det er nemt at se, hvor noget hører til, og tests kan bruge et nyt repository hver gang.

### Hvad vi ville ændre, hvis projektet voksede

Gemme data i en database, så kun repositoryet skal ændres. Tilføje login og rettigheder. Dele routes ud i egen mappe, hvis der kommer flere ressourcer end karakterer.

### Beslutninger

1. **Id'er:** tælleren ligger i repositoryet, og `add` giver id'et i én operation. Servicen læser ikke først alle karakterer for at finde et nyt id. Det samme gælder PUT og DELETE: de er én operation i repositoryet.
2. **Sprog i fejlbeskeder:** engelsk i API'et, dansk i frontenden.
3. **Validering:** en funktion `validateCharacter` i controlleren.

## Mit stykke (skriv under dit eget navn)

Hver skriver sit eget afsnit her i sin pull request: hvad blev lavet, hvilke fejl fandt jeg, og svar på de "undersøg" spørgsmål, der hører til mit issue.

### Nicki

**Issue 3: GET /characters/:id og karakterer i frontend**

Hvad jeg lavede:
* Repository: `getById` finder en karakter i arrayet
* Service: `getCharacterById` giver karakteren eller `null`
* Controller: `handleGetOne` laver id til tal og svarer 200, 404 eller 500
* Frontend: `loadCharacters()` henter `/characters` og viser en `<li>` pr. karakter
* Tests: repository og GET /characters/:id (200 og 404)

Fejl jeg fandt:
* `req.params.id` er tekst, så det skal laves til tal med `Number`, ellers finder man ingen karakter
* Jeg lavede ved en fejl funktioner til andre issues og fjernede dem igen
* Lint klagede over en ubrugt variabel i en test

Undersøg (Network fanen):
* Metode og URL: GET `/characters`
* Status: 200
* Body: JSON array med `id`, `name`, `role` og `planet`
* JSON til elementer: `response.json()` giver et array, `map` laver en `<li>` pr. karakter, og `replaceChildren` sætter dem ind. Vi bruger `textContent`, ikke `innerHTML`.

**Issue 4: POST /characters, validering og formular**

Hvad jeg lavede:
* Controller: `validateCharacter` tjekker navn (mindst 2 tegn), rolle (Jedi, Sith, Rebel eller Smuggler) og planet (ikke tom). Forkerte typer giver en fejlbesked og crasher ikke. `handleCreate` svarer 400 ved fejl og 201 med den nye karakter
* Service: `createCharacter` trimmer navn og planet og kopierer kun de tre felter, så klienten ikke selv kan vælge id
* Repository: `add` giver id'et med en tæller i én operation
* Frontend: formular med navn, rolle og planet. `createCharacter()` sender POST og viser serverens fejlbesked
* Tests: `validateCharacter`, `add` og POST /characters (201, trim, id fra klient ignoreres, 400)

Fejl jeg fandt:
* Mit første forslag til id var `Date.now()`, men to oprettelser i samme millisekund kan få samme id. Det blev til en tæller
* Valideringsfunktionerne lå først inde i `createCharacterController`, så `validateCharacter` ikke kunne eksporteres. De flyttede jeg ud
* Min første `handleCreate` gav aldrig et svar ved gyldigt input, så requesten hang

Undersøg (Network fanen):
* Metode og URL: POST `/characters`
* Headers: `Content-Type: application/json`, ellers kan `express.json()` ikke læse body
* Body: JSON med `name`, `role` og `planet`
* Svar: 201 med karakteren og det nye `id`, eller 400 med `{ "error": "..." }`
* Frontenden: `response.ok` tjekkes, og ved fejl vises `data.error` i den røde boks

**Issue 6: download og redirect**

Hvad jeg lavede:
* GET `/download` henter alle karakterer og sender dem som tekstfilen `characters.txt`, én linje pr. karakter. `res.attachment` får browseren til at hente filen i stedet for at vise den
* GET `/go-to-luke` svarer med en redirect til `/characters/1`
* Tests: download (200, filnavn, type og indhold) og redirect (302 og `Location`)

Undersøg (Network fanen):
* `/download`: svaret har headeren `Content-Disposition: attachment; filename="characters.txt"` og typen `text/plain`
* `/go-to-luke`: først status 302 med en `Location` header, derefter henter browseren `/characters/1` med et nyt GET og får 200

### Gon

### Mat

Issue 2:
Hvad jeg lavet:
middleware:
- Lavet errorHandler middleware således at når programmet køres og noget fejler for vi en fejlbesked.
- errorHandler håndterer fejl i Express, logger dem og sender passende HTTP-fejlbeskeder (400 ved ugyldig JSON og 500 ved serverfejl).
- lavet logger middleware således at vi kan se hvad der sker i vores program.
- logger hver HTTP-forespørgsels metode og URL i konsollen og sender derefter forespørgslen videre med next().
- lavet notFound middleware således at vi får en 404 fejl hvis vi prøver at tilgå en route der ikke findes.
- notFound giver en 404 fejl hvis routen ikke kan tilgås.
Tests:
- lavet derudover også api.tests som alle fire er grønne.
- Jeg testede midlertidigt uden next() med en lokal HTTP-request i stedet for Postman: requesten ventede, indtil klienten afbrød den, og nåede ikke routen. next() er sat tilbage.

Refleksion over 400,404,500:
-400: Bad request, serveren forstår ikke requesten, typisk fordi den er ugyldig. Vi bruger det, når JSON ikke kan parses.
-404: Not found, serveren kan ikke finde det, der efterspørges. i koden er det typisk fordi id'et ikke findes i arrayet. Vi bruger det, når en karakter ikke findes.
-500: Internal server error, serveren fejler, typisk fordi der er en fejl i koden. Vi bruger det, når der sker en uventet fejl.


Issue 5:
Hvad jeg lavet:
-Repository: Tilføjet funktioner til at erstatte og slette karakterer efter ID.
-Service: Tilføjet håndtering af erstatning og sletning, hvor URL’ens ID bevares.
-Controller: Implementeret PUT med validering og svarene 200/400/404 samt DELETE med 204/404.

Tests:
lavet tests for PUT (200, 404, 400) og DELETE (204, 404). som alle er grønne.

Refleksion over hvad der sker med karakter når server genstartes:
Karaktererne ligger kun i en array i serverens hukommelse, ikke i en database eller fil. Når serveren genstartes, nulstilles ændringer fra POST, PUT og DELETE: nye karakterer forsvinder, ændrede går tilbage til standardværdierne, og slettede standardkarakterer kommer tilbage.

## Tests

Kør alle tests og lint med `npm run check`. Testene bruger Nodes indbyggede `node:test` og `node:assert`, så der er ikke installeret noget ekstra. Hver test følger Arrange, Act, Assert og hedder `metode_scenarie_forventet`, fx `postCharacter_invalidRole_returns400WithError`.

* `tests/api.test.js`: starter en rigtig server med et nyt repository til hver test og kalder den med `fetch`. Dækker:
    * 404 på ukendt route
    * `logger` og `errorHandler` (400 ved ugyldig JSON, fast 500 uden detaljer)
    * GET `/characters/:id` (200 og 404)
    * POST `/characters` (201, trim, id fra klienten ignoreres, 400)
    * `/download` og `/go-to-luke`
* `tests/characterController.test.js`: tester `validateCharacter` med gyldigt input, for kort navn, forkerte typer, ukendt rolle, tom planet og manglende body
* `tests/characterRepository.test.js`: tester `getAll` (kopi af arrayet), `getById` og `add` (unikt id fra tælleren)
* `postman/`: Postman Collection med test scripts, som kører mod den kørende server

Vi tester lagene hver for sig, hvor det er muligt, og hele kæden fra request til svar i `api.test.js`.

## Kode review (issue 8)

* Tre forbedringsforslag og hvilken vi gennemførte
* AI review: hvilke forslag accepterede vi, hvilke afviste vi, og hvorfor

## Refleksionsspørgsmål

### 1. Hvilken arkitektur har I valgt, og hvorfor?

Vi har valgt en lagdelt arkitektur med controller, service og repository, og middleware til logning, 404 og fejlhåndtering. Hvert lag har ét ansvar: controlleren håndterer HTTP og validerer input, servicen har reglerne, og repositoryet er det eneste, der kender arrayet. Det gør koden nem at overskue og nem at teste, fordi lagene kan testes hver for sig. Repositoryet kan også skiftes ud med en fil eller en database uden at ændre service og controller. Strukturen kender vi fra To Do Taming.

### 2. Hvad ville I ændre, hvis applikationen skulle bruges af mange brugere?

* **Gemme data i en database.** I dag ligger karaktererne i en array og forsvinder ved genstart. Det er kun repositoryet, der skal ændres
* **Tilføje login og rettigheder,** så ikke alle kan slette og ændre
* **Vise karaktererne på sider,** så `GET /characters` ikke sender alle hver gang

### 3. Hvilke fejl fandt I under udvikling og test?

* `req.params.id` er tekst og skal laves til tal, ellers finder man ingen karakter
* Id'et ud fra `Date.now()` kan blive ens for to oprettelser i samme millisekund. Det blev til en tæller i repositoryet
* Valideringsfunktionerne lå først inde i controller funktionen, så `validateCharacter` ikke kunne eksporteres
* En `handleCreate`, der aldrig sendte et svar ved gyldigt input, så requesten hang
* `nodemon` kom ved en fejl ind i `package.json` og blev fjernet igen
* Mat testede, hvad der sker uden `next()` i `logger`: requesten ventede og nåede aldrig routen

### 4. Hvilken forbedring gennemførte I efter kode review?

(Udfyldes efter issue 8)

### 5. Hvad lærte I om samspillet mellem frontend og backend?

* Frontenden og backend'en taler sammen med HTTP og JSON
* `fetch` kaster ikke en fejl ved 400 eller 404, så vi tjekker `response.ok` selv
* Ved POST skal vi sende `Content-Type: application/json`, ellers kan serveren ikke læse body
* Backend'en skal validere, selv om frontenden har en formular, fordi alle kan kalde API'et direkte, fx fra Postman
* Vi bruger `textContent` og ikke `innerHTML`, så input fra brugeren ikke bliver til kode på siden
* Network fanen viser metode, status, headers og body, og den hjalp os med at fejlfinde