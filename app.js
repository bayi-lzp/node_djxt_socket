
const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const koaBody = require('koa-body');
const logger = require('koa-logger')
// const render = require('koa-art-template');
const views = require('koa-views');
const path = require('path')


// render(app, {
//     root: path.join(__dirname, 'views'),
//     extname: '.html',
//     debug: process.env.NODE_ENV !== 'production',
//     imports: {
//     //   ...utils.moduleFuns,//模板工具类
//     }
// });
app.use(views(__dirname + '/views', {
    // map: {
    //   html: 'underscore'
    // }
}));

//静态资源
app.use(require('koa-static')(__dirname + '../assets', {
    hidden: true,
    gzip: true,
  }))

onerror(app)

// logger
app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(koaBody({
    multipart: true,  // 允许上传多个文件
    formidable: { 
      // uploadDir: 'public/images',// 上传的文件存储的路径 
      keepExtensions: true  //  保存图片的扩展名
    }
}));
  
app.use(json())
app.use(logger())

//路由
const routers = require('./router/')

Object.keys(routers).forEach(key=>{
    let r = require(routers[key])

    app.use(r.routes(), r.allowedMethods())
})

// response

//   app.use(async ctx => {
//     ctx.body = 'Hello';
//   });

module.exports = app