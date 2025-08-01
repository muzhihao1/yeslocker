#!/bin/bash

echo "🔧 构建管理后台并重启服务..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 项目根目录
PROJECT_DIR="/Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker"
cd "$PROJECT_DIR"

# 1. 停止当前运行的后端服务
echo "📋 停止当前后端服务..."
JAVA_PID=$(ps aux | grep "litemall-all.*\.jar" | grep -v grep | awk '{print $2}')
if [ ! -z "$JAVA_PID" ]; then
    kill $JAVA_PID
    echo -e "${GREEN}✓ 已停止进程 PID: $JAVA_PID${NC}"
    sleep 2
else
    echo -e "${YELLOW}⚠ 未发现运行中的后端服务${NC}"
fi

# 2. 构建管理后台
echo ""
echo "🎨 构建管理后台..."
cd "$PROJECT_DIR/litemall-admin"

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "安装依赖包..."
    npm install
fi

# 构建前端
echo "编译前端资源..."
npm run build

if [ -d "dist" ]; then
    echo -e "${GREEN}✓ 管理后台构建成功${NC}"
else
    echo -e "${YELLOW}✗ 管理后台构建失败${NC}"
    exit 1
fi

# 3. 重新编译后端（包含前端资源）
echo ""
echo "📦 重新编译后端项目..."
cd "$PROJECT_DIR"
/opt/homebrew/bin/mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 后端编译成功${NC}"
else
    echo -e "${YELLOW}✗ 后端编译失败${NC}"
    exit 1
fi

# 4. 启动后端服务
echo ""
echo "🚀 启动后端服务..."
nohup java -Dfile.encoding=UTF-8 -jar litemall-all/target/litemall-all-0.1.0-exec.jar --spring.profiles.active=dev,core-dev,db,wx,admin > backend.log 2>&1 &

# 等待服务启动
echo "等待服务启动..."
sleep 8

# 5. 验证服务
echo ""
echo "🔍 验证服务状态..."
if curl -s http://localhost:8080/wx/auth/info | grep -q "errno"; then
    echo -e "${GREEN}✓ API服务正常${NC}"
else
    echo -e "${YELLOW}✗ API服务异常${NC}"
fi

# 检查管理后台
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/admin/index.html)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ 管理后台可访问${NC}"
else
    echo -e "${YELLOW}✗ 管理后台无法访问 (HTTP $HTTP_STATUS)${NC}"
fi

# 获取新的PID
NEW_PID=$(ps aux | grep "litemall-all.*\.jar" | grep -v grep | awk '{print $2}')

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 服务已成功启动！${NC}"
echo ""
echo "服务信息："
echo "- 进程 ID: $NEW_PID"
echo "- API 地址: http://localhost:8080/wx/"
echo "- 管理后台: http://localhost:8080/admin/index.html"
echo "- 日志文件: backend.log"
echo ""
echo "管理员账号："
echo "- 用户名: admin123"
echo "- 密码: admin123"
echo ""
echo "查看日志: tail -f backend.log"
echo "停止服务: kill $NEW_PID"
echo "=========================================="