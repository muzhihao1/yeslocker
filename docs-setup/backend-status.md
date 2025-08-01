# 后端服务状态 ✅

## 服务已成功启动！

### 当前状态
- **服务地址**: http://localhost:8080
- **进程 ID**: 31941
- **启动时间**: 2025-07-23 09:31 AM
- **日志文件**: backend.log

### 服务端点
- 管理后台: http://localhost:8080/admin/index.html
- 微信 API: http://localhost:8080/wx/
- 管理 API: http://localhost:8080/admin/
- 健康检查: http://localhost:8080/wx/auth/info

### 验证服务运行
```bash
# 检查服务状态
curl http://localhost:8080/wx/auth/info

# 应返回：
# {
#   "errno": 501,
#   "errmsg": "请登录"
# }
```

### 管理后台登录
- 访问: http://localhost:8080/admin/index.html
- 默认账号: admin123
- 默认密码: admin123

### 查看日志
```bash
# 实时查看日志
tail -f backend.log

# 查看最近100行日志
tail -n 100 backend.log
```

### 停止服务
```bash
# 方法1：使用进程ID
kill 31941

# 方法2：查找并停止
ps aux | grep litemall | grep java
kill <PID>
```

### 重启服务
```bash
# 停止当前服务
kill 31941

# 重新启动
./start-backend-now.sh

# 或在后台启动
nohup java -Dfile.encoding=UTF-8 -jar litemall-all/target/litemall-all-0.1.0-exec.jar --spring.profiles.active=dev,core-dev,db,wx,admin > backend.log 2>&1 &
```

### 下一步
1. 在微信开发者工具中勾选"不校验合法域名"
2. 重新编译小程序项目
3. 测试登录功能

## 注意事项
- 确保 MySQL 和 Redis 服务保持运行
- 如果修改了后端代码，需要重新编译：`mvn clean package -DskipTests`
- 生产环境需要配置 HTTPS 和域名白名单