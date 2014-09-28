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

    gameUtil.listen(gameUtil.EVENTS.OWNER_CHANGE, function (target, event, detail) {

    });

    var focusPlanet = [];
    /* 星球被点击 */
    gameUtil.listen(gameUtil.EVENTS.PLANET.CLICK, function (target, event, detail) {
        /* 如果被点击的星球是敌人的并且已经有选中的星球 */
        if (target.owner !== gameUtil.localPlayer && focusPlanet.length > 0) {
            gameUtil.sendOrder(
                {
                    name: 'ORDER_ARMY',
                    sources: gameUtil.getSpriteId(focusPlanet),
                    target: gameUtil.getSpriteId(target),
                    percentage: gameUtil.getOrderPercentage()
                }
            );
            removeAllFocuses();
            return;
        } else if (target.owner !== gameUtil.localPlayer) {
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
        target.setFocus(true);
    });
    function removeAllFocuses() {
        focusPlanet.forEach(function (val) {
            val.setFocus(false);
        });
        focusPlanet = [];
    }

    /* 鼠标悬停星球 */
    gameUtil.listen(gameUtil.EVENTS.PLANET.MOUSEOVER, function (target, event, detail) {
        if (target.owner !== gameUtil.localPlayer && focusPlanet.length > 0) {
            focusPlanet.forEach(function (val) {
                val.targetPlanet(target);
            });

            target.once('mouseout', function () {
                removeAllAttackLines();
            });
        }
    });
    function removeAllAttackLines() {
        focusPlanet.forEach(function (val) {
            val.untargetPlanet();
        });
    }
}