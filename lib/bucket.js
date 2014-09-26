'use strict';

/**
 * Bucket 类
 */

function Bucket(orders) {
    this.orders = orders || {};
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
    return this;
};
Bucket.prototype.concat = function (bucket) {
    for (var key in bucket.orders) {
        if (key in this.orders) {
            this.orders[key] = this.orders[key].concat(bucket.orders[key]);
        } else {
            this.orders[key] = bucket.orders[key].slice();
        }
    }
    return this;
};
/**
 *
 */
Bucket.prototype.getOrders = function (name) {
    return this.orders[name];
};