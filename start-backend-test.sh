#!/bin/bash

# 测试启动脚本 - 使用正确的数据库名称
echo "=== 启动后端服务（测试模式）==="

cd "$(dirname "$0")"

# 设置MySQL路径
export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"

# 检查数据库连接
echo "检查数据库连接..."
if mysql -u root -p123456 -e "USE litemall;" 2>/dev/null; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败，尝试创建..."
    mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS litemall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi

# 启动后端
JAR_FILE="litemall-all/target/litemall-all-0.1.0-exec.jar"

if [ ! -f "$JAR_FILE" ]; then
    echo "❌ JAR文件不存在，需要先编译"
    echo "运行: mvn clean package -DskipTests"
    exit 1
fi

echo "启动后端服务..."
echo "数据库: litemall"
echo "用户名: root"
echo "密码: 123456"

# 使用litemall数据库（而不是yeslocker）
java -jar "$JAR_FILE" \
    --spring.profiles.active=dev \
    --spring.datasource.druid.url="jdbc:mysql://localhost:3306/litemall?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&verifyServerCertificate=false&useSSL=false" \
    --spring.datasource.druid.username=root \
    --spring.datasource.druid.password=123456 \
    --logging.level.org.linlinjava.litemall=DEBUG