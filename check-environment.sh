#!/bin/bash

# 环境检查脚本

echo "🔍 检查耶氏后端环境..."
echo "========================="

# 检查Java
echo -n "☕ Java: "
if command -v java &> /dev/null; then
    java -version 2>&1 | head -n 1
else
    echo "❌ 未安装"
fi

# 检查Maven
echo -n "📦 Maven: "
if command -v mvn &> /dev/null; then
    mvn -version | head -n 1
else
    echo "❌ 未安装"
fi

# 检查MySQL
echo -n "🗄️  MySQL: "
if command -v mysql &> /dev/null; then
    mysql --version
else
    echo "❌ 未安装"
fi

# 检查Redis
echo -n "⚡ Redis: "
if command -v redis-server &> /dev/null; then
    redis-server --version
else
    echo "❌ 未安装"
fi

# 检查项目构建状态
echo ""
echo "📁 项目构建状态："
JAR_FILE=$(find litemall-all/target -name "litemall-all-*-exec.jar" 2>/dev/null | head -1)
if [ -f "$JAR_FILE" ]; then
    echo "✅ 已编译 - $JAR_FILE"
else
    echo "❌ 未编译 - 请运行 mvn clean package"
fi

# 检查数据库连接
echo ""
echo "🔗 数据库连接测试："
echo -n "   请输入MySQL root密码: "
read -s MYSQL_PASSWORD
echo ""

if mysql -uroot -p${MYSQL_PASSWORD} -e "SELECT 1" &> /dev/null; then
    echo "✅ MySQL连接成功"
    
    # 检查数据库是否存在
    if mysql -uroot -p${MYSQL_PASSWORD} -e "USE yeslocker" &> /dev/null; then
        echo "✅ 数据库 yeslocker 已存在"
        
        # 检查储物柜表
        TABLE_COUNT=$(mysql -uroot -p${MYSQL_PASSWORD} yeslocker -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='yeslocker' AND table_name LIKE 'litemall_locker%'")
        echo "✅ 储物柜相关表数量：$TABLE_COUNT"
    else
        echo "⚠️  数据库 yeslocker 不存在 - 请运行 ./scripts/setup-database.sh"
    fi
else
    echo "❌ MySQL连接失败"
fi

# 检查Redis连接
echo ""
echo "🔗 Redis连接测试："
if redis-cli ping &> /dev/null; then
    echo "✅ Redis连接成功"
else
    echo "❌ Redis连接失败 - 请确保Redis服务正在运行"
fi

echo ""
echo "========================="
echo "检查完成！"
echo ""

# 提供下一步建议
if [ ! -f "$JAR_FILE" ]; then
    echo "👉 下一步：运行 mvn clean package 编译项目"
elif ! mysql -uroot -p${MYSQL_PASSWORD} -e "USE yeslocker" &> /dev/null; then
    echo "👉 下一步：运行 ./scripts/setup-database.sh 设置数据库"
else
    echo "👉 环境已就绪！运行 ./start-backend.sh 启动后端服务"
fi