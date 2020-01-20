const router = require('koa-router')()

router.prefix('/djxt')

//首页
router.get(['/', '/index.html'], async (ctx, next) => {
  await ctx.render('index', {
    // user: 'John'
  });
})
router.get('/test', async (ctx, next) => {
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
  try {
    if (sockArr.length <= 0) {
      ctx.body = {
        data: '',
        success: false,
        msg: '设备未连接'
      }
      return
    }
    sockArr.forEach((item, index) => {
      sockArr[index] && sockArr[index].write( params.id );
    })
    ctx.body = {
      data: params,
      success: true,
      msg: ''
    }
  } catch (e) {
    ctx.body = {
      data: e,
      success: false,
      msg: '异常'
    }
  }
})

module.exports = router
