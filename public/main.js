const characterList = document.querySelector('#character-list');
const characterForm = document.querySelector('#character-form');
const errorMessage = document.querySelector('#error-message');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.hidden = true;
}

function createCharacterItem(character) {
  const item = document.createElement('li');
  item.className = 'list-group-item';
  item.textContent = `${character.name} (${character.role}) - ${character.planet}`;
  return item;
}

async function loadCharacters() {
  try {
    clearError();
    const response = await fetch('/characters');
    if (!response.ok) {
      throw new Error('Failed to fetch characters');
    }
    const characters = await response.json();
    characterList.replaceChildren(...characters.map(createCharacterItem));
  } catch {
    showError('Der opstod en fejl ved hentning af karakterer.');
  }
}

async function createCharacter(event) {
  event.preventDefault();
  try {
    const body = {
      name: document.querySelector('#name').value,
      role: document.querySelector('#role').value,
      planet: document.querySelector('#planet').value
    };
    const response = await fetch('/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json();
      showError(data.error);
      return;
    }
    clearError();
    characterForm.reset();
    await loadCharacters();
  } catch {
    showError('Der opstod en fejl ved oprettelse af karakteren.');
  }
}

characterForm.addEventListener('submit', createCharacter);

loadCharacters();