/**
 * @param {string} tag
 * @param {{} | void} props
 * @param {(Node | string)[] | void} children
 */
export const h = (tag, props, children) => {
    const element = document.createElement(tag);
    if (props) {
        const { listeners, ...attributes } = props;
        if (listeners) {
            Object.entries(listeners).forEach(([eventName, listener]) => {
                element.addEventListener(eventName, listener);
            });
        }
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    if (children) {
        children.forEach(child => {
            element.appendChild(
                typeof child === 'string'
                    ? document.createTextNode(child)
                    : child
            );
        });
    }
    return element;
};
