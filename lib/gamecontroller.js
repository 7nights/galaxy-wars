'use strict';

var 
    gameUtil         = require('./gameutil'),
    sprite           = require('./sprite'),
    resourceLoader   = require('./resourceloader'),
    logicUpdater     = require('./logicupdater'),
    spriteController = require('./spritecontroller'),
    map,
    playersMap = {};

var sprites = {},
    spritesId = 0;

var planetStage,
    shipStage,
    container;

gameUtil.setSpriteFramework(module.exports);
/**
 * 开始游戏
 *
 * @param options.players
 * @param options.map
 * @param options.randomSeed
 * @param options.container
 */
exports.start = function (options) {
    loadResources();
    /* 初始化游戏设置 */
    initGameConfig(options);

    /* 初始化玩家信息 */
    initPlayers(options.players);

    /* 初始化地图 */
    initMap(options.map, options.players);

    logicUpdater.setSprites(sprites);
    window.requestAnimationFrame(function fn() {
        logicUpdater.requestUpdateGame();

        planetStage.clearCanvas();
        for (var key in sprites) {
            sprites[key].draw();
        }

        window.requestAnimationFrame(fn);
    });
};
exports.getSpritesByType = function (type) {
    switch (type) {
        case 'SHIP':
            return shipStage.getSprites();
        case 'PLANET':
            return planetStage.getSprites();
    }
};
exports.getSprite = function (id) {
    return sprites[id];
};
exports.getRelationship = function (player1, player2) {
    // TODO
    return (player1 === player2) ? gameUtil.RELATIONSHIP.ALLY : gameUtil.RELATIONSHIP.ENMY;
};
exports.getPlayerInfo = function (id) {
    return playersMap[id];
};

function initMap(map, players) {
    map = {
        planets: {
            bornPlanet: [
                {x: 100, y: 100},
                {x: 100, y: 300},
                {x: 800, y: 100},
                {x: 800, y: 300}
            ],
            notOccpiedPlanet: [
                {x: 200, y: 200, army: 5, capacity: 5, volume: 30},
                {x: 400, y: 150, army: 25, capacity: 8, volume: 50},
                {x: 670, y: 320, army: 32, capacity: 10, volume: 60}
            ]
        }
    };
    /* 初始化舞台 */
    var planetStageCanvas = window.document.createElement('canvas'),
        shipStageCanvas = window.document.createElement('canvas');

    planetStageCanvas.width = 1280;
    planetStageCanvas.height = 640;
    shipStageCanvas.width = 1280;
    shipStageCanvas.height = 640;

    container.appendChild(planetStageCanvas);
    container.appendChild(shipStageCanvas);

    planetStage = new sprite.Stage({
        canvas: planetStageCanvas,
        onclick: planetClick,
        onmouseover: planetMouseOver,
        onmouseout: planetMouseOut
    });
    shipStage = new sprite.Stage({
        canvas: shipStageCanvas
    });

    /* 创建玩家星球 */
    var planet;
    var bornPlanet = map.planets.bornPlanet;
    for (var i = players.length; i--; ) {
        var index = gameUtil.random.get() * bornPlanet.length;
        console.log(index);
        var bornLocation = bornPlanet.splice(parseInt(index), 1)[0];

        planet = new sprite.Planet({
            stage: planetStage,
            x: bornLocation.x,
            y: bornLocation.y,
            img: resourceLoader.getImage('planet_' + players[i].color),
            width: 50,
            height: 50,
            army: 100,
            capacity: 5,
            owner: players[i].id
        });
        planetStage.addSprites([planet]);
        planet.id = spritesId++;
        sprites[planet.id] = planet;
    }

    /* 创建中立星球 */
    map.planets.notOccpiedPlanet.forEach(function (val) {
        
        planet = new sprite.Planet({
            stage: planetStage,
            x: val.x,
            y: val.y,
            img: resourceLoader.getImage('planet'),
            width: val.volume,
            height: val.volume,
            capacity: val.capacity,
            army: val.army,
            owner: -1
        });

        planetStage.addSprites([planet]);
        planet.id = spritesId++;
        sprites[planet.id] = planet;
    });
}
function initGameConfig(options) {
    /* 设置随机数种子 */
    gameUtil.random.setSeed(options.randomSeed);

    container = options.container;

    spriteController.register('../sprite_controllers/');

}
function initPlayers(players) {
    playersMap = {};
    var player = 0;
    var colors = require('../config/playercolortable.json');
    
    for (var i = 0; i < players.length; i++) {
        playersMap[players[i].id] = players[i];
        players[i].playerNumber = i;
        players[i].color = colors[i];
    }
}

function planetClick(target) {
    gameUtil.broadcast(target, gameUtil.EVENTS.PLANET.CLICK);
}
function planetMouseOut(target) {
    gameUtil.broadcast(target, gameUtil.EVENTS.PLANET.MOUSEOUT);
}
function planetMouseOver(target) {
    gameUtil.broadcast(target, gameUtil.EVENTS.PLANET.MOUSEOVER);
}

/**
 * Should load resources when client launches.
 */
function loadResources() {
    resourceLoader
        .loadResource('planet_green', 'app://gw/img/game/greenplanet.png')
        .loadResource('planet_yellow', 'app://gw/img/game/yellowplanet.png')
        .loadResource('planet_purple', 'app://gw/img/game/purpleplanet.png')
        .loadResource('planet_red', 'app://gw/img/game/redplanet.png');
}