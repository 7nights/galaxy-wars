var socket,
	signals = require('./signals');

function runServer(){
	require('../server/server').runServer();
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
	return socket;
}

module.exports = {
	runServer: runServer,
	getMessage: getMessage,
	sendMessage: sendMessage,
	connect: connect
};