(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.silk = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = child;
const util_1 = require("./util");
const defaultBehaviour = {
    onMount: mount => { mount(); return util_1.noop; },
    onUnmount: unmount => { unmount(); return util_1.noop; },
};
function child(node, arg, presence, behaviour) {
    behaviour || (behaviour = { ...defaultBehaviour });
    const childNode = typeof arg === 'string' || typeof arg === 'number'
        ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
        : arg;
    switch (typeof presence) {
        case 'undefined':
            return childNode ? [...node.childNodes].indexOf(childNode) : -1;
        case 'boolean':
        case 'number':
            if (presence === false) {
                presence = -1;
            }
            else if (presence === true) {
                presence = node.childNodes.length;
            }
            if (behaviour.currentIndex === undefined) {
                behaviour.lastIndexRequest =
                    behaviour.currentIndex =
                        childNode ? [...node.childNodes].indexOf(childNode) : -1;
            }
            if (presence === behaviour.lastIndexRequest) {
                return Promise.resolve({ presence, response: 'SAME REQUEST' });
            }
            const cancel = behaviour.lastIndexRequest >= 0 ? behaviour.cancelMount : behaviour.cancelUnmount;
            cancel?.();
            behaviour.lastIndexRequest = presence;
            if (presence === behaviour.currentIndex) {
                return Promise.resolve({ presence, response: 'NO CHANGE' });
            }
            return new Promise(resolve => {
                let isImmediatePass = false;
                let cancel;
                cancel = (presence >= 0 ? behaviour.onMount : behaviour.onUnmount)(() => {
                    isImmediatePass = true;
                    if (util_1.observeCalled.hasBeenCalled(cancel)) {
                        resolve({ presence: presence, response: 'CANCELLED' });
                        return { presence: presence, response: 'CANCELLED' };
                    }
                    behaviour.currentIndex = presence;
                    const childNode = (typeof arg === 'string' || typeof arg === 'number'
                        ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
                        : arg);
                    if (presence >= 0) {
                        const addendo = childNode ?? document.createTextNode(`${arg}`);
                        if (node.childNodes[presence] !== addendo) {
                            node.insertBefore(addendo, node.childNodes[presence]);
                        }
                    }
                    else if (childNode && node.contains(childNode)) {
                        node.removeChild(childNode);
                    }
                    resolve({ presence: presence, response: 'OK' });
                    if (presence >= 0) {
                        behaviour.cancelMount = undefined;
                    }
                    else {
                        behaviour.cancelUnmount = undefined;
                    }
                    return { presence: presence, response: 'OK' };
                }, presence);
                if (isImmediatePass) {
                    cancel = undefined;
                }
                if (presence >= 0) {
                    cancel = behaviour.cancelMount = (0, util_1.observeCalled)(cancel);
                }
                else {
                    cancel = behaviour.cancelUnmount = (0, util_1.observeCalled)(cancel);
                }
            });
        case 'function':
            const specialBehaviour = {
                ...behaviour,
                currentIndex: -1,
                lastIndexRequest: -1,
                cancelMount: undefined,
                cancelUnmount: undefined
            };
            const value = presence(value => {
                return child(node, arg, value, specialBehaviour);
            }) ?? undefined;
            if (value === undefined) {
                const childNode = (typeof arg === 'string' || typeof arg === 'number'
                    ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
                    : arg);
                const index = childNode ? [...node.childNodes].indexOf(childNode) : -1;
                return Promise.resolve({ presence: index });
            }
            return child(node, arg, value, behaviour);
        default:
            throw new Error(`Invalid argument type for "presence": ${typeof presence}`);
    }
}

},{"./util":11}],3:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = children;
const child_1 = __importDefault(require("./child"));
function children(node, args) {
    switch (typeof args) {
        case 'undefined':
            return [...node.childNodes];
        case 'object':
            if (!Array.isArray(args)) {
                throw new Error('Invalid children argument: object not array');
            }
            args.forEach(value => {
                if (typeof value === 'object' && 'child' in value) {
                    (0, child_1.default)(node, value.child, value.presence, value);
                    return;
                }
                if (typeof value === 'string' || typeof value === 'number') {
                    value = document.createTextNode(`${value}`);
                }
                if (value instanceof HTMLElement || value instanceof SVGElement || value instanceof Text) {
                    (0, child_1.default)(node, value, true);
                }
                else {
                    throw new Error(`Invalid child type: ${typeof value}`);
                }
            });
            return [...node.childNodes];
        case 'function':
            args((value, presence, behaviour) => {
                if (value === undefined) {
                    return [...node.childNodes];
                }
                return (0, child_1.default)(node, value, presence, behaviour);
            });
            return [...node.childNodes];
        default:
            throw new Error(`Invalid argument type for "children": ${typeof args}`);
    }
}

},{"./child":2}],4:[function(require,module,exports){
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

},{"./attr":1,"./classes":5,"./styles":9}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = silk;
const children_1 = __importDefault(require("./children"));
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
        (0, children_1.default)(node, childrenToAdd);
    }
    return node;
}

},{"./children":3,"./props":6,"./text":10}],8:[function(require,module,exports){
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
            return result === undefined
                ? node.textContent ?? ''
                : text(node, result);
        default:
            throw new Error(`Invalid argument type for "text": ${typeof arg}`);
    }
}

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noop = exports.observeCalled = void 0;
const observeCalled = (f) => {
    if (!f)
        return undefined;
    const _ = function (...args) {
        _.hasBeenCalled = true;
        _.timesCalled++;
        return f(...args);
    };
    _.hasBeenCalled = false;
    _.timesCalled = 0;
    _.id = Math.floor(Math.random() * 100);
    return _;
};
exports.observeCalled = observeCalled;
exports.observeCalled.hasBeenCalled = (f) => {
    return typeof f === 'function' && f !== null && f.hasBeenCalled;
};
const noop = () => { };
exports.noop = noop;

},{}]},{},[7])(7)
});
