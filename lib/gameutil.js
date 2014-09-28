'use strict';

// TODO: sprite is undefined
var config, sprite;

var network = require('./network'),
    signals = require('./signals');

/**
 * Passes sprite to gameutil
 */
exports.setSpriteFramework = function (sprite) {
    sprite = sprite;
};
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
exports.getPlayerInfo = function (id) {
    return sprite.getPlayerInfo(id);
};

var listeners = {};
/**
 * Broadcasts event.
 *
 * @param {Object} source
 * @param {String} event Event type.
 * @param {Object} detail Custom event data to pass through.
 */
exports.broadcast = function (source, event, detail) {
    var arr = listeners[event];
    if (!arr) return;
    arr.forEach(function (val) {
        if (val.source) {
            if (val.source !== source) return;
        }
        val.handler(source, event, detail);
    });
};
/**
 * Adds a listener to a given event.
 *
 * @param {Object} [target] The target to bind. Can be omitted.
 * @param {String} event Event type.
 * @param {Function} handler Event handler.
 */
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
/**
 * Sends an order to server.
 */
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
exports.getSpritesByType = function (type) {
    return sprite.getSpritesByType(type);
};
/**
 * Moves a sprite towards given direction.
 *
 * @param {Object} sprite Sprite to move.
 * @param {Number} towards Direction radians.
 * @param {Number} speed Distance per second.
 */
exports.moveSprite = function (sprite, towards, speed) {
    speed = speed / (1000 / (exports.getConfig().logicFrameLength || 16));

    sprite.x += Math.cos(towards) * speed;
    sprite.y += Math.sin(towards) * speed;
};
/**
 * Returns the relationship between two players.
 *
 * @return One of gameutil.RELATIONSHIP.
 */
exports.getRelationship = function (player1, player2) {
    sprite.getRelationShip(player1, player2);
};
exports.RELATIONSHIP = {
    ALLY: 'ally',
    ENMY: 'enmy'
};
/**
 * Determines whether the target belongs to given player.
 *
 * @param {Object} target
 * @param {Number} player
 */
exports.checkOwner = function (target, player) {
    return target.owner === player;
};

function md5(data, encoding) {
    var hash = require('crypto').createHash('md5');
    hash.update(data);
    return hash.digest(encoding || 'hex');
}
/**
 * Random number generator. Call random.setSeed() to set
 * random seed before calling random.get().
 */
exports.random = {
    _seed: null,
    _i: 0,
    get: function () {
        if (!this._seed) {
            throw new Error('随机数种子未设置');
        }
        var str = md5('' + this._i + this._seed);
        this._i++;
        var temp = '0.';
        for (var j = 0; j < 32; j+=4) {
            temp += parseInt('0x' + (str.substr(j, j + 4))) % 10;
        }
        return + temp;
    },
    setSeed: function (seed) {
        this._seed = seed;
    }
};

exports.EVENTS = {
    PLANET: {
        CLICK: 'click',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout'
    }
};