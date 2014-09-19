'use strict';

var orderTable = require('../config/ordertable.json');
module.exports = function (order) {
    var prop = orderTable[order.name];

    var keys = Object.keys(prop);
    if (keys.length < 1) return {};

    var result = {};
    for (var i = 0; i < keys.length; i++) {
        if (order[keys[i]].constructor.name === prop[keys[i]])
            result[keys[i]] = order[keys[i]];
    }
    result.name = order.name;
    result.player = order.player.substr(0, 32);
    result.time = +order.time;
    return result;
};