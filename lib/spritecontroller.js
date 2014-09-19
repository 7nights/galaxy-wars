/**
 * spriteController
 */
 'use strict';

var controllers = {};
module.exports = {
    controller: function (type, fn) {
        if (type in controllers) {
            console.log('WARNING:', 'controller with type "' + type + '" already exists.');
            controllers[type].push(fn);
        } else {
            controllers[type] = [fn];
        }
    },
    exec: function (sprite) {
        var ctrl = controllers[sprite.type];
        if (!ctrl) {
            throw new Error('Unhandled sprite with type: ' + sprite.type);
        }

        ctrl.forEach(function (val) {
            val(sprite);
        });
    },
    /**
     * 将目标文件夹下的文件全部注册到 controller 里，
     * module.exports = {type: String, controller: Function}
     */
    register: function (path) {

    }
};