'use strict';

var 
    gameUtil     = require('../lib/gameutil'),
    logicUpdater = require('../lib/logicupdater');
/**
 * bucketExecutor
 * order.name ORDER_ARMY
 * 1. 设 sources 为 order.sources 中，所有者为 order.player 的 source
 * 2. 如果 sources.length < 1，丢弃指令
 * 3. 对 sources 中的每一项执行 orderAttack
 */
module.exports = function (bucket, next) {
    var orders = bucket.getOrders('ORDER_ARMY');

    for (var i = 0, length = orders.length; i < length; i++) {
        if (execOrder(orders[i])) {
            return next(null);
        }
    }
};

function execOrder(order) {
    /* s1 */
    var sources = order.sources.filter(function (val) {
        return gameUtil.checkOwner(val, order.player);
    });
    /* s2 */
    if (sources.length < 1) return true;
    /* s3 */
    sources.forEach(function (val) {
        orderAttack(val, order);
    });
}

function orderAttack(source, order) {
    source = util.getSprite(source);
    var count = parseInt(source.ships * order.percentage);
    for (var i = 0; i < count; i++) {
        createShip(source, order, i);
    }
}

/**
 * 创建飞船
 */
function createShip(source, order, i) {
    logicUpdater.sleep(function () {
        sprite.createShip(
            order.player,
            order.target,
            /* x */
            i % 2 === 0 ? (source.x - source.width / 2 - 15) : (source.x + source.width / 2 + 15),
            /* y */
            i % 2 === 0 ? (source.y - source.height / 2 - 15) : (source.y + source.height / 2 + 15),
            /* towards */
            gameUtil.getAngle(source, order.target),
            /* speed */
            source.shipSpeed || 180
        );
    }, 16 * i);
}