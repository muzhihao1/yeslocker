# 微信小程序登录问题完整解决方案

## 问题汇总

1. **域名校验错误**: `http://localhost:8080 不在以下 request 合法域名列表中`
2. **静态资源缺失**: `/static/storage-intro.png` 返回 500 错误
3. **getUserProfile频繁调用**: 提示 `invoke wx.getUserProfile too frequently`
4. **后端服务未启动**: 无法连接到 `http://localhost:8080`

## 立即修复步骤

### 步骤1：启动后端服务

```bash
# 1. 确保MySQL已启动并创建数据库
cd /Users/liasiloam/项目开发/杆柜管理/yeslocker
./scripts/setup-database.sh

# 2. 启动后端服务
./start-backend.sh

# 3. 验证后端是否正常运行
curl http://localhost:8080/wx/auth/info
```

### 步骤2：修复静态资源（已完成）

缺失的 `storage-intro.png` 文件已创建。如果还有其他缺失的文件，运行：

```bash
cd /Users/liasiloam/项目开发/杆柜管理/yeslocker
./quick-fix-login.sh
```

### 步骤3：微信开发者工具设置

1. 打开微信开发者工具
2. 点击右上角"详情"按钮
3. 选择"本地设置"标签
4. **必须勾选**：
   - ✅ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
   - ✅ 不校验小程序代码编译和自动热重载时的文件校验
5. 重新编译项目

### 步骤4：解决getUserProfile频繁调用

这个问题通常是因为：
1. 多次点击登录按钮
2. 登录函数被重复调用

**解决方法**：

在 `profile.vue` 中添加防抖机制：

```javascript
data() {
  return {
    // ... 其他数据
    isLoggingIn: false  // 添加登录状态标志
  }
},

methods: {
  async handleWeChatLogin() {
    // 防止重复点击
    if (this.isLoggingIn) {
      return
    }
    this.isLoggingIn = true
    
    try {
      // ... 原有的登录逻辑
    } catch (error) {
      // ... 错误处理
    } finally {
      this.isLoggingIn = false
    }
  }
}
```

## 开发环境配置建议

### 方案A：使用局域网IP（推荐）

1. 获取本机局域网IP：
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# 例如获得：192.168.1.100
```

2. 修改 `src/config/api.js`：
```javascript
// 开发环境使用局域网IP
if (isDev) {
  return 'http://192.168.1.100:8080'  // 替换为你的IP
}
```

3. 确保手机和电脑在同一网络

### 方案B：使用内网穿透

1. 安装 ngrok：
```bash
brew install ngrok
```

2. 启动内网穿透：
```bash
ngrok http 8080
```

3. 获得类似 `https://xxx.ngrok.io` 的临时域名

4. 更新配置使用该域名

## 测试登录流程

1. 确保后端服务正在运行
2. 在微信开发者工具中打开小程序
3. 点击"个人中心"标签
4. 点击"微信快速登录"按钮
5. 同意授权
6. 查看是否登录成功

## 常见问题排查

### 1. 仍然提示域名错误
- 确认已勾选"不校验合法域名"
- 重启微信开发者工具
- 清除缓存并重新编译

### 2. 后端连接失败
- 检查后端是否启动：`ps aux | grep java`
- 查看后端日志：`tail -f yeslocker/logs/log.log`
- 确认数据库连接正常

### 3. getUserProfile仍然频繁调用
- 检查是否有多个地方调用登录
- 添加全局登录状态管理
- 使用 Vuex 统一管理登录流程

### 4. 登录成功但无法保持状态
- 检查 token 是否正确保存
- 验证后端 JWT 配置
- 确认请求时携带了 token

## 生产环境准备

1. **申请小程序AppID**
   - 登录 https://mp.weixin.qq.com/
   - 创建小程序获取真实 AppID

2. **配置服务器域名**
   - 在小程序后台配置 request 合法域名
   - 必须使用 HTTPS 协议
   - 不能使用 IP 地址或非标准端口

3. **部署后端到云服务器**
   - 获取域名并配置 SSL 证书
   - 部署后端服务
   - 更新小程序中的 API 地址

## 开发提示

1. 使用"测试登录"按钮可以跳过微信授权进行开发
2. 开发时建议使用局域网IP而不是 localhost
3. 定期检查微信开发者工具的更新
4. 保持后端服务日志开启以便调试

## 相关文件

- 配置文件：`/src/config/api.js`
- 登录页面：`/src/pages/user/profile.vue`
- 登录工具：`/src/utils/wechat.js`
- 后端启动：`./start-backend.sh`
- 快速修复：`./quick-fix-login.sh`