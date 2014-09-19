'use strict';

/**
 * Bucket 类
 */

function Bucket() {
    this.orders = {};
}
/**
 * 向 bucket 中添加一个 order
 * @param {String} [name]
 * @param {Object} order
 */
Bucket.prototype.addOrder = function (name, order) {
    if (arguments.length === 1) {
        order = name;
        name = order.name;
    }

    if (name in this.orders) {
        this.orders[name].push(order);
    } else {
        this.orders[name] = [order];
    }
};
/**
 *
 */
Bucket.prototype.getOrders = function (name) {
    return this.orders[name];
};