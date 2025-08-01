#!/bin/bash

# 启动后端服务（带模拟数据库）
# Start backend with mock database for testing

echo "=== 启动后端服务（模拟模式）==="

cd "$(dirname "$0")"

# 查找JAR文件
JAR_FILE="litemall-all/target/litemall-all-0.1.0-exec.jar"

if [ ! -f "$JAR_FILE" ]; then
    echo "❌ JAR文件不存在: $JAR_FILE"
    echo "   请先运行: mvn clean package -DskipTests"
    exit 1
fi

echo "✅ 找到JAR文件: $JAR_FILE"

# 使用H2内存数据库启动（无需MySQL）
echo "📝 使用H2内存数据库模式启动..."

# 启动服务，使用H2数据库
java -jar "$JAR_FILE" \
    --spring.datasource.druid.url=jdbc:h2:mem:testdb \
    --spring.datasource.druid.driver-class-name=org.h2.Driver \
    --spring.datasource.druid.username=sa \
    --spring.datasource.druid.password= \
    --spring.h2.console.enabled=true \
    --spring.jpa.database-platform=org.hibernate.dialect.H2Dialect \
    --spring.profiles.active=dev,mock

echo "服务已停止"