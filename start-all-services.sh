#!/bin/bash

# 一键启动所有服务脚本
# Start all services for YesLocker system

echo "=== 启动 YesLocker 所有服务 ==="

# 检查并启动MySQL
echo "1. 检查MySQL服务..."
if ! mysql -u root -p123456 -e "SELECT 1" >/dev/null 2>&1; then
    echo "❌ MySQL未运行或密码错误"
    echo "   请确保MySQL已启动，默认密码: 123456"
    echo "   启动MySQL: brew services start mysql"
    exit 1
else
    echo "✅ MySQL正在运行"
fi

# 初始化数据库（如果需要）
echo -e "\n2. 检查数据库..."
if ! mysql -u root -p123456 -e "USE litemall" 2>/dev/null; then
    echo "   数据库不存在，正在初始化..."
    cd "$(dirname "$0")"
    ./scripts/setup-database.sh
else
    echo "✅ 数据库已存在"
fi

# 启动后端服务
echo -e "\n3. 启动后端服务..."
cd "$(dirname "$0")"
if lsof -i:8080 >/dev/null 2>&1; then
    echo "✅ 后端已在8080端口运行"
else
    echo "   正在启动后端..."
    # 在后台启动后端
    nohup ./start-backend.sh > backend.log 2>&1 &
    echo "   等待后端启动..."
    sleep 5
    
    # 检查是否启动成功
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/wx/auth/info | grep -q "200\|404"; then
        echo "✅ 后端启动成功"
    else
        echo "❌ 后端启动失败，请查看 backend.log"
        exit 1
    fi
fi

# 启动小程序开发服务
echo -e "\n4. 启动小程序开发服务..."
cd "$(dirname "$0")/yeslocker-uniapp"

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "   安装依赖..."
    npm install
fi

echo "   正在构建小程序..."
npm run dev:mp-weixin &

# 给出使用说明
echo -e "\n=== 服务启动完成 ==="
echo "✅ MySQL数据库: 运行中"
echo "✅ 后端服务: http://localhost:8080"
echo "✅ 小程序构建: 运行中"
echo ""
echo "=== 下一步操作 ==="
echo "1. 打开微信开发者工具"
echo "2. 导入项目目录: $(pwd)/dist/dev/mp-weixin"
echo "3. 在工具中勾选'不校验合法域名'选项"
echo "4. 开始测试登录功能"
echo ""
echo "提示: 使用 Ctrl+C 停止所有服务"
echo ""
echo "查看后端日志: tail -f $(dirname "$0")/backend.log"
echo "查看前端构建: 查看当前终端输出"

# 等待用户中断
wait