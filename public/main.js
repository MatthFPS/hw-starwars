const characterList = document.querySelector('#character-list');
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

// TODO issue 4: createCharacter() sends POST and shows the server's error message

loadCharacters();