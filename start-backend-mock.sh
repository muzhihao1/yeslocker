#!/bin/bash

# 启动后端服务（开发模式 + Mock模式）
# Start backend service with development profile and Mock mode enabled

echo "🚀 启动耶氏台球杆存取系统后端（Mock模式）..."
echo "📝 Mock模式说明："
echo "   - 无需真实微信认证"
echo "   - 支持多种测试用户场景"
echo "   - 访问 http://localhost:8080/wx/auth/mock-users 查看可用测试用户"
echo ""

# 检查 Java 环境
if ! command -v java &> /dev/null; then
    echo "❌ 错误：未找到 Java 环境"
    echo "请先安装 Java 17："
    echo "brew install openjdk@17"
    exit 1
fi

# 检查是否已编译
JAR_FILE="litemall-all/target/litemall-all-0.1.0-exec.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo "⚠️  未找到编译后的 JAR 文件，正在编译..."
    mvn clean package -DskipTests
    
    if [ $? -ne 0 ]; then
        echo "❌ 编译失败，请检查错误信息"
        exit 1
    fi
fi

# 设置环境变量
export SPRING_PROFILES_ACTIVE=dev

echo ""
echo "🔧 Mock模式已启用"
echo "📌 测试用户代码："
echo "   - test-new-user-001      : 新用户（未认证）"
echo "   - test-verified-user-001 : 已认证用户"
echo "   - test-active-storage-001: 有存储的用户"
echo "   - test-vip-user-001      : VIP会员"
echo "   - test-admin-001         : 管理员"
echo ""
echo "🌐 服务地址："
echo "   - 后端 API: http://localhost:8080"
echo "   - Mock用户列表: http://localhost:8080/wx/auth/mock-users"
echo ""
echo "按 Ctrl+C 停止服务"
echo "----------------------------------------"

# 启动服务
cd litemall-all
java -Dfile.encoding=UTF-8 \
     -Dspring.profiles.active=dev \
     -Dlitemall.wx.mock-mode=true \
     -jar target/litemall-all-0.1.0-exec.jar