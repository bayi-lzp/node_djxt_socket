const router = require('koa-router')()

router.prefix('/djxt')

//首页
router.get(['/', '/index.html'], async (ctx, next) => {
  await ctx.render('index', {
    // user: 'John'
  });
})
router.get('/test', async (ctx, next) => {
  var net = require("net");
  
  // net.Socket,
  var sock = net.connect({
    // port: 3003,
    // host: "47.106.246.12",
    port: 3004,
    host: "127.0.0.1",
  }, function() {
    console.log('connected to server!');
  });
  
  // 连接成功调用的事件
  sock.on("connect",function() {
    console.log("connect success");
  
  
    // 在这里我们就可以发送数据了
    sock.write("HelloWorld!", "utf8");
    // end 
  });
  // end
  
  // 有错误发生调用的事件
  sock.on("error", function(e) {
    console.log("error", e);
  });
  
  // socket关闭的事件
  sock.on("close", function() {
    console.log("close");
  });
  
  // 对方发送了关闭数据包过来的事件
  sock.on("end", function() {
    console.log("end event");
  });
  
  // 当有数据发生的时候，调用;
  sock.on("data", function(data) {
    console.log(data);
  });

  ctx.body = 'hi'
})

//错误页面
router.get('/error_page', async (ctx)=>{
  await ctx.render('error', {});
})

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

module.exports = router