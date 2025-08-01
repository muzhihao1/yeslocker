#!/bin/bash
# 耶氏台球杆存取系统 - 快速部署脚本
# 适用于 Ubuntu 20.04 LTS
# 使用前请先修改配置变量

set -e  # 遇到错误立即退出

# ========================================
# 配置变量（请根据实际情况修改）
# ========================================
DOMAIN="your-domain.com"                    # 你的域名
MYSQL_ROOT_PASSWORD="root_password_here"    # MySQL root密码
MYSQL_APP_PASSWORD="app_password_here"      # 应用数据库密码
ADMIN_EMAIL="admin@example.com"             # 管理员邮箱
WX_APP_ID="your_wx_app_id"                  # 微信小程序AppID
WX_APP_SECRET="your_wx_app_secret"          # 微信小程序AppSecret

# 目录配置
DEPLOY_DIR="/opt/litemall"
ADMIN_DIR="/var/www/litemall-admin"
SOURCE_DIR="/home/deploy/yeslocker"

# ========================================
# 颜色输出
# ========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# ========================================
# 检查是否为root用户
# ========================================
if [[ $EUID -ne 0 ]]; then
   error "此脚本必须以root权限运行"
fi

# ========================================
# 检查配置
# ========================================
info "检查配置..."
if [[ "$DOMAIN" == "your-domain.com" ]]; then
    error "请先修改脚本中的配置变量！"
fi

# ========================================
# 更新系统
# ========================================
info "更新系统包..."
apt update && apt upgrade -y

# ========================================
# 安装基础软件
# ========================================
info "安装基础软件..."
apt install -y curl wget git vim unzip

# ========================================
# 安装JDK 8
# ========================================
info "安装JDK 8..."
apt install -y openjdk-8-jdk
java -version

# ========================================
# 安装MySQL 8.0
# ========================================
info "安装MySQL 8.0..."
apt install -y mysql-server

# 配置MySQL
info "配置MySQL..."
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';"
mysql -u root -p${MYSQL_ROOT_PASSWORD} <<EOF
CREATE DATABASE IF NOT EXISTS litemall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'litemall'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
GRANT ALL PRIVILEGES ON litemall.* TO 'litemall'@'localhost';
FLUSH PRIVILEGES;
EOF

# ========================================
# 安装Nginx
# ========================================
info "安装Nginx..."
apt install -y nginx

# ========================================
# 安装Node.js
# ========================================
info "安装Node.js 14.x..."
curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
apt install -y nodejs

# ========================================
# 安装Maven
# ========================================
info "安装Maven..."
apt install -y maven

# ========================================
# 创建应用用户和目录
# ========================================
info "创建应用用户和目录..."
useradd -r -s /bin/false litemall || true
mkdir -p ${DEPLOY_DIR}/{logs,storage}
mkdir -p ${ADMIN_DIR}
chown -R litemall:litemall ${DEPLOY_DIR}

# ========================================
# 导入数据库
# ========================================
info "导入数据库..."
if [ -d "${SOURCE_DIR}" ]; then
    cd ${SOURCE_DIR}
    mysql -u litemall -p${MYSQL_APP_PASSWORD} litemall < sql/litemall_schema.sql || warn "Schema可能已存在"
    mysql -u litemall -p${MYSQL_APP_PASSWORD} litemall < sql/litemall_table.sql || warn "Table可能已存在"
    mysql -u litemall -p${MYSQL_APP_PASSWORD} litemall < sql/litemall_data.sql || warn "Data可能已存在"
    mysql -u litemall -p${MYSQL_APP_PASSWORD} litemall < sql/locker-extension.sql || warn "Locker extension可能已存在"
    mysql -u litemall -p${MYSQL_APP_PASSWORD} litemall < sql/locker-new-flow.sql || warn "Locker new flow可能已存在"
else
    warn "源代码目录不存在，请手动导入数据库"
fi

# ========================================
# 创建应用配置文件
# ========================================
info "创建应用配置文件..."
cat > ${DEPLOY_DIR}/application.yml <<EOF
spring:
  profiles:
    active: prod
  datasource:
    druid:
      url: jdbc:mysql://localhost:3306/litemall?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false
      username: litemall
      password: ${MYSQL_APP_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      initial-size: 10
      max-active: 50
      min-idle: 10
      max-wait: 60000

server:
  port: 8080

logging:
  level:
    root: INFO
    org.linlinjava.litemall: INFO
  file:
    path: ${DEPLOY_DIR}/logs

litemall:
  wx:
    app-id: ${WX_APP_ID}
    app-secret: ${WX_APP_SECRET}
    mch-id: 
    mch-key: 
    notify-url: https://${DOMAIN}/wx/order/pay-notify

  storage:
    active: local
    local:
      storagePath: ${DEPLOY_DIR}/storage
      address: https://${DOMAIN}/wx/storage/fetch/

  mall:
    name: "耶氏体育台球杆存取"
    address: "您的地址"
    phone: "您的电话"
EOF

# ========================================
# 创建Systemd服务
# ========================================
info "创建Systemd服务..."
cat > /etc/systemd/system/litemall.service <<EOF
[Unit]
Description=Litemall Spring Boot Application
After=syslog.target network.target mysql.service

[Service]
Type=simple
User=litemall
Group=litemall
WorkingDirectory=${DEPLOY_DIR}
ExecStart=/usr/bin/java -Xms512m -Xmx2048m -jar ${DEPLOY_DIR}/litemall.jar --spring.config.location=${DEPLOY_DIR}/application.yml
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=litemall

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

# ========================================
# 配置Nginx
# ========================================
info "配置Nginx..."
cat > /etc/nginx/sites-available/litemall <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    access_log /var/log/nginx/litemall.access.log;
    error_log /var/log/nginx/litemall.error.log;
    
    # 管理后台
    location / {
        root ${ADMIN_DIR};
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }
    
    # 后端API代理
    location /wx/ {
        proxy_pass http://localhost:8080/wx/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 50m;
    }
    
    location /admin/ {
        proxy_pass http://localhost:8080/admin/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/litemall /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# ========================================
# 配置防火墙
# ========================================
info "配置防火墙..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp
ufw --force enable

# ========================================
# 安装SSL证书（可选）
# ========================================
info "安装Certbot..."
apt install -y certbot python3-certbot-nginx

warn "请手动运行以下命令申请SSL证书："
echo "certbot --nginx -d ${DOMAIN} --email ${ADMIN_EMAIL} --agree-tos --non-interactive"

# ========================================
# 创建健康检查脚本
# ========================================
info "创建健康检查脚本..."
cat > ${DEPLOY_DIR}/check_health.sh <<'EOF'
#!/bin/bash

# 检查后端服务
if ! systemctl is-active --quiet litemall; then
    echo "$(date): Litemall service is down! Restarting..."
    systemctl start litemall
fi

# 检查API健康
if ! curl -f -s http://localhost:8080/wx/home/index > /dev/null; then
    echo "$(date): API is not responding! Restarting..."
    systemctl restart litemall
fi
EOF

chmod +x ${DEPLOY_DIR}/check_health.sh

# 添加到crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * ${DEPLOY_DIR}/check_health.sh >> ${DEPLOY_DIR}/logs/health_check.log 2>&1") | crontab -

# ========================================
# 创建备份脚本
# ========================================
info "创建备份脚本..."
mkdir -p /backup/litemall
cat > /backup/litemall/backup.sh <<EOF
#!/bin/bash
BACKUP_DIR="/backup/litemall"
DATE=\$(date +%Y%m%d_%H%M%S)

# 备份数据库
mysqldump -u litemall -p${MYSQL_APP_PASSWORD} litemall > \${BACKUP_DIR}/litemall_\${DATE}.sql

# 压缩备份文件
gzip \${BACKUP_DIR}/litemall_\${DATE}.sql

# 删除7天前的备份
find \${BACKUP_DIR} -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: litemall_\${DATE}.sql.gz"
EOF

chmod +x /backup/litemall/backup.sh

# 添加到crontab（每天凌晨2点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /backup/litemall/backup.sh >> /backup/litemall/backup.log 2>&1") | crontab -

# ========================================
# 完成提示
# ========================================
echo ""
echo "========================================="
echo -e "${GREEN}基础环境部署完成！${NC}"
echo "========================================="
echo ""
echo "接下来需要手动完成的步骤："
echo ""
echo "1. 上传编译好的JAR包到："
echo "   ${DEPLOY_DIR}/litemall.jar"
echo ""
echo "2. 上传管理后台文件到："
echo "   ${ADMIN_DIR}/"
echo ""
echo "3. 启动后端服务："
echo "   systemctl start litemall"
echo "   systemctl enable litemall"
echo ""
echo "4. 申请SSL证书："
echo "   certbot --nginx -d ${DOMAIN} --email ${ADMIN_EMAIL} --agree-tos --non-interactive"
echo ""
echo "5. 在微信公众平台配置服务器域名："
echo "   https://${DOMAIN}"
echo ""
echo "6. 测试访问："
echo "   http://${DOMAIN}"
echo "   http://${DOMAIN}/admin/index/index"
echo ""
echo "默认管理员账号：admin123 / admin123"
echo "请立即登录修改密码！"
echo ""
echo "========================================="