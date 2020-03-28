// @ts-check
import { states } from './controller.js';
import { keymaps } from './keymaps.js';

const RATIO = window.devicePixelRatio || 1;

/**
 * @type {HTMLCanvasElement}
 */
// @ts-ignore
export const canvas = document.getElementById('canvas');

const resize = () => {
    canvas.width = window.innerWidth * RATIO;
    canvas.height = window.innerHeight * RATIO;
};
resize();

export const context = canvas.getContext('2d');

const renderBackground = () => {
    context.fillStyle = states.background;
    context.fillRect(0, 0, canvas.width / RATIO, canvas.height / RATIO);
};

const reset = () => {
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.setTransform(
        RATIO, 0,
        0, RATIO,
        0, 0
    );
    renderBackground();
};
reset();

const RESIZE_DELAY = 100;
let resizeTimer;
window.addEventListener('resize', () => {
    if (resizeTimer) {
        clearTimeout(resizeTimer);
    }
    setTimeout(() => {
        resize();
        renderAll();
    }, RESIZE_DELAY);
});

/**
 * @typedef Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Line
 * @property {string | null} color
 * @property {number} width
 * @property {Point[]} path
 */

/**
 * @param {Line} line
 */
export const applyLineStyle = line => {
    context.lineWidth = line.width;
    context.strokeStyle = line.color || states.background;
};

const CLEAR_SIGN = 0;

/**
 * @type {(Line | CLEAR_SIGN)[]}
 */
export const history = [];

/**
 * @type {typeof history}
 */
const trash = [];

export const undo = () => {
    if (history.length) {
        trash.push(history.pop());
        renderAll();
    }
};

keymaps.set('U', undo);

export const redo = () => {
    if (trash.length) {
        const step = trash.pop();
        history.push(step);
        if (step === CLEAR_SIGN) {
            renderBackground();
        } else {
            renderLine(step);
        }
    }
};

keymaps.set('R', redo);

export const clearTrash = () => {
    trash.length = 0;
};

export const clearCanvas = () => {
    if (history[history.length - 1] === CLEAR_SIGN) {
        return; // avoid duplicate ones
    }
    history.push(CLEAR_SIGN);
    clearTrash();
    renderBackground();
};

keymaps.set('C', clearCanvas);

/**
 * @param {Line} line
 */
const renderLine = line => {
    applyLineStyle(line);
    context.beginPath();
    line.path.forEach((point, i) => {
        if (i) {
            context.lineTo(point.x, point.y);
        } else {
            context.moveTo(point.x, point.y);
        }
    });
    context.stroke();
};

export const renderAll = () => {
    reset();
    const lastClearIndex = history.lastIndexOf(CLEAR_SIGN);
    for (let i = lastClearIndex + 1; i < history.length; i++) {
        // @ts-ignore
        renderLine(history[i]);
    }
};
