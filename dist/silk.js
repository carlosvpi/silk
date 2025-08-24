(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.silk = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function attr(node, attrName, arg) {
    switch (typeof arg) {
        case 'undefined':
            return node.getAttribute(attrName);
        case 'string':
        case 'number':
            node.setAttribute(attrName, `${arg}`);
            return Promise.resolve(`${arg}`);
        case 'object':
            if (arg === null) {
                node.removeAttribute(attrName);
                return Promise.resolve(null);
            }
            throw new Error(`Invalid argument type for "attr": object not null`);
        case 'boolean':
            if (arg === true) {
                node.setAttribute(attrName, 'true');
            }
            else {
                node.removeAttribute(attrName);
            }
            return Promise.resolve(arg ? 'true' : null);
        case 'function':
            return new Promise(resolve => {
                arg(((value) => {
                    if (value === undefined)
                        return attr(node, attrName);
                    const promise = attr(node, attrName, value);
                    return promise.then(promiseValue => {
                        resolve(promiseValue);
                        return promiseValue;
                    });
                }));
            });
        default:
            throw new Error(`Invalid argument type for "attr": ${typeof arg}`);
    }
}
exports.default = attr;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = child;
const util_1 = require("./util");
const defaultBehaviour = {
    onMount: mount => { mount(); return util_1.noop; },
    onUnmount: unmount => { unmount(); return util_1.noop; },
    onMove: move => { move(); return util_1.noop; },
    onDelete: del => { del(); return util_1.noop; },
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
                behaviour.currentIndex = childNode ? [...node.childNodes].indexOf(childNode) : -1;
            }
            if (presence === behaviour.lastIndexRequest) {
                return Promise.resolve(behaviour.currentIndex); // Same request
            }
            switch (behaviour.lastAction) {
                case 'mount':
                    behaviour.cancelMount?.();
                    break;
                case 'unmount':
                    behaviour.cancelUnmount?.();
                    break;
                case 'move':
                    behaviour.cancelMove?.();
                    break;
            }
            behaviour.lastIndexRequest = presence;
            if (presence === behaviour.currentIndex) {
                return Promise.resolve(presence); // No change
            }
            return new Promise((resolve) => {
                let isImmediatePass = false;
                let cancel;
                const action = (behaviour.currentIndex === -1 && presence >= 0)
                    ? 'Mount'
                    : (behaviour.currentIndex >= 0 && presence === -1) ? 'Unmount'
                        : 'Move';
                behaviour.lastAction = action.toLowerCase();
                const behaviourToCall = behaviour[`on${action}`] ?? util_1.call;
                cancel = behaviourToCall(() => {
                    const childNode = (typeof arg === 'string' || typeof arg === 'number'
                        ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
                        : arg);
                    let index;
                    isImmediatePass = true;
                    if (util_1.observeCalled.hasBeenCalled(cancel)) {
                        index = childNode ? [...node.childNodes].indexOf(childNode) : -1;
                        resolve(index); // cancelled
                        return index;
                    }
                    if (presence >= 0) {
                        const addendo = childNode ?? document.createTextNode(`${arg}`);
                        if (!node.contains(addendo)) {
                            node.insertBefore(addendo, node.childNodes[presence] ?? null);
                        }
                        else if (node.childNodes[presence] !== addendo) {
                            const newIndex = [...node.childNodes].indexOf(addendo) < presence ? presence + 1 : presence;
                            node.insertBefore(addendo, node.childNodes[newIndex] ?? null);
                        }
                        index = [...node.childNodes].indexOf(addendo);
                    }
                    else if (childNode && node.contains(childNode)) {
                        node.removeChild(childNode);
                        index = -1;
                    }
                    else {
                        index = -2;
                    }
                    if (presence >= 0) {
                        behaviour.cancelMount = undefined;
                        behaviour.cancelMove = undefined;
                    }
                    else {
                        behaviour.cancelUnmount = undefined;
                    }
                    behaviour.currentIndex = index;
                    resolve(index); // success
                    return index; // success
                }, presence);
                if (isImmediatePass) {
                    cancel = undefined;
                }
                if (presence >= 0) {
                    if (childNode && (behaviour.currentIndex ?? 1) * presence >= 0) {
                        cancel = behaviour.cancelMove = (0, util_1.observeCalled)(cancel ?? undefined);
                    }
                    else {
                        cancel = behaviour.cancelMount = (0, util_1.observeCalled)(cancel ?? undefined);
                    }
                }
                else {
                    cancel = behaviour.cancelUnmount = (0, util_1.observeCalled)(cancel ?? undefined);
                }
            });
        case 'function':
            const currentIndex = childNode ? [...node.childNodes].indexOf(childNode) : -1;
            let specialBehaviour = {
                ...behaviour,
                currentIndex,
                cancelMount: undefined,
                cancelUnmount: undefined
            };
            const _presence = presence;
            return new Promise(resolve => {
                _presence((value => {
                    if (specialBehaviour === null || specialBehaviour.lastAction === 'delete')
                        return Promise.resolve(-2);
                    const childNode = (typeof arg === 'string' || typeof arg === 'number'
                        ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
                        : arg);
                    const index = childNode ? [...node.childNodes].indexOf(childNode) : -1;
                    resolve(index);
                    return child(node, arg, value, specialBehaviour);
                }), (value => {
                    if (value === undefined)
                        return specialBehaviour === null;
                    if (!value)
                        return false;
                    if (specialBehaviour === null)
                        return Promise.resolve(true);
                    specialBehaviour.cancelMount?.();
                    specialBehaviour.cancelUnmount?.();
                    specialBehaviour.cancelMove?.();
                    specialBehaviour.lastAction = 'delete';
                    const onDelete = specialBehaviour.onDelete ?? util_1.call;
                    onDelete(() => {
                        if (specialBehaviour === null)
                            return -2;
                        const childNode = (typeof arg === 'string' || typeof arg === 'number'
                            ? [...node.childNodes].find(childNode => childNode.textContent === `${arg}`)
                            : arg);
                        const index = childNode ? [...node.childNodes].indexOf(childNode) : -1;
                        if (node.contains(childNode)) {
                            node.removeChild(childNode);
                        }
                        specialBehaviour = null;
                        return index;
                    });
                    return Promise.resolve(specialBehaviour === null);
                }));
            });
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
const child_1 = __importDefault(require("./child"));
function children(node, args) {
    switch (typeof args) {
        case 'undefined':
            return [...node.childNodes];
        case 'object':
            if (!Array.isArray(args)) {
                throw new Error('Invalid children argument: object not array');
            }
            return Promise.all(args.map(value => {
                if (typeof value === 'object' && 'child' in value) {
                    const behaved = value;
                    return (0, child_1.default)(node, behaved.child, behaved.presence, behaved).then(() => behaved.child);
                }
                if (typeof value === 'string' || typeof value === 'number') {
                    value = document.createTextNode(`${value}`);
                }
                if (value instanceof HTMLElement || value instanceof SVGElement || value instanceof Text) {
                    return (0, child_1.default)(node, value, true).then(() => value);
                }
                throw new Error(`Invalid child type: ${typeof value}`);
            })).then(() => [...node.childNodes]);
        case 'function':
            return new Promise(resolve => {
                args(((value, presence, behaviour) => {
                    if (value === undefined)
                        return [...node.childNodes];
                    return (0, child_1.default)(node, value, presence, behaviour);
                }));
                resolve([...node.childNodes]);
            });
        default:
            throw new Error(`Invalid argument type for "children": ${typeof args}`);
    }
}
exports.default = children;

},{"./child":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            return Promise.resolve(arg);
        case 'function':
            return new Promise(resolve => {
                arg(((value) => {
                    if (value === undefined)
                        return classed(node, className);
                    const promise = classed(node, className, value);
                    return promise.then(promiseValue => {
                        resolve(promiseValue);
                        return promiseValue;
                    });
                }));
            });
        default:
            throw new Error(`Invalid argument type for "classed": ${typeof arg}`);
    }
}
exports.default = classed;

},{}],5:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const classed_1 = __importDefault(require("./classed"));
function classes(node, arg) {
    switch (typeof arg) {
        case 'undefined':
            return [...node.classList.values()];
        case 'string':
            node.setAttribute('class', arg);
            return Promise.resolve([...node.classList.values()]);
        case 'object':
            if (arg === null) {
                throw new Error('Invalid "null" as paramter of "classes"');
            }
            if (Array.isArray(arg)) {
                arg.forEach(className => node.classList.add(className));
                return Promise.resolve([...node.classList.values()]);
            }
            return new Promise(async (resolve) => {
                await Promise.all(Object.entries(arg).map(([key, value]) => {
                    return (0, classed_1.default)(node, key, value);
                }));
                resolve(Promise.resolve([...node.classList.values()]));
            });
        case 'function':
            return new Promise(resolve => {
                arg(((key, value) => {
                    if (key === undefined)
                        return [...node.classList.values()];
                    if (value === undefined)
                        return (0, classed_1.default)(node, key);
                    const promise = (0, classed_1.default)(node, key, value);
                    return promise.then(promiseValue => {
                        resolve([...node.classList.values()]);
                        return promiseValue;
                    });
                }));
            });
        default:
            throw new Error(`Invalid argument type for "classes": ${typeof arg}`);
    }
}
exports.default = classes;

},{"./classed":4}],6:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const attr_1 = __importDefault(require("./attr"));
const classes_1 = __importDefault(require("./classes"));
const styles_1 = __importDefault(require("./styles"));
function props(node, arg) {
    switch (typeof arg) {
        case 'undefined':
            return Array.from(node.getAttributeNames()).reduce((acc, attribute) => {
                acc[attribute] = node.getAttribute(attribute) ?? '';
                return acc;
            }, {});
        case 'string':
            switch (arg) {
                case 'class':
                    return (0, classes_1.default)(node);
                case 'style':
                    return (0, styles_1.default)(node);
                default:
                    return node.getAttribute(arg);
            }
        case 'object':
            if (arg === null) {
                throw new Error('Invalid "null" as paramter of "props"');
            }
            return new Promise(async (resolve) => {
                await Promise.all(Object.entries(arg).map(([key, value]) => {
                    switch (key) {
                        case 'class':
                            return (0, classes_1.default)(node, value);
                        case 'style':
                            return (0, styles_1.default)(node, value);
                        case 'ref':
                            return Promise.resolve(value.current = node);
                        default:
                            if (key.startsWith('on')) {
                                if (key.endsWith('Capture')) {
                                    node.addEventListener(key.slice(2, -7).toLowerCase(), value, { capture: true });
                                }
                                else {
                                    node.addEventListener(key.slice(2).toLowerCase(), value);
                                }
                                return Promise.resolve({ [key]: value });
                            }
                            return (0, attr_1.default)(node, key, value);
                    }
                }));
                resolve(Array.from(node.getAttributeNames()).reduce((acc, attribute) => {
                    acc[attribute] = node.getAttribute(attribute) ?? '';
                    return acc;
                }, {}));
            });
        case 'function':
            return new Promise(resolve => {
                arg(((key, value) => {
                    if (key === undefined) {
                        return Array.from(node.getAttributeNames()).reduce((acc, attribute) => {
                            acc[attribute] = node.getAttribute(attribute) ?? '';
                            return acc;
                        }, {});
                    }
                    if (typeof key !== 'string') {
                        const promise = props(node, key);
                        return promise.then(promiseValue => {
                            resolve(Array.from(node.getAttributeNames()).reduce((acc, attribute) => {
                                acc[attribute] = node.getAttribute(attribute) ?? '';
                                return acc;
                            }, {}));
                            return promiseValue;
                        });
                    }
                    if (value === undefined) {
                        return props(node, key);
                    }
                    const promise = props(node, { [key]: value });
                    return promise.then(promiseValue => {
                        resolve(Array.from(node.getAttributeNames()).reduce((acc, attribute) => {
                            acc[attribute] = node.getAttribute(attribute) ?? '';
                            return acc;
                        }, {}));
                        return promiseValue;
                    });
                }));
            });
        default:
            throw new Error(`Invalid argument type for "classes": ${typeof arg}`);
    }
}
exports.default = props;

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
function style(node, styleName, arg) {
    if (styleName === 'length' || styleName === 'parentRule') {
        throw new Error(`Invalid style name: ${styleName}`);
    }
    switch (typeof arg) {
        case 'undefined':
            return node.style[styleName];
        case 'string':
        case 'number':
            return Promise.resolve((node.style[styleName] = `${arg}`));
        case 'function':
            return new Promise(resolve => {
                arg(((value) => {
                    if (value === undefined)
                        return style(node, styleName);
                    const promise = style(node, styleName, value);
                    return promise.then(promiseValue => {
                        resolve(promiseValue);
                        return promiseValue;
                    });
                }));
            });
        default:
            throw new Error(`Invalid argument type for "style": ${typeof arg}`);
    }
}
exports.default = style;

},{}],9:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const style_1 = __importDefault(require("./style"));
function styles(node, arg) {
    switch (typeof arg) {
        case 'undefined':
            return node.style;
        case 'object':
            if (arg === null) {
                throw new Error('Invalid "null" as paramter of "styles"');
            }
            return new Promise(async (resolve) => {
                await Promise.all(Object.entries(arg).map(([key, value]) => {
                    return (0, style_1.default)(node, key, value);
                }));
                resolve(node.style);
            });
        case 'function':
            return new Promise(resolve => {
                arg(((key, value) => {
                    if (key === undefined)
                        return node.style;
                    if (value === undefined)
                        return (0, style_1.default)(node, key);
                    const promise = (0, style_1.default)(node, key, value);
                    return promise.then(promiseValue => {
                        resolve(node.style);
                        return promiseValue;
                    });
                }));
            });
        default:
            throw new Error('Invalid styles argument');
    }
}
exports.default = styles;

},{"./style":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function text(node, arg) {
    switch (typeof arg) {
        case 'undefined':
            return node.textContent ?? '';
        case 'string':
        case 'number':
            return Promise.resolve(node.textContent = `${arg}`);
        case 'function':
            return new Promise(resolve => {
                arg(((value) => {
                    if (value === undefined)
                        return text(node);
                    const promise = text(node, value);
                    return promise.then(promiseValue => {
                        resolve(promiseValue);
                        return promiseValue;
                    });
                }));
            });
        default:
            throw new Error(`Invalid argument type for "text": ${typeof arg}`);
    }
}
exports.default = text;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = exports.noop = exports.observeCalled = void 0;
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
const call = (f, _) => { f(); };
exports.call = call;

},{}]},{},[7])(7)
});
