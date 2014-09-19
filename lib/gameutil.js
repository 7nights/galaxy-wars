'use strict';

// TODO: sprite is undefined
var config, sprite;

var network = require('./network'),
    signals = require('./signals');

/**
 * 通过 id 获得精灵对象
 */
exports.getSprite = function (id) {
    return sprite.getSprite(id);
};
/**
 * 获取两个 sprite 之间的弧度值
 */
exports.getAngle = function (a, b) {
    if (typeof a === 'number' || typeof b === 'number') {
        a = exports.getSprite(a);
        b = exports.getSprite(b);
    }

    return Math.atan2(Math.abs(a.y - b.y), Math.abs(a.x - b.x));
};
/**
 * 获取 game.config.json
 */
exports.getConfig = function () {
    if (!config) {
        config = require('../game.config.json');
    }
    return config;
};
/**
 * 获取两个 sprite 之间的距离
 */
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
/**
 * 通过 sprite 获得它的 id
 */
exports.getSpriteId = function (sprite) {
    if (typeof sprite === 'number') return sprite;
    else return sprite.id;
};

function md5(data, encoding) {
    var hash = require('crypto').createHash('md5');
    hash.update(data);
    hash.digest(encoding || 'hex');
}
/**
 * 获取随机数
 */
exports.random = {
    seed: null,
    i: 0,
    get: function () {
        if (!this.seed) {
            throw new Error('随机数种子未设置');
        }
        var str = md5('' + this.i + this.seed);
        this.i++;
        var temp = '0.';
        for (var j = 0; j < 32; j+=4) {
            temp += parseInt('0x' + (str.substr(j, j + 4))) % 10;
        }
        return + temp;
    },
    setSeed: function (seed) {
        this.seed = seed;
    }
};