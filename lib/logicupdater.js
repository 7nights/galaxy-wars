'use strict';
var
    util = require('./util');

var
    /* 每一个 bucket 会执行多少个逻辑帧， 48ms 的 bucket 对应3个 */
    MAX_LOGIC_FRAME_PER_BUCKET = 3,
    /* 每一个逻辑帧的间隔时间(ms) */
    LOGIC_FRAME_COOLDOWN       = 16;
var
    /* 收到的 bucket 缓存 */
    bucketPool            = [],
    /* 最后一次更新逻辑帧的时间 */
    lastLogicUpdate       = 0,
    /* 当前逻辑帧是当前 bucket 的第几个逻辑帧 */
    bucketLogicFrameIndex = 0,
    /* 逻辑帧计数器 */
    logicFrameIndex       = 0;
    
function requestUpdateGame() {
    util.setNowTime();
    /* s1 */
    while (bucketPool.length > 1) {
        updateGame();
    }

    /* s2 */
    var i = parseInt((util.getNowTime() - lastLogicUpdate) / LOGIC_FRAME_COOLDOWN),
        j = MAX_LOGIC_FRAME_PER_BUCKET - bucketLogicFrameIndex;
    i = Math.min(i, j);
    while (i > 0) {
        i--;
        updateGame();
    }
}

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
    bucketLogicFrameIndex++;
    logicFrameIndex++;
    lastLogicUpdate = util.getNowTime();
}

function execBucket() {
    bucketLogicFrameIndex = 0;
    var bkt = bucketPool.shift();
    bucketChain.exec(bkt);
}
