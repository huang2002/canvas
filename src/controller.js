// @ts-check
import { canvas, history, context, applyLineStyle, clearTrash } from './canvas.js';

export const states = {
    foreground: '#000000',
    background: '#99FFAA',
    penWidth: 4,
    rubberWidth: 16,
};

let isPressing = false;

/**
 * @type {(import('./canvas').Point)[]}
 */
let currentPath;

/**
 * @typedef {(x: number, y: number) => void} ControllerCallback
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
        start(x, y) {
            clearTrash();
            currentPath = [{ x, y }];
            const line = {
                color: states.foreground,
                width: states.penWidth,
                path: currentPath,
            };
            history.push(line);
            applyLineStyle(line);
        },
        move(x, y) {
            /**
             * HACK: sometimes move() just triggers before start(),
             * so this check is here to prevent uninitialized variable
             * from being used, which causes errors.
             */
            if (!currentPath) {
                return;
            }
            const lastPoint = currentPath[currentPath.length - 1];
            currentPath.push({ x, y });
            context.beginPath();
            context.moveTo(lastPoint.x, lastPoint.y);
            context.lineTo(x, y);
            context.stroke();
        },
        stop(x, y) {
            this.move(x, y);
        },
    },

    wiper: {
        start(x, y) {
            clearTrash();
            currentPath = [{ x, y }];
            const line = {
                color: null,
                width: states.rubberWidth,
                path: currentPath,
            };
            history.push(line);
            applyLineStyle(line);
        },
        move(x, y) {
            /**
             * HACK: sometimes move() just triggers before start(),
             * so this check is here to prevent uninitialized variable
             * from being used, which causes errors.
             */
            if (!currentPath) {
                return;
            }
            const lastPoint = currentPath[currentPath.length - 1];
            currentPath.push({ x, y });
            context.beginPath();
            context.moveTo(lastPoint.x, lastPoint.y);
            context.lineTo(x, y);
            context.stroke();
        },
        stop(x, y) {
            this.move(x, y);
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

if (isTouchScreen) {
    window.addEventListener('touchstart', event => {
        if (event.target !== canvas) {
            return;
        }
        event.preventDefault();
        isPressing = true;
        controller.start(
            event.changedTouches[0].clientX,
            event.changedTouches[0].clientY
        );
    }, { passive: false });
    window.addEventListener('touchmove', event => {
        if (!isPressing) {
            return;
        }
        controller.move(
            event.changedTouches[0].clientX,
            event.changedTouches[0].clientY
        );
    });
    window.addEventListener('touchend', event => {
        if (!isPressing) {
            return;
        }
        isPressing = false;
        controller.stop(
            event.changedTouches[0].clientX,
            event.changedTouches[0].clientY
        );
    });
} else {
    window.addEventListener('mousedown', event => {
        if (event.target !== canvas) {
            return;
        }
        event.preventDefault();
        isPressing = true;
        controller.start(
            event.clientX,
            event.clientY
        );
    }, { passive: false });
    window.addEventListener('mousemove', event => {
        if (!isPressing) {
            return;
        }
        controller.move(
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
