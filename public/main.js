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

async function loadCharacters() {
  try {
    // TODO issue 3: fetch('/characters') and show name, role and planet with textContent
    clearError();
    characterList.replaceChildren();
  } catch {
    showError('Der opstod en fejl ved hentning af karakterer.');
  }
}

// TODO issue 4: createCharacter() sends POST and shows the server's error message

loadCharacters();
