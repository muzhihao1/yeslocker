# 修复微信小程序 600009 错误指南

## 错误说明

错误码 `errno: 600009` 和错误信息 `errMsg: "request:fail invalid url"` 表示微信小程序无法识别或访问您提供的URL。

## 错误原因

1. **URL格式不正确**：使用了相对路径而非完整的URL
2. **域名未配置**：生产环境中，域名未在微信小程序后台配置
3. **后端服务未启动**：本地开发时后端服务没有运行
4. **协议错误**：生产环境必须使用HTTPS，不能使用HTTP

## 解决方案

### 1. 开发环境设置

在微信开发者工具中：
1. 打开项目设置
2. 勾选 **"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"**
3. 这样可以在开发时使用 `http://localhost:8080` 等本地地址

### 2. 启动后端服务

确保Litemall后端服务正在运行：

```bash
# 进入后端目录
cd yeslocker

# 构建项目
mvn clean install

# 运行服务
java -jar litemall-all/target/litemall-all-*-exec.jar
```

默认情况下，后端会在 `http://localhost:8080` 启动。

### 3. 配置API地址

#### 方法一：修改环境变量文件

编辑 `.env.development` 文件：
```env
VUE_APP_BASE_API=http://localhost:8080
```

如果使用局域网IP访问（手机真机调试）：
```env
VUE_APP_BASE_API=http://192.168.1.100:8080
```

#### 方法二：直接修改配置文件

编辑 `src/config/api.js`，在 `getBaseURL()` 函数中修改返回值：

```javascript
// 开发环境
if (isDev) {
  return 'http://localhost:8080'  // 修改为您的后端地址
}
```

### 4. 生产环境配置

1. **配置HTTPS域名**
   - 部署后端服务到服务器
   - 配置SSL证书，使用HTTPS协议
   - 例如：`https://api.yeslocker.com`

2. **在微信小程序后台添加域名**
   - 登录 [微信公众平台](https://mp.weixin.qq.com)
   - 进入小程序管理后台
   - 开发 → 开发设置 → 服务器域名
   - 在 "request合法域名" 中添加您的API域名

3. **更新生产环境配置**
   
   编辑 `.env.production`：
   ```env
   VUE_APP_BASE_API=https://api.yeslocker.com
   ```

## 调试技巧

1. **查看控制台日志**
   - 代码中已添加日志输出，可以看到实际请求的URL
   - 检查URL格式是否正确

2. **使用内网穿透工具**
   
   如果需要在真机上调试，可以使用内网穿透：
   ```bash
   # 安装 ngrok
   brew install ngrok  # macOS
   
   # 启动穿透
   ngrok http 8080
   ```
   
   然后使用ngrok提供的HTTPS地址。

3. **检查网络请求**
   - 在微信开发者工具的 Network 面板查看请求详情
   - 确认请求URL、参数是否正确

## 常见问题

### Q: 提示"不在以下 request 合法域名列表中"
A: 开发时勾选"不校验合法域名"；生产环境必须添加域名到小程序后台。

### Q: 本地localhost无法访问
A: 确保后端服务已启动，可以在浏览器中访问 `http://localhost:8080` 验证。

### Q: 真机调试无法访问localhost
A: 使用电脑的局域网IP地址替代localhost，或使用内网穿透工具。

### Q: 依然报600009错误
A: 检查：
1. URL是否包含完整协议（http://或https://）
2. 是否有多余的空格或特殊字符
3. 后端服务是否正常响应

## 快速检查清单

- [ ] 后端服务已启动
- [ ] 开发工具已勾选"不校验合法域名"
- [ ] API地址格式正确（完整URL）
- [ ] 网络连接正常
- [ ] 生产环境已配置HTTPS和域名白名单