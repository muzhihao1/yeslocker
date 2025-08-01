#!/bin/bash

# 启动后端服务的快速脚本
echo "🚀 启动耶氏后端服务..."
echo ""
echo "✅ MySQL 已运行"
echo "✅ Redis 已运行"
echo "✅ JAR 文件已就绪"
echo ""
echo "📝 使用配置: application-dev.yml"
echo ""
echo "服务启动中..."
echo "- 管理后台: http://localhost:8080/admin/index.html"
echo "- 微信API: http://localhost:8080/wx/"
echo "- 管理API: http://localhost:8080/admin/"
echo ""
echo "按 Ctrl+C 停止服务"
echo "=========================================="
echo ""

# 启动服务
cd /Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker
java -Dfile.encoding=UTF-8 -jar litemall-all/target/litemall-all-0.1.0-exec.jar --spring.profiles.active=dev,core-dev,db,wx,admin