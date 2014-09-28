/**
 * resourceloader 提供统一的资源管理
 */
'use strict';

exports.getImage = function (name) {
    if (!(name in resources)) throw new Error('Tried to get an unload resource: ' + name +'.');
    return resources[name];
};

var resources = {};
exports.loadResource = function (name, path) {
    if (name in resources) console.log('[WARNING] Trying to override resource: ' + name + '.');
    var img = new window.Image();
    img.src = path;
    resources[name] = img;
    return exports;
};