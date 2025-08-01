#!/bin/bash

# 耶氏台球杆存取系统 - macOS 后端环境自动配置脚本
# 使用方法: chmod +x setup-backend-mac.sh && ./setup-backend-mac.sh

set -e  # 遇到错误立即退出

echo "🚀 开始配置耶氏台球杆存取系统后端环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓ $1 已安装${NC}"
        return 0
    else
        echo -e "${RED}✗ $1 未安装${NC}"
        return 1
    fi
}

# 1. 检查 Homebrew
echo "📦 检查 Homebrew..."
if ! check_command brew; then
    echo "正在安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# 2. 安装 Java
echo -e "\n☕ 检查 Java 环境..."
if ! check_command java; then
    echo "正在安装 OpenJDK 11..."
    brew install openjdk@11
    echo 'export PATH="/usr/local/opt/openjdk@11/bin:$PATH"' >> ~/.zshrc
    export PATH="/usr/local/opt/openjdk@11/bin:$PATH"
else
    java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo -e "${GREEN}Java 版本: $java_version${NC}"
fi

# 3. 安装 Maven
echo -e "\n🔨 检查 Maven..."
if ! check_command mvn; then
    echo "正在安装 Maven..."
    brew install maven
else
    mvn_version=$(mvn -version | head -n 1)
    echo -e "${GREEN}$mvn_version${NC}"
fi

# 4. 安装 MySQL
echo -e "\n🗄️  检查 MySQL..."
if ! check_command mysql; then
    echo "正在安装 MySQL 8.0..."
    brew install mysql@8.0
    brew services start mysql@8.0
    echo -e "${YELLOW}请运行 mysql_secure_installation 进行安全配置${NC}"
else
    mysql_version=$(mysql --version | cut -d' ' -f6)
    echo -e "${GREEN}MySQL 版本: $mysql_version${NC}"
fi

# 5. 安装 Redis
echo -e "\n💾 检查 Redis..."
if ! check_command redis-cli; then
    echo "正在安装 Redis..."
    brew install redis
    brew services start redis
else
    redis_version=$(redis-cli --version | cut -d' ' -f2)
    echo -e "${GREEN}Redis 版本: $redis_version${NC}"
fi

# 6. 创建数据库
echo -e "\n🗄️  配置数据库..."
echo -e "${YELLOW}请输入 MySQL root 密码：${NC}"
read -s mysql_root_password

mysql -u root -p$mysql_root_password <<EOF 2>/dev/null || echo -e "${RED}数据库配置失败，请手动执行${NC}"
CREATE DATABASE IF NOT EXISTS yeslocker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'yeslocker'@'localhost' IDENTIFIED BY 'yeslocker123456';
GRANT ALL PRIVILEGES ON yeslocker.* TO 'yeslocker'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库创建成功${NC}"
fi

# 7. 导入数据库表结构
echo -e "\n📊 导入数据库表结构..."
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -f "$PROJECT_DIR/litemall-db/sql/litemall_schema.sql" ]; then
    echo "正在导入 Litemall 基础表..."
    mysql -u yeslocker -pyeslocker123456 yeslocker < "$PROJECT_DIR/litemall-db/sql/litemall_schema.sql" 2>/dev/null
    mysql -u yeslocker -pyeslocker123456 yeslocker < "$PROJECT_DIR/litemall-db/sql/litemall_table.sql" 2>/dev/null
    mysql -u yeslocker -pyeslocker123456 yeslocker < "$PROJECT_DIR/litemall-db/sql/litemall_data.sql" 2>/dev/null
    echo -e "${GREEN}✓ Litemall 基础表导入成功${NC}"
fi

if [ -f "$PROJECT_DIR/sql/locker-extension.sql" ]; then
    echo "正在导入储物柜扩展表..."
    mysql -u yeslocker -pyeslocker123456 yeslocker < "$PROJECT_DIR/sql/locker-extension.sql" 2>/dev/null
    echo -e "${GREEN}✓ 储物柜扩展表导入成功${NC}"
fi

# 8. 创建 Maven 配置
echo -e "\n⚙️  配置 Maven..."
mkdir -p ~/.m2
cat > ~/.m2/settings.xml <<EOF
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
EOF
echo -e "${GREEN}✓ Maven 阿里云镜像配置成功${NC}"

# 9. 编译项目
echo -e "\n🔧 编译项目..."
cd "$PROJECT_DIR"
mvn clean install -DskipTests

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 项目编译成功${NC}"
else
    echo -e "${RED}✗ 项目编译失败${NC}"
    exit 1
fi

# 10. 创建启动脚本
echo -e "\n📝 创建启动脚本..."
cat > "$PROJECT_DIR/start-backend.sh" <<EOF
#!/bin/bash
cd "$PROJECT_DIR"
java -Dfile.encoding=UTF-8 -jar litemall-all/target/litemall-all-*-exec.jar --spring.profiles.active=dev
EOF
chmod +x "$PROJECT_DIR/start-backend.sh"

# 完成提示
echo -e "\n${GREEN}🎉 后端环境配置完成！${NC}"
echo -e "\n下一步操作："
echo -e "1. 运行 ${YELLOW}./start-backend.sh${NC} 启动后端服务"
echo -e "2. 访问 ${YELLOW}http://localhost:8080/admin/index.html${NC} 查看管理后台"
echo -e "3. 默认管理员账号: ${YELLOW}admin123${NC} 密码: ${YELLOW}admin123${NC}"
echo -e "4. 编辑 ${YELLOW}litemall-all/src/main/resources/application-dev.yml${NC} 配置微信小程序信息"
echo -e "\n${YELLOW}注意：请确保 MySQL 和 Redis 服务已启动${NC}"
echo -e "查看服务状态: ${YELLOW}brew services list${NC}"