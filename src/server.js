const { createApp } = require('./app');
const { createCharacterRepository } = require('./repositories/characterRepository');

const characterRepository = createCharacterRepository();
const app = createApp({ characterRepository });

app.listen(3000);
