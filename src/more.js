// @ts-check
import { h } from "./common.js";
import { states } from "./controller.js";
import { renderAll, clearCanvas, undo, redo, canvas } from './canvas.js';

/**
 * @param {string} label
 * @param {string} stateKey
 * @param {boolean | void} rerender
 */
const ColorField = (label, stateKey, rerender) => (
    h('tr', {
        class: 'settings-field',
    }, [
        h('label', {
            class: 'settings-label',
        }, [
            `${label}:`
        ]),
        h('input', {
            class: 'settings-input-color',
            type: 'color',
            value: states[stateKey],
            listeners: {
                /**
                 * @param {InputEvent} event
                 */
                input(event) {
                    // @ts-ignore
                    states[stateKey] = event.target.value;
                    if (rerender) {
                        renderAll();
                    }
                },
            },
        }),
    ])
);

/**
 * @param {string} label
 * @param {string} stateKey
 * @param {number} min
 * @param {number} max
 */
const RangeField = (label, stateKey, min, max) => (
    h('tr', {
        class: 'settings-field',
    }, [
        h('label', {
            class: 'settings-label',
        }, [
            `${label}:`
        ]),
        h('input', {
            class: 'settings-input-range',
            type: 'range',
            value: states[stateKey],
            min,
            max,
            listeners: {
                /**
                 * @param {InputEvent} event
                 */
                change(event) {
                    // @ts-ignore
                    states[stateKey] = +event.target.value;
                },
            },
        }),
    ])
);

/**
 * @param {string} text
 * @param {() => void} callback
 * @param {boolean | void} hotkeyClass
 */
const MoreButton = (text, callback, hotkeyClass) => (
    h('button', {
        class: hotkeyClass
            ? 'more-button hotkey'
            : 'more-button',
        listeners: {
            click: callback,
        },
    }, [
        text
    ])
);

export const toggleMore = () => {
    moreLayer.style.display =
        moreLayer.style.display === 'none'
            ? 'block'
            : 'none';
};

export const moreLayer = h('div', {
    id: 'more-layer',
}, [
    h('div', {
        id: 'more-window',
    }, [
        h('table', {
            id: 'settings-table',
        }, [
            ColorField('Foreground', 'foreground'),
            ColorField('Background', 'background', true),
            RangeField('Pen Width', 'penWidth', 1, 100),
            RangeField('Rubber Width', 'rubberWidth', 1, 100),
        ]),
        MoreButton('Undo', undo, true),
        MoreButton('Redo', redo, true),
        h('br'),
        MoreButton('Clear', clearCanvas, true),
        MoreButton('Save', () => {
            try {
                const a = h('a', {
                    href: canvas.toDataURL(),
                    download: 'canvas-save.png',
                });
                a.click();
            } catch (error) {
                alert('An error occurred!');
                console.error(error);
            }
        }),
        h('br'),
        MoreButton('Back', toggleMore),
    ]),
]);

toggleMore();

document.body.appendChild(moreLayer);
