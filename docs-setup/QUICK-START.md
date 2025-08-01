# 🚀 耶氏台球杆存取系统 - 快速启动指南

## 前置条件确认 ✅
- Java 11 已安装
- Maven 已安装  
- MySQL 8.0 已运行
- Redis 已运行

## 步骤 1: 设置数据库

```bash
# 1. 运行数据库设置脚本
cd /Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker
./scripts/setup-database.sh

# 2. 输入MySQL root密码
# 脚本会自动：
# - 创建 yeslocker 数据库
# - 导入 Litemall 基础表
# - 导入储物柜扩展表  
# - 导入测试数据（40个储物柜）
```

## 步骤 2: 修改配置文件

编辑 `litemall-all/src/main/resources/application-dev.yml`：

```yaml
spring:
  datasource:
    druid:
      password: 你的MySQL密码  # 修改这里
```

## 步骤 3: 启动后端服务

```bash
# 使用启动脚本
./start-backend.sh

# 或手动启动
java -Dfile.encoding=UTF-8 -jar litemall-all/target/litemall-all-*-exec.jar --spring.profiles.active=dev
```

## 步骤 4: 验证服务

### 4.1 检查服务健康状态
```bash
curl http://localhost:8080/wx/home/index
```

### 4.2 查看可用储物柜
```bash
curl http://localhost:8080/wx/locker/available
```

### 4.3 访问管理后台
- 地址: http://localhost:8080/admin/index.html
- 账号: admin123 / admin123
- 储物柜管理员: locker_admin / locker123

## 常见问题

### Q: 数据库连接失败
```bash
# 检查MySQL是否运行
mysql -uroot -p -e "SELECT 1"

# 检查数据库是否创建
mysql -uroot -p -e "SHOW DATABASES LIKE 'yeslocker'"
```

### Q: 端口被占用
```bash
# 查看8080端口占用
lsof -i :8080

# 修改端口（编辑application-dev.yml）
server:
  port: 8081
```

### Q: Redis连接失败
```bash
# 检查Redis是否运行
redis-cli ping

# 启动Redis
redis-server
```

## 后端API测试

### 1. 模拟微信登录
```bash
curl -X POST http://localhost:8080/wx/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code", "userInfo": {"nickName": "测试用户", "avatarUrl": ""}}'
```

### 2. 存储球杆（需要先登录获取token）
```bash
curl -X POST http://localhost:8080/wx/locker/store \
  -H "Content-Type: application/json" \
  -H "X-Litemall-Token: YOUR_TOKEN" \
  -d '{"lockerId": 1, "notes": "测试存储"}'
```

## 下一步

1. **前端集成**: Terminal B 可以开始对接真实API
2. **功能测试**: 完整测试存储和取回流程
3. **部署准备**: 配置生产环境参数

---

💡 **提示**: 运行 `./check-environment.sh` 可以随时检查环境状态