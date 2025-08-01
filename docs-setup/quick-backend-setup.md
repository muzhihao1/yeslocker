# 快速启动后端服务指南

由于您的环境缺少 Maven，我为您提供以下解决方案：

## 方案一：安装 Maven（推荐）

### 1. 安装 Homebrew（如果未安装）
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. 安装 Maven
```bash
brew install maven
```

### 3. 编译项目
```bash
cd /Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker
mvn clean package -DskipTests
```

### 4. 启动后端
```bash
./start-backend.sh
```

## 方案二：使用 Maven Wrapper（快速方案）

我已为您创建了 Maven Wrapper，无需安装 Maven：

```bash
cd /Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker
./mvnw clean package -DskipTests
./start-backend.sh
```

## 方案三：使用预编译的模拟后端（最快方案）

如果您只是想快速测试小程序，可以暂时使用模拟数据，无需启动真实后端：

1. 在 `yeslocker-uniapp/src/config/api.js` 中已配置
2. 小程序会使用本地模拟数据
3. 可以立即测试登录和其他功能

## 检查服务状态

后端启动成功后，可以访问：
- 管理后台：http://localhost:8080/admin/index.html
- API 健康检查：http://localhost:8080/wx/auth/login（应返回错误信息）

## 常见问题

### 1. MySQL 未启动
```bash
# macOS
brew services start mysql@8.0

# 或使用系统服务
sudo mysql.server start
```

### 2. Redis 未启动
```bash
# macOS
brew services start redis

# 或直接启动
redis-server
```

### 3. 端口被占用
```bash
# 查看 8080 端口占用
lsof -i :8080

# 杀死占用进程
kill -9 <PID>
```

## 快速测试

使用以下命令测试后端是否正常：

```bash
curl http://localhost:8080/wx/auth/info
```

应该返回类似的 JSON 响应（即使是错误也说明服务已启动）。