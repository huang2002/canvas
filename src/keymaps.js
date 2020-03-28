/**
 * (Note that the keys must be uppercased)
 * @type {Map<string, () => void>}
 */
export const keymaps = new Map();

window.addEventListener('keydown', event => {
    const handler = keymaps.get(event.key.toUpperCase());
    if (handler) {
        handler();
    }
});
