#!/bin/bash

# 启动多店铺储物柜管理系统
echo "=== 启动耶氏体育储物柜管理系统 ==="
echo ""

# 检查是否已经编译
if [ ! -f "litemall-all/target/litemall-all-0.1.0-exec.jar" ]; then
    echo "项目尚未编译，正在编译..."
    cd litemall-all
    mvn clean package -DskipTests
    cd ..
fi

# 启动后端服务
echo "1. 启动后端服务 (端口 8080)..."
cd litemall-all
nohup java -jar target/litemall-all-0.1.0-exec.jar > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端服务已启动，PID: $BACKEND_PID"
cd ..

# 等待后端启动
echo "   等待后端服务启动..."
sleep 10

# 检查后端是否启动成功
if curl -s http://localhost:8080/admin/auth/info > /dev/null 2>&1; then
    echo "   ✅ 后端服务启动成功！"
else
    echo "   ❌ 后端服务启动失败，请检查 backend.log"
    exit 1
fi

# 启动前端服务
echo ""
echo "2. 启动前端服务 (端口 9527)..."
cd litemall-admin
npm install --registry=https://registry.npmmirror.com
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   前端服务已启动，PID: $FRONTEND_PID"
cd ..

# 等待前端启动
echo "   等待前端服务启动..."
sleep 15

echo ""
echo "=== 服务启动完成 ==="
echo ""
echo "访问地址："
echo "- 管理后台: http://localhost:9527"
echo "- 后端API: http://localhost:8080"
echo ""
echo "默认管理员账号："
echo "- 用户名: admin123"
echo "- 密码: admin123"
echo ""
echo "功能测试："
echo "1. 储物柜管理 -> 门店管理"
echo "2. 储物柜管理 -> 储物柜列表"
echo "3. 储物柜管理 -> 操作记录"
echo ""
echo "停止服务："
echo "kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "查看日志："
echo "- 后端日志: tail -f backend.log"
echo "- 前端日志: tail -f frontend.log"