const path = require('path')

module.exports = {
  transpileDependencies: ['@dcloudio/uni-ui'],
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  chainWebpack: config => {
    // 确保环境变量被正确加载
    const envPath = process.env.NODE_ENV === 'production' 
      ? '.env.production' 
      : '.env.development'
    
    require('dotenv').config({ path: envPath })
    
    // 将环境变量注入到 DefinePlugin
    config.plugin('define').tap(args => {
      args[0]['process.env'].VUE_APP_BASE_API = JSON.stringify(process.env.VUE_APP_BASE_API)
      args[0]['process.env'].VUE_APP_TITLE = JSON.stringify(process.env.VUE_APP_TITLE)
      return args
    })
  }
}