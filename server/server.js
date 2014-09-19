var io = require('socket.io')(),
    config = require('./config.json');
var clientSignals = {
    TRY_OPEN_ROOM: 'tryopenroom',
    TRY_JOIN_ROOM: 'tryjoinroom',
    TRY_LEAVE_ROOM: 'tryleaveroom',
    TRY_READY_GAME: 'tryreadygame',
    TRY_START_GAEM: 'trystartgame',
    TRY_ATTACKPLANET: 'tryattackplanet',
    TRY_UPGRADETECH: 'tryupgradetech'
};

var serverSignals = {
    CONNECT_SUCCESS: 'connectsuccess',
    OPEN_ROOM: 'openroom',
    ROOM_STATUS: 'roomstatus',
    JOIN_ROOM: 'joinroom',
    LEAVE_ROOM: 'leaveroom',
    ATTACK_PLANET: 'attackplanet',
    UPGRADE_TECH: 'upgradetech'
};


//id用来唯一标识一个用户
var id = 0;
//users 数组存储所有的用户
var users = [];	

//buckets存储为一个数组
//每个bucket数组元素 定义为一个对象,每个对象有{type:'',data:''}
//48ms广播一次
var curBucket = [],
    nextBucket = [],  
    signals = {
      SERVER_MSG: 'servermsg'
    };


// function runServer(){
		io.on('connection', function(socket){
      nextBucket.push({"type":serverSignals.CONNECT_SUCCESS});
      id++;
      socket.id = id;
      console.log('connect' +socket.id);

      socket.on(clientSignals.TRY_OPEN_ROOM, function(data){
        var username = data.username;
        socket.username = username;
        users.push({"host":username});
        nextBucket.push({"type":serverSignals.OPEN_ROOM,"data":data});
      });


    	socket.on(clientSignals.TRY_JOIN_ROOM, function (data) {

        socket.username = data.username;
        users.push({"user":data.username});


        //当有其他客户端连接上的时候发送给他当前的房间状态
        var curUsers = JSON.stringify(users),
            sendArr = [];
            sendArr[0] = {"type":serverSignals.ROOM_STATUS,"data":curUsers};
        socket.emit(signals.SERVER_MSG, sendArr);

        nextBucket.push({"type":serverSignals.JOIN_ROOM,"data":data});

    	});

      socket.on('disconnect', function(data){
        var leaveuser = socket.username;
        for(var i in users){
          var user = users[i];
          if(user.host == leaveuser || user.user == leaveuser){
            users.splice(i,1);
            break;
          }
        }
        nextBucket.push({"type":serverSignals.LEAVE_ROOM,"data":"{username:"+leaveuser+"}"});
      });

      // data:{attacker:"username",target:"username",count:""}
      socket.on(clientSignals.TRY_ATTACKPLANET,function(data){
        nextBucket.push({"type":serverSignals.ATTACK_PLANET,"data":data})
      });

      // data:{username:'xx',"techname":'xx'}
      socket.on(clientSignals.TRY_UPGRADETECH,function(data){
        nextBucket.push({"type":serverSignals.TRY_UPGRADETECH,"data":data})
      });


      var startTime = new Date(),
          frame = 1,
          cooldown = config.frameDelay || 48;

      setImmediate = function (fn) {
        setTimeout(fn, 1);
      };

      setImmediate(function fn() {
        var now = new Date();
        if (now < startTime + cooldown * frame) {
            return setImmediate(fn);
        }
        broadcastMsg();
        diff = now - startTime - cooldown * frame;
        frame++;
        setImmediate(fn);
      });

      function broadcastMsg(){
        curBucket = nextBucket;
        nextBucket = [];
        socket.broadcast.emit(signals.SERVER_MSG, curBucket);
      }

	});

	io.listen(config.port||3000);
// }


// exports.runServer = runServer;
