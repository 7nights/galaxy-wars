'use strict';

var gameUtil = require('../lib/gameutil'),
    gameConfig = gameUtil.getConfig();
/**
 * spriteController
 */
module.exports = {
    type: 'SHIP',
    controller: function (ship) {
        /* s1 */
        gameUtil.moveSprite(ship, ship.towards, ship.speed);

        ship.target = gameUtil.getSprite(ship.target);
        /* s2 */
        if (gameUtil.getDistance(ship, ship.target) < gameConfig.MIN_COLLISION_DISTANCE + ship.target.width / 2) {
            ship.explode();

            /* 更新星球上的逻辑 */
            applyAttack(ship);
        }
    }
};

function applyAttack(ship) {
    switch (gameUtil.getRelationship(ship.target.owner, ship.owner)) {
        case gameUtil.RELATIONSHIP.ALLY:
            ship.target.army++;
            break;
        case gameUtil.RELATIONSHIP.ENMY:
            ship.target.army--;
            if (ship.target.army < 0) {
                var oldOwner = ship.target.owner;
                ship.target.owner = ship.owner;
                ship.target.army = 0;
                gameUtil.broadcast(ship.target, gameUtil.EVENTS.OWNER_CHANGE, {
                    oldOwner: oldOwner,
                    newOwner: ship.owner
                });
            }
            break;
    }
}