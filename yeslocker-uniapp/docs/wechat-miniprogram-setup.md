# 微信小程序开发配置指南

## 前置要求

1. **微信开发者工具**
   - 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - 选择稳定版下载

2. **微信小程序账号**
   - 注册地址：https://mp.weixin.qq.com/
   - 需要完成认证才能使用完整功能

3. **Node.js 环境**
   - 版本要求：Node.js >= 12.0.0
   - npm >= 6.0.0

## 项目配置

### 1. 获取 AppID

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发"->"开发设置"
3. 复制 AppID
4. 更新以下文件中的 AppID：
   - `manifest.json` → `mp-weixin.appid`
   - `project.config.json` → `appid`

### 2. 安装依赖

```bash
cd yeslocker-uniapp
npm install
```

### 3. 编译项目

```bash
# 开发环境编译
npm run dev:mp-weixin

# 生产环境编译
npm run build:mp-weixin
```

编译后的文件位于：`dist/dev/mp-weixin/` 或 `dist/build/mp-weixin/`

### 4. 导入微信开发者工具

1. 打开微信开发者工具
2. 选择"小程序项目"
3. 点击"+"创建新项目或导入项目
4. 项目配置：
   - **项目名称**：耶氏台球杆存取
   - **目录**：选择 `dist/dev/mp-weixin/` 文件夹
   - **AppID**：填入你的 AppID
   - **开发模式**：选择"小程序"
   - **后端服务**：选择"不使用云服务"

## 开发配置

### 1. 服务器域名配置

在微信公众平台配置合法域名：

1. 登录微信公众平台
2. 进入"开发"->"开发设置"->"服务器域名"
3. 配置以下域名：

```
request合法域名：
https://api.yeslocker.com
https://yeslocker.com

uploadFile合法域名：
https://upload.yeslocker.com
https://up-z2.qiniup.com

downloadFile合法域名：
https://cdn.yeslocker.com
https://static.yeslocker.com
```

### 2. 开发环境设置

在开发阶段，可以在微信开发者工具中：

1. 点击"详情"标签
2. 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
3. 这样可以使用本地服务器进行调试

### 3. 权限配置

项目已配置以下权限：

- **scope.userInfo**：获取用户信息
- **scope.userLocation**：获取位置信息
- **scope.camera**：使用相机扫码

使用时需要先申请权限：

```javascript
// 示例：申请相机权限
uni.authorize({
  scope: 'scope.camera',
  success() {
    // 用户已授权
    uni.scanCode({
      success: (res) => {
        console.log('扫码结果：', res.result)
      }
    })
  },
  fail() {
    // 用户拒绝授权
    uni.showModal({
      title: '提示',
      content: '需要相机权限才能扫码',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          uni.openSetting()
        }
      }
    })
  }
})
```

## 开发注意事项

### 1. API 差异

UniApp 会自动处理大部分 API 差异，但仍需注意：

```javascript
// 条件编译示例
// #ifdef MP-WEIXIN
wx.login({
  success: (res) => {
    // 微信小程序专用代码
  }
})
// #endif

// #ifndef MP-WEIXIN
// 非微信小程序代码
// #endif
```

### 2. 组件差异

某些组件在微信小程序中有特殊要求：

- `<button>` 组件的 `open-type` 属性
- `<navigator>` 组件的跳转限制
- 自定义组件的命名规范

### 3. 文件大小限制

- 单个分包大小不超过 2MB
- 整个小程序所有分包大小不超过 20MB
- 单次上传代码包不超过 20MB

### 4. 性能优化

1. **分包加载**
   ```json
   // pages.json
   {
     "subPackages": [{
       "root": "pagesA",
       "pages": [
         "list/index",
         "detail/index"
       ]
     }]
   }
   ```

2. **组件懒加载**
   ```javascript
   export default {
     components: {
       MyComponent: () => import('@/components/MyComponent.vue')
     }
   }
   ```

3. **图片优化**
   - 使用 WebP 格式
   - 使用 CDN 加速
   - 按需加载

## 调试技巧

### 1. 真机调试

1. 在微信开发者工具点击"预览"
2. 使用微信扫描二维码
3. 在手机上查看效果

### 2. 远程调试

1. 点击"真机调试"
2. 扫码连接手机
3. 可以看到手机端的 console 输出

### 3. 性能分析

1. 使用"调试器"中的"Performance"面板
2. 查看页面加载时间
3. 优化渲染性能

### 4. 体验评分

1. 使用"调试器"中的"体验评分"
2. 根据建议优化代码
3. 提高小程序质量

## 发布流程

### 1. 上传代码

1. 在微信开发者工具点击"上传"
2. 填写版本号和项目备注
3. 上传成功后在微信公众平台查看

### 2. 提交审核

1. 登录微信公众平台
2. 进入"版本管理"
3. 选择开发版本，点击"提交审核"
4. 填写相关信息

### 3. 发布上线

1. 审核通过后
2. 在"版本管理"中点击"发布"
3. 小程序正式上线

## 常见问题

### Q1: 提示"未找到入口 app.json 文件"

A: 确保导入的是编译后的 `dist/dev/mp-weixin/` 目录，而不是源码目录。

### Q2: 网络请求失败

A: 检查是否配置了合法域名，开发阶段可以关闭域名校验。

### Q3: 扫码功能无法使用

A: 确保已申请相机权限，真机才能测试扫码功能。

### Q4: 样式显示异常

A: 检查是否使用了小程序不支持的 CSS 属性，使用 rpx 单位确保响应式。

### Q5: 页面栈超过 10 层

A: 使用 `uni.redirectTo` 或 `uni.reLaunch` 替代 `uni.navigateTo`。

## 相关资源

- [UniApp 文档](https://uniapp.dcloud.io/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信开发者社区](https://developers.weixin.qq.com/community/develop/question)
- [UniApp 插件市场](https://ext.dcloud.net.cn/)