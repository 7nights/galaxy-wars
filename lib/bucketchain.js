/**
 * executor(bucket, next)
 */
'use strict';

var path = require('path');

function BucketChain(errorHandler) {
    this.chains = [];
    if (errorHandler) this.errorHandler = errorHandler;
}
BucketChain.prototype.add = function (executor) {
    this.chains.push(executor);
};
BucketChain.prototype.exec = function (bucket) {
    var i = 0, length = this.chains.length;
    this.chains[i](bucket, next);
    
    var self = this;
    function next(err) {
        if (!err) {
            typeof self.errorHandler === 'function' && self.errorHandler(err);
            return;
        }
        i++;
        i < length && self.chains[i](bucket, next);
    }
};
/**
 * 调用目录中的所有文件
 */
BucketChain.prototype.register = function (dir) {
    var files = fs.readdirSync(dir);
    var self  = this;
    files.forEach(function (val) {
        try {
            self.add(require(path.join(dir, val)));
        } catch (err) {}
    });
};