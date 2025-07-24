(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.silk = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addChild;
function addChild(node, child, behaviour) {
    const remove = () => {
        const result = child;
        if (typeof child !== 'string' && typeof child !== 'number' && node.contains(child)) {
            node.removeChild(child);
        }
        child = '';
        behaviour = undefined;
        return result;
    };
    switch (typeof behaviour) {
        case 'undefined':
            if (typeof child === 'string' || typeof child === 'number') {
                return [...node.childNodes].findIndex(node => node instanceof Text && node.textContent === `${child}`);
            }
            else {
                return [...node.childNodes].indexOf(child);
            }
        case 'boolean':
            if (behaviour) {
                if (typeof child === 'string' || typeof child === 'number') {
                    if (![...node.childNodes].find((node) => node instanceof Text && node.textContent === `${child}`)) {
                        node.appendChild(document.createTextNode(`${child}`));
                    }
                }
                else if (!node.contains(child)) {
                    node.appendChild(child);
                }
                return remove;
            }
            else {
                if (typeof child === 'string' || typeof child === 'number') {
                    const childNodeIndex = [...node.childNodes].findIndex((node) => node instanceof Text && node.textContent === `${child}`);
                    const childNode = node.childNodes[childNodeIndex];
                    if (!!childNode) {
                        node.removeChild(childNode);
                    }
                    return remove;
                }
                const index = [...node.childNodes].indexOf(child);
                if (node.contains(child)) {
                    node.removeChild(child);
                }
                return index;
            }
        case 'number':
            if (typeof child === 'string' || typeof child === 'number') {
                if (behaviour >= 0) {
                    const childNode = node.childNodes[behaviour];
                    if (childNode instanceof Text && childNode.textContent === `${child}`) {
                        return remove;
                    }
                    node.insertBefore(document.createTextNode(`${child}`), node.childNodes[behaviour] || null);
                }
                else {
                    const childNode = [...node.childNodes].find(node => node instanceof Text && node.textContent === `${child}`);
                    if (!childNode) {
                        return remove;
                    }
                    node.removeChild(childNode);
                }
                return remove;
            }
            if (behaviour === [...node.childNodes].indexOf(child)) {
                return remove;
            }
            if (behaviour >= 0) {
                node.insertBefore(child, node.childNodes[behaviour] || null);
            }
            else if (behaviour < 0) {
                node.removeChild(child);
            }
            return remove;
        case 'function':
            behaviour((value) => {
                const result = addChild(node, child, value);
                if (typeof result === 'number') {
                    return result;
                }
                return value ?? false;
            });
            return remove;
        case 'object':
            const onMount = behaviour.onMount ?? (mount => mount());
            const onUnmount = behaviour.onUnmount ?? (unmount => unmount());
            const onCancelMount = behaviour.onCancelMount ?? (() => { });
            const onCancelUnmount = behaviour.onCancelUnmount ?? (() => { });
            const presence = behaviour.presence ?? true;
            child = typeof child === 'string' || typeof child === 'number' ? document.createTextNode(`${child}`) : child;
            if (presence === true || (typeof presence === 'number' && presence >= 0)) {
                if (behaviour.isUnmounting) {
                    onCancelUnmount();
                    behaviour.isUnmounting--;
                }
                if (behaviour.isMounting || node.contains(child)) {
                    return remove;
                }
                if (typeof behaviour.isMounting !== 'number') {
                    behaviour.isMounting = 0;
                }
                behaviour.isMounting++;
                const mountLast = presence === true;
                onMount(() => {
                    if (typeof behaviour !== 'object' || !behaviour.isMounting) {
                        return false;
                    }
                    if (mountLast) {
                        node.appendChild(child);
                    }
                    else {
                        node.insertBefore(child, node.childNodes[presence] || null);
                    }
                    behaviour.isMounting--;
                    return true;
                });
                return remove;
            }
            else if (presence === false || presence === -1) {
                if (behaviour.isMounting) {
                    onCancelMount();
                    behaviour.isMounting--;
                }
                if (behaviour.isUnmounting || !node.contains(child)) {
                    return remove;
                }
                if (typeof behaviour.isUnmounting !== 'number') {
                    behaviour.isUnmounting = 0;
                }
                behaviour.isUnmounting++;
                onUnmount(() => {
                    if (typeof behaviour !== 'object' || !behaviour.isUnmounting) {
                        return false;
                    }
                    behaviour.isUnmounting--;
                    if (node.contains(child)) {
                        node.removeChild(child);
                        return true;
                    }
                    return false;
                });
                return remove;
            }
            else if (typeof presence === 'function') {
                presence((value) => {
                    if (child === '') {
                        return -1;
                    }
                    switch (typeof value) {
                        case 'undefined':
                            break;
                        case 'number':
                        case 'boolean':
                            if (typeof behaviour !== 'object')
                                return false;
                            behaviour.presence = value;
                            console.log('Setting presence:', value);
                            addChild(node, child, behaviour);
                            break;
                        default:
                            throw new Error(`Invalid argument type for "presence": ${typeof presence}`);
                    }
                    return [...node.childNodes].indexOf(child);
                });
                return remove;
                ;
            }
            return remove;
            ;
        default:
            throw new Error(`Invalid argument type for "addChild": ${typeof behaviour}`);
    }
}

},{}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addChildren;
const addChild_1 = __importDefault(require("./addChild"));
function addChildren(node, children) {
    switch (typeof children) {
        case 'undefined':
            return [...node.childNodes];
        case 'object':
            if (Array.isArray(children)) {
                children.forEach(child => {
                    if (typeof child === 'object' && 'child' in child) {
                        (0, addChild_1.default)(node, child.child, child);
                    }
                    else if (child instanceof HTMLElement || child instanceof SVGElement || child instanceof Text) {
                        node.appendChild(child);
                    }
                    else if (typeof child === 'string' || typeof child === 'number') {
                        node.appendChild(document.createTextNode(`${child}`));
                    }
                    else {
                        throw new Error(`Invalid child type: ${typeof child}`);
                    }
                });
                return [...node.childNodes];
            }
            throw new Error('Invalid children argument: object not array');
        case 'function':
            children((value, behaviour) => {
                if (value === undefined) {
                    return [...node.childNodes];
                }
                return (0, addChild_1.default)(node, value, behaviour);
            }, (child) => {
                switch (typeof child) {
                    case 'string':
                        const childNode = [...node.childNodes].find(node => node instanceof Text && node.textContent === child);
                        if (!childNode) {
                            return false;
                        }
                        node.removeChild(childNode);
                        return true;
                    case 'number':
                        if (node.childNodes.length <= child) {
                            return false;
                        }
                        node.removeChild(node.childNodes[child]);
                        return true;
                    default:
                        if (!node.contains(child)) {
                            return false;
                        }
                        node.removeChild(child);
                        return true;
                }
            });
            return [...node.childNodes];
        default:
            throw new Error(`Invalid argument type for "addChildren": ${typeof children}`);
    }
}

},{"./addChild":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = attr;
function attr(node, attrName, arg) {
    switch (typeof arg) {
        case 'undefined':
            return node.getAttribute(attrName);
        case 'string':
            node.setAttribute(attrName, arg);
            return arg;
        case 'object':
            if (arg === null) {
                node.removeAttribute(attrName);
                return null;
            }
            throw new Error(`Invalid argument type for "attr": object not null`);
        case 'boolean':
            if (arg === true) {
                node.setAttribute(attrName, 'true');
            }
            else {
                node.removeAttribute(attrName);
            }
            return arg;
        case 'function':
            const result = arg(value => attr(node, attrName, value));
            if (result !== undefined) {
                if (result === true) {
                    node.setAttribute(attrName, 'true');
                }
                else if (result === false || result === null) {
                    node.removeAttribute(attrName);
                }
                else {
                    node.setAttribute(attrName, result);
                }
            }
            return node.getAttribute(attrName);
        default:
            throw new Error(`Invalid argument type for "attr": ${typeof arg}`);
    }
}

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = classed;
function classed(node, className, arg) {
    switch (typeof arg) {
        case 'undefined':
            return node.classList.contains(className);
        case 'boolean':
            if (arg) {
                node.classList.add(className);
            }
            else {
                node.classList.remove(className);
            }
            return arg;
        case 'function':
            const result = arg(value => classed(node, className, value));
            if (result === true) {
                node.classList.add(className);
                return true;
            }
            else if (result === false) {
                node.classList.remove(className);
                return false;
            }
            else {
                return node.classList.contains(className);
            }
        default:
            throw new Error(`Invalid argument type for "classed": ${typeof arg}`);
    }
}

},{}],5:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = classes;
const classed_1 = __importDefault(require("./classed"));
function classes(node, arg) {
    switch (typeof arg) {
        case 'undefined':
            break;
        case 'string':
            node.setAttribute('class', arg);
            break;
        case 'object':
            if (Array.isArray(arg)) {
                arg.forEach(className => node.classList.add(className));
            }
            else {
                for (const [key, value] of Object.entries(arg)) {
                    (0, classed_1.default)(node, key, value);
                }
            }
            break;
        case 'function':
            arg(((key, value) => {
                if (key === undefined) {
                    return node.className;
                }
                return (0, classed_1.default)(node, key, value);
            }));
            break;
        default:
            throw new Error(`Invalid argument type for "classes": ${typeof arg}`);
    }
    return [...node.classList];
}

},{"./classed":4}],6:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = props;
const attr_1 = __importDefault(require("./attr"));
const classes_1 = __importDefault(require("./classes"));
const styles_1 = __importDefault(require("./styles"));
function props(node, arg) {
    switch (typeof arg) {
        case 'undefined':
            break;
        case 'object':
            for (const [key, value] of Object.entries(arg)) {
                switch (key) {
                    case 'class':
                        (0, classes_1.default)(node, value);
                        break;
                    case 'style':
                        (0, styles_1.default)(node, value);
                        break;
                    case 'ref':
                        value.current = node;
                        break;
                    default:
                        if (key.startsWith('on')) {
                            if (key.endsWith('Capture')) {
                                node.addEventListener(key.slice(2, -7).toLowerCase(), value, { capture: true });
                            }
                            else {
                                node.addEventListener(key.slice(2).toLowerCase(), value);
                            }
                        }
                        else {
                            (0, attr_1.default)(node, key, value);
                        }
                }
            }
            break;
        case 'function':
            arg((value) => {
                if (value === undefined) {
                    return props(node);
                }
                return props(node, value);
            });
            break;
        default:
            throw new Error(`Invalid argument type for "classes": ${typeof arg}`);
    }
    return Array.from(node.attributes).reduce((acc, attribute) => {
        acc[attribute.name] = node.getAttribute(attribute.name) ?? '';
        return acc;
    }, {});
}

},{"./attr":3,"./classes":5,"./styles":9}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = silk;
const addChildren_1 = __importDefault(require("./addChildren"));
const props_1 = __importDefault(require("./props"));
const text_1 = __importDefault(require("./text"));
function silk(tag, props, ...children) {
    if (props === undefined) {
        if (typeof tag === 'string') {
            return document.createTextNode(tag);
        }
        else if (typeof tag === 'function') {
            const node = document.createTextNode('');
            (0, text_1.default)(node, tag);
            return node;
        }
        else if (tag instanceof Node) {
            return tag;
        }
        throw new Error(`Invalid tag type: ${typeof tag}`);
    }
    const node = typeof tag === 'string' ? document.createElement(tag) : tag;
    if (props !== null) {
        (0, props_1.default)(node, props);
    }
    const childrenToAdd = typeof children[0] === 'function' ? children[0] : Array.isArray(children[0]) ? children[0] : children;
    if (children.length > 0) {
        (0, addChildren_1.default)(node, childrenToAdd);
    }
    return node;
}

},{"./addChildren":2,"./props":6,"./text":10}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = style;
function style(node, styleName, arg) {
    if (styleName === 'length' || styleName === 'parentRule') {
        throw new Error(`Invalid style name: ${styleName}`);
    }
    switch (typeof arg) {
        case 'undefined':
            return node.style[styleName];
        case 'string':
            return (node.style[styleName] = arg);
        case 'number':
            return (node.style[styleName] = `${arg}`);
        case 'function':
            return style(node, styleName, arg(value => style(node, styleName, value)) ?? undefined);
        default:
            throw new Error(`Invalid argument type for "style": ${typeof arg}`);
    }
}

},{}],9:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = styles;
const style_1 = __importDefault(require("./style"));
function styles(node, arg) {
    switch (typeof arg) {
        case 'undefined':
            return node.style.cssText;
        case 'string':
            return node.style.cssText = arg;
        case 'object':
            for (const [key, value] of Object.entries(arg)) {
                (0, style_1.default)(node, key, value);
            }
            return node.style.cssText;
        case 'function':
            arg(((key, value) => {
                if (key === undefined) {
                    return node.style.cssText;
                }
                return (0, style_1.default)(node, key, value);
            }));
            return node.style.cssText;
        default:
            throw new Error('Invalid styles argument');
    }
}

},{"./style":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = text;
function text(node, arg) {
    switch (typeof arg) {
        case 'undefined':
            return node.textContent ?? '';
        case 'string':
            return node.textContent = arg;
        case 'number':
            return node.textContent = `${arg}`;
        case 'function':
            const result = arg(value => text(node, value));
            if (result !== undefined) {
                return node.textContent = `${result}`;
            }
            return node.textContent ?? '';
        default:
            throw new Error(`Invalid argument type for "text": ${typeof arg}`);
    }
}

},{}]},{},[7])(7)
});
