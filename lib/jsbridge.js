;(function(io,require,window){
	// if(!io || !require){
	// 	return;
	// }
	window.jsbridge = {
		runServer: runServer,
		getMessage: getMessage,
		sendMessage: sendMessage,
		connect: connect
	};
	var socket,
		signals = {
			SERVER_MSG: 'servermsg'
		}

	function runServer(){
		require('./server').runServer();
	}

	function getMessage(callback){
		socket.on(signals.SERVER_MSG,callback);
	}

	function sendMessage(type,data){
		socket.emit(type,data);
	}

	function connect(address,port){
		if(!address){
			address = '127.0.0.1';
		}
		if(!port){
			port = '3000';
		}
		socket = io.connect('ws://'+address+':'+port);
	}

})(io,'',this);