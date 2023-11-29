const path = require('path')
const resolve = dir => {
  return path.join(__dirname, dir)
}
const devServer = {
  port:80,
  proxy:{
    '/api':{
      changeOrigin:true,
      target: `http://${process.env["VUE_APP_PROXY"]}`,
      // target: `http://192.168.1.14:8001`, 
      pathRewrite:{
        '^/api':''
      }
    },
  },
  overlay: {
    warnings: false,
    errors: true
  },
  
};

// mock请求代理 开发环境启用 
// if(process.env.NODE_ENV === 'development' && process.env.VUE_APP_MOCK_STATUS === "OPEN") {
//   devServer.before = require('./mock/mock-server.js');
//   devServer.proxy[process.env.VUE_APP_MOCK_API] = {
//     changeOrigin:true,
//     target: `http://localhost:80`,
//     pathRewrite:{
//       ['^' + process.env.VUE_APP_MOCK_API]: ''
//     }
//   };
// }

module.exports = {
  // productionSourceMap:false,
  // parallel: !process.env.NODE_ENV === 'production',
  parallel: false,
  publicPath: './',
  chainWebpack: config => {
    config.resolve.alias
      .set('_c', resolve('src/components')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('devtool', 'source-map')
  },
  devServer,
  pages:{
    // index: createPage('src','index', '首页'),
    // map: createPage('src/views/maptwo', 'maptwo', '车间地图')
    index: {
      // page 的入口
      entry: 'src/main.js',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'IGV控制台',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
  }
}
