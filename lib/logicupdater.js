'use strict';
require('colors');
var
    util = require('./util');

var
    /* 每一个 bucket 会执行多少个逻辑帧， 48ms 的 bucket 对应3个 */
    MAX_LOGIC_FRAME_PER_BUCKET = 3,
    /* 每一个逻辑帧的间隔时间(ms) */
    LOGIC_FRAME_COOLDOWN       = 16,
    TIMER_DEVIATION            = 4;
var
    /* 收到的 bucket 缓存 */
    bucketPool            = [],
    /* 最后一次更新逻辑帧的时间 */
    lastLogicUpdate       = 0,
    /* 当前逻辑帧是当前 bucket 的第几个逻辑帧 */
    bucketLogicFrameIndex = 0,
    /* 逻辑帧计数器 */
    logicFrameIndex       = 0,
    /* 延迟的逻辑缓存 */
    delayLogics           = [],
    spriteController = require('./spritecontroller');

var sprites;

var bucketChain = new (require('./bucketchain'));
bucketChain.register('../bucket_executors/');

exports.setSprites = function (s) {
    sprites = s;
};

/**
 * Requests game logic update.
 */
function requestUpdateGame() {
    util.setNowTime();
    /* s1 */
    while (bucketPool.length > 1) {
        updateGame();
    }

    /* s2 */
    var i = parseInt((util.getNowTime() - lastLogicUpdate) / LOGIC_FRAME_COOLDOWN),
        j = MAX_LOGIC_FRAME_PER_BUCKET - bucketLogicFrameIndex;
    
    if (i === 0 && util.getNowTime() - lastLogicUpdate <= TIMER_DEVIATION) {
        i = 1;
    }

    i = Math.min(i, j);
    while (i > 0) {
        i--;
        try {
            updateGame();
        } catch (error) {
            return;
        }
    }
}
exports.requestUpdateGame = requestUpdateGame;
exports.pushBucket = function (bkt) {
    bucketPool.push(bkt);
};

function updateGame() {
    /* s1 */
    if (MAX_LOGIC_FRAME_PER_BUCKET - bucketLogicFrameIndex <= 0) {
        execBucket();
    }
    /* s2 */
    sprites.forEach(function (val) {
        spriteController.exec(val);
    });
    /* s3 */
    for (var i = 0; i < delayLogics.length; i++) {
        if (delayLogics[i].target === logicFrameIndex) {
            delayLogics[i].callback();
        } else if (delayLogics[i].target > logicFrameIndex) {
            break;
        }
    }
    /* s4 */
    bucketLogicFrameIndex++;
    logicFrameIndex++;
    lastLogicUpdate = util.getNowTime();
}

function execBucket() {
    if (bucketPool.length <= 0) throw new Error('[ERROR] execBucket() failed: bucketPool is empty.'.red);
    bucketLogicFrameIndex = 0;
    var bkt = bucketPool.shift();
    bucketChain.exec(bkt);
}

/**
 * Executes fn after time.
 */
function sleep(fn, time) {
    var delayFrame = parseInt(time / LOGIC_FRAME_COOLDOWN);
    
    insertDelayFrame(delayFrame + logicFrameIndex, fn);
}

function createTimer(fn, repeat) {
    var stopped = false;

    sleep(function func() {
        fn();
        !stopped && sleep(func, repeat);
    }, repeat);

    return {
        stop: function () {
            stopped = true;
        }
    };
}

function insertDelayFrame(targetFrame, fn) {
    /* TODO: 二分插入排序 */
    for (var i = 0, length = delayLogics.length; i < length; i++) {
        if (delayLogics[i].target >= targetFrame) {
            delayLogics.splice(i, 0, {
                target: targetFrame,
                callback: fn
            });
            return;
        }
    }
    delayLogics.push({
        target: targetFrame,
        callback: fn
    });
}

