# 完整修复方案 - 微信登录问题

## 问题诊断

1. **后端数据库连接失败**
   - 错误：`Access denied for user 'root'@'localhost' (using password: NO)`
   - 原因：后端配置文件指定了密码(123456)，但启动时没有正确传递

2. **前端登录报错"参数不对"**
   - 原因：虽然参数格式看起来正确，但后端可能没有正常运行

## 解决方案

### 方案一：修复MySQL连接（推荐）

#### 1. 确保MySQL正在运行
```bash
# macOS 上启动 MySQL
brew services start mysql

# 或者如果通过DMG安装
sudo /usr/local/mysql/support-files/mysql.server start
```

#### 2. 设置MySQL root密码
```bash
# 登录MySQL（如果没有密码）
mysql -u root

# 或者（如果有密码）
mysql -u root -p

# 在MySQL中执行
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. 创建数据库
```bash
mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS yeslocker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 4. 重新启动后端
```bash
cd /Users/liasiloam/项目开发/杆柜管理/yeslocker

# 停止现有进程
ps aux | grep java | grep litemall | awk '{print $2}' | xargs kill -9 2>/dev/null

# 使用正确的密码启动
java -jar litemall-all/target/litemall-all-0.1.0-exec.jar \
  --spring.profiles.active=dev \
  --spring.datasource.druid.password=123456
```

### 方案二：使用模拟登录（快速测试）

#### 1. 修改前端使用测试登录

在 `profile.vue` 中添加测试登录方法：

```javascript
async goToTestLogin() {
  try {
    uni.showLoading({ title: '登录中...', mask: true })
    
    // 模拟登录数据
    const mockLoginData = {
      token: 'test-token-' + Date.now(),
      userInfo: {
        userId: 1,
        nickName: '测试用户',
        avatarUrl: '/static/default-avatar.png',
        phoneNumber: '13800138000',
        isVerified: false,
        createTime: new Date().toISOString()
      }
    }
    
    // 保存到本地
    uni.setStorageSync('token', mockLoginData.token)
    uni.setStorageSync('userInfo', mockLoginData.userInfo)
    
    this.userInfo = mockLoginData.userInfo
    this.isLoggedIn = true
    
    uni.hideLoading()
    uni.showToast({ title: '测试登录成功', icon: 'success' })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}
```

### 方案三：使用Mock服务器（无需数据库）

创建一个简单的mock服务器：

```javascript
// mock-server.js
const express = require('express')
const app = express()
app.use(express.json())

// 模拟登录接口
app.post('/wx/auth/login_by_weixin', (req, res) => {
  const { code, userInfo } = req.body
  
  if (!code || !userInfo) {
    return res.json({
      errno: 501,
      errmsg: '参数不对'
    })
  }
  
  res.json({
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'mock-token-' + Date.now(),
      userInfo: {
        ...userInfo,
        userId: 1,
        openId: 'mock-openid-' + code,
        sessionKey: 'mock-session-key'
      }
    }
  })
})

app.listen(8080, () => {
  console.log('Mock server running on http://localhost:8080')
})
```

## 立即可用的快速修复

### 1. 添加防抖和错误处理

```javascript
data() {
  return {
    // ... 其他数据
    isLoggingIn: false  // 防止重复点击
  }
},

methods: {
  async handleWeChatLogin() {
    if (this.isLoggingIn) return
    this.isLoggingIn = true
    
    try {
      // ... 登录逻辑
    } catch (error) {
      console.error('登录失败:', error)
      // 更友好的错误提示
      if (error.errMsg?.includes('fail url not in domain list')) {
        uni.showModal({
          title: '提示',
          content: '请在微信开发者工具中勾选"不校验合法域名"选项',
          showCancel: false
        })
      }
    } finally {
      this.isLoggingIn = false
    }
  }
}
```

### 2. 临时跳过后端验证

在开发环境中，可以修改 `src/config/api.js`：

```javascript
// 开发环境配置
if (isDev) {
  // 使用测试服务器或mock数据
  return 'https://yeslocker-test.free.beeceptor.com'  // 免费的mock服务
}
```

## 验证步骤

1. **检查后端状态**
   ```bash
   curl http://localhost:8080/wx/auth/info
   ```
   如果返回404或其他HTTP状态码，说明后端正在运行

2. **测试登录接口**
   ```bash
   curl -X POST http://localhost:8080/wx/auth/login_by_weixin \
     -H "Content-Type: application/json" \
     -d '{"code":"test","userInfo":{"nickName":"Test"}}'
   ```

3. **在小程序中测试**
   - 使用"测试登录"按钮
   - 或者点击"微信快速登录"（确保已勾选域名校验）

## 长期解决方案

1. **配置数据库连接池**
   - 使用连接池避免连接超时
   - 配置重试机制

2. **添加健康检查接口**
   ```java
   @GetMapping("/health")
   public Object health() {
     return ResponseUtil.ok("Service is running");
   }
   ```

3. **使用环境变量管理密码**
   ```bash
   export DB_PASSWORD=123456
   java -jar app.jar --spring.datasource.password=${DB_PASSWORD}
   ```

## 总结

最快的解决方案是：
1. 使用测试登录按钮绕过微信授权
2. 或者确保MySQL正在运行并且密码设置为123456
3. 重启后端服务并确保域名校验已关闭