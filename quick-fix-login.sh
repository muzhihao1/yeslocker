#!/bin/bash

# 快速修复微信小程序登录问题脚本
# Quick fix for WeChat Mini Program login issues

echo "=== 修复微信小程序登录问题 ==="

# 1. 创建缺失的静态资源
echo "1. 创建缺失的 storage-intro.png..."
cd "$(dirname "$0")/yeslocker-uniapp/src/static"
if [ ! -f "storage-intro.png" ]; then
    cp empty-locker.png storage-intro.png
    echo "✅ storage-intro.png 已创建"
else
    echo "✅ storage-intro.png 已存在"
fi

# 2. 检查后端状态
echo -e "\n2. 检查后端服务状态..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/wx/auth/info | grep -q "000"; then
    echo "❌ 后端服务未运行"
    echo "   请在新的终端窗口运行以下命令启动后端："
    echo "   cd $(dirname "$0")"
    echo "   ./start-backend.sh"
else
    echo "✅ 后端服务正在运行"
fi

# 3. 提示开发者工具设置
echo -e "\n3. 微信开发者工具设置提醒："
echo "   请在微信开发者工具中："
echo "   1) 点击右上角'详情'按钮"
echo "   2) 选择'本地设置'标签"
echo "   3) 勾选'不校验合法域名...'选项"
echo "   4) 重新编译项目"

# 4. 检查数据库连接
echo -e "\n4. 检查数据库状态..."
if mysql -u root -p123456 -e "SELECT 1" >/dev/null 2>&1; then
    echo "✅ MySQL 数据库可连接"
else
    echo "❌ MySQL 数据库连接失败"
    echo "   请确保MySQL正在运行并且密码正确"
    echo "   默认连接: mysql -u root -p123456"
fi

# 5. 提供快速启动命令
echo -e "\n=== 快速启动命令 ==="
echo "# 启动后端服务:"
echo "cd $(dirname "$0") && ./start-backend.sh"
echo ""
echo "# 启动小程序开发服务:"
echo "cd $(dirname "$0")/yeslocker-uniapp && npm run dev:mp-weixin"
echo ""
echo "# 然后在微信开发者工具中导入 dist/dev/mp-weixin 目录"

echo -e "\n✅ 修复脚本执行完成！"