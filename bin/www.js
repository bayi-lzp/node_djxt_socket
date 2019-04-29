
var app = require('../app');
var debug = require('debug')('demo:server');
var http = require('http');

var server = http.createServer(app.callback());


//socket
var net = require('net');
// 服务器IP
var HOST = '127.0.0.1';
// 端口号
var PORT = 3004;

// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的

net.createServer(function(sock) {
// 全局sock，可以在气其他地方调用
global.sock = sock
// 获得了一个socket连接，将客户端输出来
console.log('CONNECTED: ' +
    sock.remoteAddress + ':' + sock.remotePort);

// 为这个socket实例添加一个"data"事件处理函数，接收客户端数据
sock.on('data', function(data) {
    console.log('DATA ' + sock.remoteAddress + ': ' + data);
    // 回发该数据，客户端将收到来自服务端的数据，实现ECHO服务器
    // sock.write('' + data );
});

// 为这个socket实例添加一个"close"事件处理函数
sock.on('close', function(data) {
    console.log('CLOSED: ' +
        sock.remoteAddress + ' ' + sock.remotePort);
});

}).listen(PORT, HOST);


server.listen(3002);
