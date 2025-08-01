# 🔧 微信小程序问题修复指南

## 问题总结

1. ✅ **权限配置警告** - 可以忽略（基础库兼容性问题）
2. ✅ **图片资源缺失** - 已通过占位图片解决
3. ⚠️ **微信登录失败** - 需要使用测试登录页面

## 问题1：权限配置警告

### 错误信息
```
无效的 app.json permission["scope.camera"]
```

### 解决方案
这是微信开发者工具的基础库版本兼容性问题，不影响功能使用。可以：
- 忽略此警告
- 或在"详情" → "本地设置"中切换基础库版本

## 问题2：图片资源缺失

### 错误信息
```
Failed to load local image resource /static/empty-locker.png
```

### 解决方案
已通过创建占位图片解决：

```bash
# 已执行的命令
./create-placeholder-images.sh

# 重新编译项目
cd yeslocker-uniapp
npm run dev:mp-weixin
```

## 问题3：微信登录失败 ⭐️

### 错误信息
```
getUserProfile:fail can only be invoked by user TAP gesture
```

### 原因分析
从2021年4月起，微信调整了小程序获取用户信息的规则：
- `getUserProfile` 必须通过用户点击按钮触发
- 不能在页面加载时自动调用
- 开发环境也受此限制

### 🎯 开发环境解决方案

#### 方法1：使用测试登录页面（推荐）

1. 在"编译模式"中添加新的编译模式：
   - 名称：测试登录
   - 页面路径：`pages/test/login`
   - 启动参数：留空

2. 或直接在页面路径输入框输入：
   ```
   pages/test/login
   ```

3. 使用测试账号登录：
   - 普通用户：`user123 / user123`
   - 管理员：`admin123 / admin123`

#### 方法2：临时修改个人中心页面

在 `pages/user/index.vue` 中添加测试登录入口：

```vue
<!-- 在未登录状态的按钮组下方添加 -->
<button 
  class="btn test-login-btn" 
  @click="goToTestLogin"
  v-if="!isLogin"
>
  开发环境测试登录
</button>

<script>
methods: {
  goToTestLogin() {
    uni.navigateTo({
      url: '/pages/test/login'
    })
  }
}
</script>
```

### 🚀 生产环境解决方案

需要修改 `utils/wechat.js` 的登录实现，改为按钮触发模式：

```javascript
// 修改 pages/user/profile.vue 的登录按钮
<button 
  class="btn wx-login-btn"
  open-type="getUserInfo"
  @getuserinfo="onGetUserInfo"
>
  <text class="btn-icon">🔑</text>
  <text class="btn-text">微信快速登录</text>
</button>

// 处理函数
methods: {
  async onGetUserInfo(e) {
    if (e.detail.userInfo) {
      // 用户同意授权
      await this.doWechatLogin(e.detail)
    } else {
      // 用户拒绝授权
      uni.showToast({
        title: '需要授权才能登录',
        icon: 'none'
      })
    }
  }
}
```

## 快速测试流程

1. **重新编译项目**（如果修改了代码）
   ```bash
   cd yeslocker-uniapp
   npm run dev:mp-weixin
   ```

2. **在微信开发者工具中刷新**
   - 点击"编译"按钮
   - 或使用快捷键 Cmd+R (Mac) / Ctrl+R (Windows)

3. **使用测试登录**
   - 直接访问：`pages/test/login`
   - 使用测试账号登录

4. **测试核心功能**
   - 存储流程
   - 取回流程
   - 会员功能

## 其他注意事项

### 开发环境配置
- ✅ 已关闭域名校验（urlCheck: false）
- ✅ 后端服务运行正常（http://localhost:8080）
- ✅ 静态资源已创建占位文件

### 常见问题
1. **页面白屏**：检查 Console 是否有错误
2. **网络请求失败**：确认后端服务是否运行
3. **扫码功能**：开发环境使用输入框代替

### 真机测试
- 点击"预览"生成二维码
- 使用真实微信扫码测试
- 注意：真机测试时微信登录功能正常

---

💡 **提示**：开发阶段推荐使用测试登录页面，避免微信授权的限制。