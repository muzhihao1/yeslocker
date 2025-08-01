#!/bin/bash

# 耶氏台球杆存取小程序 - 快速启动脚本

echo "========================================="
echo "耶氏台球杆存取小程序 - 快速启动"
echo "========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

echo ""
echo "🚀 正在编译微信小程序..."
echo ""

# 运行开发编译
npm run dev:mp-weixin &

# 保存进程ID
PID=$!

echo ""
echo "========================================="
echo "✅ 编译已启动！"
echo "========================================="
echo ""
echo "📱 请按以下步骤查看小程序："
echo ""
echo "1. 打开微信开发者工具"
echo "2. 选择'导入项目'"
echo "3. 项目目录选择："
echo "   $(pwd)/dist/dev/mp-weixin"
echo "4. 使用测试 AppID 或输入真实 AppID"
echo "5. 点击'导入'即可查看"
echo ""
echo "💡 提示：编译会持续监听文件变化，按 Ctrl+C 停止"
echo ""
echo "========================================="

# 等待进程
wait $PID