// @ts-check
import { h } from "./common.js";
import { setController } from './controller.js';
import { toggleMore } from "./more.js";
import { keymaps } from './keymaps.js';

/**
 * @param {string} text
 * @param {string} controllerKey
 */
const ControllerButton = (text, controllerKey) => {
    const hash = `#${controllerKey}`,
        hotkey = text[0].toUpperCase(),
        handler = () => {
            setController(controllerKey);
        };
    keymaps.set(hotkey, () => {
        location.hash = hash;
        handler();
    });
    return h('a', {
        id: controllerKey,
        href: hash,
        title: `[${hotkey}]`,
        class: 'toolbar-button controller-button hotkey',
        listeners: {
            click: handler,
        },
    }, [
        text
    ]);
};

/**
 * @param {string} text
 * @param {() => void} callback
 */
const ToolbarButton = (text, callback) => {
    const hotkey = text[0].toUpperCase();
    keymaps.set(hotkey, callback);
    return h('button', {
        class: 'toolbar-button hotkey',
        title: `[${hotkey}]`,
        listeners: {
            click: callback,
        },
    }, [
        text
    ]);
};

document.body.appendChild(
    h('nav', {
        id: 'toolbar',
    }, [
        ControllerButton('Pen', 'pen'),
        ControllerButton('Wiper', 'wiper'),
        ToolbarButton('More', () => {
            toggleMore();
        }),
    ])
);
