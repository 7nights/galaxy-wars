'use strict';

/**
 * global logic
 */
var
    gameUtil = require('./lib/gameutil');

function initPlanetLogic() {

    /* 星球生产飞船 */
    gameUtil.createTimer(function () {
        var planets = gameUtil.getSpritesByType('PLANET');
        planets.forEach(function (val) {
            /* 中立星球 */
            if (val.owner < 0) {
                
            }
            val.army += val.capacity;
        });
    }, 5000);

    gameUtil.listen(gameUtil.EVENTS.OWNER_CHANGE, function (target, detail) {

    });

    var focusPlanet = [];
    /* 星球被点击 */
    gameUtil.listen(gameUtil.EVENTS.PLANET.CLICK, function (target, detail) {
        /* 如果被点击的星球是敌人的 */
        if (target.owner !== gameUtil.localPlayer && focusPlanet.length > 0) {
            gameUtil.sendOrder(
                'ORDER_ARMY',
                focusPlanet,
                target,
                gameUtil.getPercentage()
            );
            removeAllFocuses();
            return;
        }

        var index = focusPlanet.indexOf(target);
        if (index !== -1) {
            /* 如果星球已经处于选中状态，则反选择 */
            focusPlanet[index].removePlayerFocus();
            focusPlanet.splice(index, 1);
            return;
        }

        focusPlanet.push(target);
        /* 绘制焦点 */
        target.drawPlayerFocus();
    });
    function removeAllFocuses() {
        focusPlanet.forEach(function (val) {
            val.removePlayerFocus();
        });
        focusPlanet = [];
    }

    /* 鼠标悬停星球 */
    gameUtil.listen(gameUtil.EVENTS.PLANET.MOUSEOVER, function (target, detail) {
        if (target.owner !== gameUtil.localPlayer && focusPlanet.length > 0) {
            focusPlanet.forEach(function (val) {
                val.drawAttckLine(target);
            });

            target.once('mouseout', function () {
                removeAllAttackLines();
            });
        }
    });
    function removeAllAttackLines() {
        focusPlanet.forEach(function (val) {
            val.removeAttackLine();
        });
    }
}