#!/bin/bash

echo "🚀 启动真实的Spring Boot后端服务..."
echo ""

# 停止当前的Mock服务器
echo "📋 停止Mock服务器..."
MOCK_PID=$(ps aux | grep "simple-admin-server.js" | grep -v grep | awk '{print $2}')
if [ ! -z "$MOCK_PID" ]; then
    kill $MOCK_PID
    echo "✓ 已停止Mock服务器 PID: $MOCK_PID"
fi

# 停止旧的Java进程
echo "📋 停止旧的后端服务..."
JAVA_PID=$(ps aux | grep "litemall-all.*\.jar" | grep -v grep | awk '{print $2}')
if [ ! -z "$JAVA_PID" ]; then
    kill $JAVA_PID
    echo "✓ 已停止进程 PID: $JAVA_PID"
    sleep 2
fi

# 检查数据库连接
echo ""
echo "🔍 检查MySQL数据库连接..."
/opt/homebrew/opt/mysql@8.0/bin/mysql -u root -p123456 -e "SELECT 1" yeslocker > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ 数据库连接正常"
else
    echo "✗ 数据库连接失败，请检查MySQL服务"
    exit 1
fi

# 使用已存在的JAR文件启动（跳过构建）
echo ""
echo "📦 使用现有JAR文件启动..."
cd /Users/liasiloam/Vibecoding/杆柜管理/yeslocker

# 设置JVM参数避免反射警告
export JAVA_OPTS="--illegal-access=permit --add-opens java.base/java.lang=ALL-UNNAMED"

# 启动服务，禁用有问题的自动配置
nohup java $JAVA_OPTS -Dfile.encoding=UTF-8 \
    -Dspring.autoconfigure.exclude=org.linlinjava.litemall.core.storage.config.StorageAutoConfiguration,org.linlinjava.litemall.core.notify.config.NotifyAutoConfiguration \
    -jar litemall-all/target/litemall-all-0.1.0-exec.jar \
    --spring.profiles.active=dev > backend-real.log 2>&1 &

echo "等待服务启动..."
sleep 15

# 验证服务
echo ""
echo "🔍 验证服务状态..."
if curl -s http://localhost:8080/wx/auth/info | grep -q "errno"; then
    echo "✓ API服务正常"
else
    echo "✗ API服务异常，查看日志：tail -f backend-real.log"
    exit 1
fi

# 检查管理后台
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/admin/index.html)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✓ 管理后台可访问"
else
    echo "✗ 管理后台无法访问 (HTTP $HTTP_STATUS)"
fi

# 获取新的PID
NEW_PID=$(ps aux | grep "litemall-all.*\.jar" | grep -v grep | awk '{print $2}')

echo ""
echo "=========================================="
echo "🎉 真实后端服务已启动！"
echo ""
echo "服务信息："
echo "- 进程 ID: $NEW_PID"
echo "- API 地址: http://localhost:8080/wx/"
echo "- 管理后台: http://localhost:8080/admin/index.html"
echo "- 日志文件: backend-real.log"
echo ""
echo "管理员账号："
echo "- 用户名: admin123"
echo "- 密码: admin123"
echo ""
echo "查看日志: tail -f backend-real.log"
echo "查看错误: grep ERROR backend-real.log"
echo "=========================================="