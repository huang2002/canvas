// @ts-check
import { canvas, history, context, applyLineStyle, clearTrash } from './canvas.js';

export const states = {
    foreground: '#000000',
    background: '#FFFFFF',
    penWidth: 3,
    rubberWidth: 16,
};

/**
 * @type {Map<number, (import('./canvas').Point)[]>}
 */
const pathMap = new Map();

/**
 * @typedef {(id: number, x: number, y: number) => void} ControllerCallback
 */

/**
 * @typedef Controller
 * @property {ControllerCallback} start
 * @property {ControllerCallback} move
 * @property {ControllerCallback} stop
 */

/**
 * @type {Record<string, Controller>}
 */
const controllers = {

    pen: {
        start(id, x, y) {
            clearTrash();
            const path = [{ x, y }];
            pathMap.set(id, path);
            const line = {
                color: states.foreground,
                width: states.penWidth,
                path,
            };
            history.push(line);
            applyLineStyle(line);
        },
        move(id, x, y) {
            /**
             * HACK: sometimes move() just triggers before start(),
             * so this check is here to prevent uninitialized variable
             * from being used, which causes errors.
             */
            const path = pathMap.get(id);
            if (!path) {
                return;
            }
            const lastPoint = path[path.length - 1];
            path.push({ x, y });
            context.beginPath();
            context.moveTo(lastPoint.x, lastPoint.y);
            context.lineTo(x, y);
            context.stroke();
        },
        stop(id, x, y) {
            this.move(id, x, y);
            pathMap.delete(id);
        },
    },

    wiper: {
        start(id, x, y) {
            clearTrash();
            const path = [{ x, y }];
            pathMap.set(id, path);
            const line = {
                color: null,
                width: states.rubberWidth,
                path,
            };
            history.push(line);
            applyLineStyle(line);
        },
        move(id, x, y) {
            /**
             * HACK: sometimes move() just triggers before start(),
             * so this check is here to prevent uninitialized variable
             * from being used, which causes errors.
             */
            const path = pathMap.get(id);
            if (!path) {
                return;
            }
            const lastPoint = path[path.length - 1];
            path.push({ x, y });
            context.beginPath();
            context.moveTo(lastPoint.x, lastPoint.y);
            context.lineTo(x, y);
            context.stroke();
        },
        stop(id, x, y) {
            this.move(id, x, y);
            pathMap.delete(id);
        },
    },

};

const defaultController = controllers.pen;
let controller = controllers[location.hash.slice(1)] || defaultController;

/**
 * @param {string} key
 */
export const setController = key => {
    controller = controllers[key];
};

let isPressing = false;

window.addEventListener('pointerdown', event => {
    if (event.target !== canvas) {
        return;
    }
    event.preventDefault();
    isPressing = true;
    controller.start(
        event.pointerId,
        event.clientX,
        event.clientY
    );
}, { passive: false });

window.addEventListener('pointermove', event => {
    if (!isPressing) {
        return;
    }
    event.preventDefault();
    controller.move(
        event.pointerId,
        event.clientX,
        event.clientY
    );
}, { passive: false });

window.addEventListener('pointerup', event => {
    if (!isPressing) {
        return;
    }
    isPressing = false;
    controller.stop(
        event.pointerId,
        event.clientX,
        event.clientY
    );
});

window.addEventListener('hashchange', () => {
    const key = location.hash.slice(1);
    if (controllers[key]) {
        controller = controllers[key];
    } else {
        controller = defaultController;
    }
});
