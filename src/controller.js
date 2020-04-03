// @ts-check
import { canvas, history, context, applyLineStyle, clearTrash } from './canvas.js';

export const states = {
    foreground: '#000000',
    background: '#99FFAA',
    penWidth: 4,
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

const isTouchScreen = navigator.maxTouchPoints
    || /ios|iphone|ipad/i.test(navigator.userAgent);

let isPressing = false;

if (isTouchScreen) {
    window.addEventListener('touchstart', event => {
        if (event.target !== canvas) {
            return;
        }
        event.preventDefault();
        isPressing = true;
        const touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            controller.start(
                touches[i].identifier,
                touches[i].clientX,
                touches[i].clientY
            );
        }
    }, { passive: false });
    window.addEventListener('touchmove', event => {
        if (!isPressing) {
            return;
        }
        const touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            controller.move(
                touches[i].identifier,
                touches[i].clientX,
                touches[i].clientY
            );
        }
    });
    window.addEventListener('touchend', event => {
        if (!isPressing) {
            return;
        }
        isPressing = false;
        const touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            controller.stop(
                touches[i].identifier,
                touches[i].clientX,
                touches[i].clientY
            );
        }
    });
} else {
    window.addEventListener('mousedown', event => {
        if (event.target !== canvas) {
            return;
        }
        event.preventDefault();
        isPressing = true;
        controller.start(
            event.button,
            event.clientX,
            event.clientY
        );
    }, { passive: false });
    window.addEventListener('mousemove', event => {
        if (!isPressing) {
            return;
        }
        controller.move(
            event.button,
            event.clientX,
            event.clientY
        );
    });
    window.addEventListener('mouseup', event => {
        if (!isPressing) {
            return;
        }
        isPressing = false;
        controller.stop(
            event.button,
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
}
