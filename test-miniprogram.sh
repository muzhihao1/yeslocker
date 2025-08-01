#!/bin/bash

# 耶氏台球杆存取系统 - 微信小程序测试启动脚本

echo "🚀 启动微信小程序测试环境..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查后端服务是否运行
check_backend() {
    echo "📡 检查后端服务状态..."
    if curl -s http://localhost:8080/wx/home/index > /dev/null; then
        echo -e "${GREEN}✅ 后端服务运行正常${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
        return 1
    fi
}

# 启动后端服务
start_backend() {
    echo "🔧 启动后端服务..."
    cd "$(dirname "$0")"
    
    if [ -f "./start-backend.sh" ]; then
        echo "执行 ./start-backend.sh"
        ./start-backend.sh &
        BACKEND_PID=$!
        echo "后端服务PID: $BACKEND_PID"
        echo "等待服务启动..."
        sleep 10
    else
        echo -e "${RED}❌ 找不到 start-backend.sh${NC}"
        exit 1
    fi
}

# 编译微信小程序
compile_miniprogram() {
    echo ""
    echo "📦 编译微信小程序..."
    cd yeslocker-uniapp
    
    # 检查是否已安装依赖
    if [ ! -d "node_modules" ]; then
        echo "📥 安装项目依赖..."
        npm install
    fi
    
    # 启动编译
    echo "🔨 开始编译（开发模式）..."
    npm run dev:mp-weixin &
    COMPILE_PID=$!
    echo "编译进程PID: $COMPILE_PID"
    
    # 等待编译完成
    echo "等待初次编译完成..."
    sleep 8
}

# 显示使用说明
show_instructions() {
    echo ""
    echo "✨ ======================================== ✨"
    echo -e "${GREEN}微信小程序测试环境已准备就绪！${NC}"
    echo ""
    echo "📱 接下来请按以下步骤操作："
    echo ""
    echo "1. 打开微信开发者工具"
    echo "2. 导入项目，选择目录："
    echo -e "   ${YELLOW}$(pwd)/yeslocker-uniapp/dist/dev/mp-weixin${NC}"
    echo "3. AppID 可以使用测试号或留空"
    echo "4. 导入后即可在模拟器中测试"
    echo ""
    echo "💡 测试账号："
    echo "   普通用户：user123 / user123"
    echo "   管理员：admin123 / admin123"
    echo ""
    echo "📖 详细指南请查看："
    echo -e "   ${YELLOW}WECHAT-MINIPROGRAM-TEST-GUIDE.md${NC}"
    echo ""
    echo "🛑 停止服务："
    echo "   按 Ctrl+C 停止编译监听"
    echo "   后端服务会在后台运行，可通过 ps 查看并手动停止"
    echo "✨ ======================================== ✨"
}

# 主流程
main() {
    echo "=========================================="
    echo "   耶氏台球杆存取系统 - 微信小程序测试"
    echo "=========================================="
    echo ""
    
    # 1. 检查并启动后端
    if ! check_backend; then
        start_backend
        sleep 5
        if ! check_backend; then
            echo -e "${RED}❌ 后端服务启动失败${NC}"
            exit 1
        fi
    fi
    
    # 2. 编译微信小程序
    compile_miniprogram
    
    # 3. 显示使用说明
    show_instructions
    
    # 4. 保持脚本运行
    echo ""
    echo "📡 编译监听中... (按 Ctrl+C 停止)"
    wait $COMPILE_PID
}

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ ! -z "$COMPILE_PID" ]; then
        kill $COMPILE_PID 2>/dev/null
    fi
    echo "✅ 编译进程已停止"
    echo ""
    echo "⚠️  注意：后端服务仍在运行，如需停止请执行："
    echo "   ps aux | grep java"
    echo "   kill <PID>"
    exit 0
}

# 设置信号处理
trap cleanup INT TERM

# 执行主流程
main