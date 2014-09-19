/**
 * executor(bucket, next)
 */
'use strict';

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