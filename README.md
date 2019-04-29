# node_djxt_socket
电机操作系统
### 业务背景

最近接到一个需求，在微信公众号界面设计一个独立界面，界面上有 A 电机进、A 电机退、B 电机进、B 电机退 4 个按钮，点击对应按钮，云平台发送不同的代码给电机本地的控制器，控制电机执行不同的动作，电机本地控制器具备GPRS网络功能。服务器与电机本地控制器（客户端）采用 TCP 协议连接，客户端发送心跳包给服务器保持长连接，客户端每次收到服务器下发的代码指令后作出回复主要的实现原理是前端访问后台的接口传输数据。后台采用用socket与GPRS模块进链接，暴露出一个IP+PORT给GPRS进行访问即可，实现逻辑比较简单。但是在开发中出现一下比较棘手问题，下面进行一一归纳。

### 技术栈

主要采用的技术栈前端部分采用vue和weUI，后台采用node的koa框架，前端页面是直接写在koa里面，由于页面比较简单，所以没有实现前后的分离。

### 实现过程

 #### 1、前端部分
![image.png](https://upload-images.jianshu.io/upload_images/14483412-6d3448a6d602e134.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

前端部分实现主要是提供4个按钮，向后台接口请求对应的数据，例如：点击A点击前进，就向后台请求http://XXXX:4000/djxt/move接口并传输数据，可以下载完整项目运行后，通过127.0.0.1:3002/djxt进行访问，页面html代码主要部分如下：
 ```
  <div class="wrap">
      <button @click="goA('A1')" class="weui-btn" v-bind:class="{ 'weui-btn_loading': btnStatus.cur == 'A1'&&btnStatus.status==0, 'weui-btn_primary': btnStatus.cur == 'A1'&&btnStatus.status==1, 'weui-btn_plain-primary': btnStatus.cur != 'A1' }">A 前进<i v-show="btnStatus.cur == 'A1'&&btnStatus.status==0" class="weui-loading"></i></button>

      <button @click="backA('A0')" class="weui-btn" v-bind:class="{ 'weui-btn_loading': btnStatus.cur == 'A0'&&btnStatus.status==0, 'weui-btn_primary': btnStatus.cur == 'A0'&&btnStatus.status==1, 'weui-btn_plain-default': btnStatus.cur != 'A0' }">A 后退<i v-show="btnStatus.cur == 'A0'&&btnStatus.status==0" class="weui-loading"></i></button>

      <button @click="goB('B1')" class="weui-btn" v-bind:class="{ 'weui-btn_loading': btnStatus.cur == 'B1'&&btnStatus.status==0, 'weui-btn_primary': btnStatus.cur == 'B1'&&btnStatus.status==1, 'weui-btn_plain-primary': btnStatus.cur != 'B1' }">B 前进<i v-show="btnStatus.cur == 'B1'&&btnStatus.status==0" class="weui-loading"></i></button>
      
      <button @click="backB('B0')" class="weui-btn" v-bind:class="{ 'weui-btn_loading': btnStatus.cur == 'B0'&&btnStatus.status==0, 'weui-btn_primary': btnStatus.cur == 'B0'&&btnStatus.status==1, 'weui-btn_plain-default': btnStatus.cur != 'B0' }">B 后退<i v-show="btnStatus.cur == 'B0'&&btnStatus.status==0" class="weui-loading"></i></button>
    </div>
 ```
发送数据给后台部分代码如下：

```
 // A 前进
          goA (id){
            axios.post('/djxt/move', { id })
            .then( (response)=> {
              console.log(response);
              if( response.data.success ){
                this.alertDialog.content = '操作成功';
                this.alertDialog.status = true;
              }else{
                this.alertDialog.content = '操作失败了';
                this.alertDialog.status = true;
              }
            })
            .catch( (error)=> {
              console.log(error);
                this.alertDialog.content = '操作失败了';
                this.alertDialog.status = true;
            });
          }
```

#### 2、后台实现

由于用的是node技术栈，当初使用的是scoket.io来进行scoket链接的，但是在后面的开发中发现该方法需要有一个事件去触发提交数据，在客户端也需要有事件进行监听，不适合在与GPRS进行通信，最后无奈的放弃了。后面采用了node的NET模块进行通信，该模块只要调用write(data)就可以发送绑定端口的数据。相对比较简单。可以参考一下[https://nodejs.org/dist/latest-v10.x/docs/api/net.html](https://nodejs.org/dist/latest-v10.x/docs/api/net.html) 看不懂英文可以找中文版的。
net的连接可以写在www文件或是app.js文件，看自己需求。在该项目中暴露出来接口127.0.0.1:3004,代码如下：
```
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
// 全局sock，可以在其他地方调用
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

```
代码中的HOST 是你需要暴露给GPRS模块的ip，PORT是端口。net.createServer创建服务后，它回调里面的sock可以用来做一些监听，例如客户端返回数据```sock.on('data', function(data) {})```。在开发过程中遇到一个问题就是HOST在本地是用127.0.0.1是可以进行访问的，但是到了云服务后，会出现端口访问不了。解决办法是把HOST改为你自己服务器的内网ip即可进行访问。```global.sock = sock```这个主要是暴露全局的sock，可以在其他需要地方进行调用，切记要暴露出去。

服务端处理前端发送过来的数据，发送到GPRS模块。该项目中前端访问的路由为```/move```，进入这个路由后进行判断，再把值转发给GPRS，这里关键点是利用全局的Sock的```sock.write()```来发送到客户端。代码如下

```
//前端接口
router.post('/move', async (ctx, next) => {
  let params = ctx.request.body;
  
  // console.log('ctx.state： ', global.sock)
  // console.log('ctx.state2222： ', sock)
  console.log('前端接口： ', params)
  if( !sock ){
    ctx.body = {
      data: params,
      success: false,
      msg: 'socket不存在'
    }
  }else{
    sock.write( params.id );

    ctx.body = {
      data: params,
      success: true,
      msg: ''
    }
  }
})

```
完整的代码可参考github。[https://github.com/bayi-lzp/node_djxt_socket](https://github.com/bayi-lzp/node_djxt_socket)




 


