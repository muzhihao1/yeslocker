# 管理后台 404 问题解决方案

## 🔍 问题分析

### 当前状态
- ✅ **后端 API 正常运行** - http://localhost:8080/wx/auth/info 返回正确响应
- ❌ **管理后台无法访问** - /admin/index.html 返回 404

### 原因
管理后台的前端文件（litemall-admin）还未构建，所以没有被打包进 JAR 文件中。

## 🚀 解决方案

### 方案一：继续开发小程序（推荐）
由于 API 已经正常工作，您可以直接继续开发和测试小程序功能：

1. **API 已就绪**：所有微信小程序需要的 API 端点都可以正常访问
2. **登录功能可用**：现在可以测试微信登录功能
3. **无需管理后台**：小程序开发不依赖管理后台

**立即测试**：
- 在微信开发者工具中重新编译小程序
- 确保勾选"不校验合法域名"
- 测试登录和其他功能

### 方案二：构建完整的管理后台
如果您需要使用管理后台，运行以下命令：

```bash
# 运行自动构建脚本
./build-and-restart.sh
```

这个脚本会：
1. 停止当前服务
2. 构建管理后台前端（需要 3-5 分钟）
3. 重新打包后端服务
4. 自动重启服务

**注意**：首次构建需要下载大量 npm 依赖，可能需要较长时间。

## 📋 快速验证

### 验证 API 是否正常
```bash
# 测试认证接口
curl http://localhost:8080/wx/auth/info

# 测试其他接口
curl http://localhost:8080/wx/home/index
```

### 小程序端配置确认
确保 `yeslocker-uniapp/src/config/api.js` 中的地址为：
```javascript
baseURL: 'http://localhost:8080'
```

## 🎯 建议

1. **先测试小程序功能** - API 已经可用，可以立即开始测试
2. **后台管理稍后处理** - 如果需要查看数据，可以：
   - 使用 MySQL 客户端直接查看数据库
   - 使用 Postman 等工具调用管理 API
   - 在空闲时间运行构建脚本

## 🔧 手动构建步骤（可选）

如果自动脚本有问题，可以手动执行：

```bash
# 1. 构建管理后台
cd litemall-admin
npm install
npm run build

# 2. 重新编译后端
cd ..
mvn clean package -DskipTests

# 3. 重启服务
kill $(ps aux | grep litemall | grep java | awk '{print $2}')
nohup java -jar litemall-all/target/litemall-all-0.1.0-exec.jar --spring.profiles.active=dev > backend.log 2>&1 &
```