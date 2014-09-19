'use strict';

var config;

exports.getSprite = function () {

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