'use strict';

// TODO: sprite is undefined
var config, sprite;

var network = require('./network'),
    signals = require('./signals');

exports.getSprite = function (id) {
    return sprite.getSprite(id);
};
exports.getAngle = function (a, b) {
    if (typeof a === 'number' || typeof b === 'number') {
        a = exports.getSprite(a);
        b = exports.getSprite(b);
    }

    return Math.atan2(Math.abs(a.y - b.y), Math.abs(a.x - b.x));
};
exports.getConfig = function () {
    if (!config) {
        config = require('../game.config.json');
    }
    return config;
};
exports.getDistance = function (a, b) {
    if (typeof a === 'number' || typeof b === 'number') {
        a = exports.getSprite(a);
        b = exports.getSprite(b);
    }

    var x = a.x - b.x,
        y = a.y - b.y;

    return Math.sqrt(x * x + y * y);
};
var listeners = {};
exports.broadcast = function (target, event, detail) {
    var arr = listeners[event];
    arr.forEach(function (val) {
        if (val.target) {
            if (val.target !== target) return;
        }
        val.handler(target, event, detail);
    });
};
exports.listen = function (target, event, handler) {
    if (arguments.length === 2) {
        handler = event;
        event = target;
        target = null;
    }
    listeners[event] = {
        target: target,
        handler: handler
    };
};

exports.sendOrder = function (order) {
    network.sendMessage(
        signals.REQUEST.GAME_ORDER,
        order
    );
};

exports.getSpriteId = function (order) {
    if (typeof order === 'number') return order;
    else return order.id;
};