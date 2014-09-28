'use strict';
var
  io = require('socket.io')();

var rooms = {};

var 
    config      = require('../game.config.json'),
    signals     = require('../lib/signals'),
    orderFilter = require('../lib/orderfilter');

function runServer(){
	io.on('connection', function(socket){
      var id = generateUserId();
      socket.user_id = id;
      socket.emit(signals.MESSAGE.CONNECT_SUCCESS, {
        id: id
      });
      console.log('connect' + socket.id);

      /* 创建房间 */
      socket.on(signals.REQUEST.OPEN_ROOM, function(data){
        initUserInfo(socket, data);

        var room = generateRoomId();
        initRoom(room, socket);

        rooms[room].players.push(socket);
        socket.join(room);
        socket.room = room;

        socket.emit(signals.MESSAGE.OPEN_ROOM, {
          roomId: room
        });
      });

      /* 加入房间 */
    	socket.on(signals.REQUEST.JOIN_ROOM, function (data) {
        var room;
        // TODO: 按照 data.room 尝试进入指定的房间，这里直接进入唯一的房间
        if (Object.keys(rooms).length === 0) {
          socket.emit(signals.MESSAGE.ERROR, {
            message: 'Room not found.'
          });
          socket.close();
          return;
        } else {
          room = Object.keys(rooms)[0];
        }

        if (rooms[room].players.indexOf(socket) !== -1)
          return socket.emit(signals.MESSAGE.ERROR, {
            message: 'You are already in this room.'
          });

        initUserInfo(socket, data);

        if ('room' in socket) {
          socket.emit(signals.MESSAGE.ERROR, {
            message: 'You already joined a room.'
          });
          socket.close();
          return;
        }
        
        socket.room = room;
        rooms[room].players.push(socket);
        socket.emit(signals.MESSAGE.JOIN_ROOM, {
          roomId: room,
          players: getPlayerInfo(rooms[room].players)
        });
        io.to(room).emit(signals.MESSAGE.USER_JOIN_ROOM, {
          roomId: room,
          player: getPlayerInfo(socket)
        });
        socket.join(room);
    	});
  
      /* disconnect */
      socket.on('disconnect', function(data){
        var index = rooms[socket.room].players.indexOf(socket);
        rooms[socket.room].players.splice(index, 1);
        /* 广播玩家掉线 */
        io.to(socket.room).emit(signals.MESSAGE.USER_DISCONNECT, {
          player: getPlayerInfo(socket)
        });
      });

      /* game bucket */
      socket.on(signals.REQUEST.GAME_ORDER, function (data) {
        /** data.time 指令的发出时间
         *  根据指令的发出时间去投递到对应的bucket中
         */
        var room = rooms[socket.room];
        var now = + new Date;
        var toBucket = parseInt((parseInt(data.time / config.bucket_time) + config.delay_time) / config.bucket_time);

        deliverOrderToBucket(room, orderFilter(data), toBucket);
      });

      /* start game */
      socket.on(signals.REQUEST.START_GAME, function (data) {
        /**
         *  检查是否是房间创建者，以及房间是否还没有开始游戏
         *  然后即可开始执行逻辑
         */
        if (socket.user_id !== rooms[data.room].creator ||
         rooms[data.room].started === true) {
          socket.emit(signals.MESSAGE.ERROR, {
            message: 'Permission denied'
          });
          return socket.close();
        }

        var room = rooms[data.room];
        room.started = true;

        room.startTime = + new Date;
        room.currentBucket = 0;
        var 
            cooldown = config.bucket_time || 48;

        function doLoop(fn) {
          setTimeout(fn, 1);
        }
        doLoop(function fn() {
          var now = + new Date;
          if (now < room.startTime + cooldown * (room.currentBucket + 1)) {
            return doLoop(fn);
          }
          broadcastBucket(room);
          doLoop(fn);
        });
      });

	});

	io.listen(config.port||3000);
}
/**
 * @pravite
 *
 * Generates a unique id for user.
 */
function generateUserId() {
  var SALT = 'GALLERY_WAR_USER_ID', hash = require('crypto').createHash('md5');
  hash.update(Math.random() + SALT);
  return hash.digest('hex');
}
/**
 * @pravite
 *
 * Generates a unique id for room.
 */
function generateRoomId() {
  var start = 1000;
  
  if (start in rooms) {
    start++;  
  }
  return start;
}
/**
 * @pravite
 *
 * Initializes user info. Call this function after creating a new user.
 */
function initUserInfo(socket, data) {
  socket.username = data.username || '没名字的傻瓜';
  socket.avatar = data.avatar;
  socket.user_id_md5 = md5(socket.user_id);
}
/**
 * @pravite
 *
 * Wraps player data to clients.
 */
function getPlayerInfo(socket) {
  // TODO: generates user_id_md5 in initUserInfo
  var result;
  if (socket.length > 0 && typeof socket.splice === 'function') {
    // array
    result = [];
    socket.forEach(function (val) {
      console.log(val.user_id_md5);
      result.push({
        id: '' + val.user_id_md5,
        name: val.username,
        avatar: val.avatar
      });
    });
  } else {
    result = {
      id: '' + socket.user_id_md5,
      name: socket.username,
      avatar: socket.avatar
    };
  }

  return result;
}
/**
 * @private
 *
 * Delivers a bucket received from a client to bucket pool.
 * @param {Number} room The number of a room
 * @param {Bucket} order Bucket to deliver
 * @param {Number} toBucket Index at the bucket pool
 */
function deliverOrderToBucket(room, order, toBucket) {
  if (!room.bucketPool[toBucket]) {
    room.bucketPool[toBucket] = new Bucket;
  }
  if (toBucket < room.curBucket) toBucket = room.currentBucket;
  
  room.bucketPool[toBucket].concat(order);
}
/**
 * @pravite
 *
 * Initializes a room. Call this function after creating a new room.
 *
 */
function initRoom(room, socket) {
  rooms[room] = {
    id: room,
    creator: socket.user_id,
    created: + new Date,
    players: [],
    bucketPool: []
  };
}
/**
 * @pravite
 *
 * Broadcasts current bucket to all clients.
 *
 * @param room Broadcast destination
 */
function broadcastBucket(room) {
  var bucket;
  if (room.bucketPool[room.currentBucket]) {
    bucket = room.bucketPool[room.currentBucket].orders;
    delete room.bucketPool[room.currentBucket];
  } else {
    bucket = {};
  }
  room.currentBucket++;
  io.to(room.id).emit(signals.MESSAGE.GAME_ORDER, bucket);
  bucket = null;
}
function md5(data, encoding) {
    var hash = require('crypto').createHash('md5');
    hash.update(data);
    return hash.digest(encoding || 'hex');
}

exports.run = runServer;
