const notImplemented = (res) => res.status(501).json({ error: 'Not implemented' });

// TODO issue 4: validateCharacter(body) returns an error message or null.
// It is used by POST and PUT, so it should be merged early.
// Rules: name is text with at least 2 characters after trim, role is Jedi, Sith, Rebel
// or Smuggler, planet is non-empty text. Wrong types must give an error, never crash.

/**
 * Creates HTTP handlers for character operations.
 * @param {{ getAllCharacters: () => Promise<object[]>, getCharacterById: (id: number) => Promise<object | null> }} characterService
 */
function createCharacterController(characterService) {
    // Example of the pattern: call the service, answer 200, and on errors log the real
    // error and send a fixed text. Use the same shape for the other handlers.
    const handleGetAll = async (req, res) => {
        try {
            return res.status(200).json(await characterService.getAllCharacters());
        } catch (error) {
            console.error('Failed to get characters:', error);
            return res.status(500).json({ error: 'Could not get the characters' });
        }
    };

    const handleGetOne = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const character = await characterService.getCharacterById(id);
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }
            return res.status(200).json(character);
        } catch (error) {
            console.error('Failed to get the character:', error);
            return res.status(500).json({ error: 'Could not get the character' });
        }
    };

    // TODO issue 4: validate, create, respond 201 with the new character
    const handleCreate = async (req, res) => notImplemented(res);

    // TODO issue 5: validate all fields, replace, 200 or 404
    const handleReplace = async (req, res) => notImplemented(res);

    // TODO issue 5: 204 with no body, 404 if it does not exist
    const handleDelete = async (req, res) => notImplemented(res);

    return { handleGetAll, handleGetOne, handleCreate, handleReplace, handleDelete };
}

module.exports = { createCharacterController };
