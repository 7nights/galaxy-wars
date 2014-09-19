'use strict';

var nowTime;
exports.setNowTime = function () {
    nowTime = + new Date;
};
exports.getNowTime = function () {
    return nowTime;
};

