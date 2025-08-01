# 耶氏台球杆存取系统 - 生产环境部署指南

本文档提供详细的生产环境部署步骤，适合没有太多部署经验的人员按步骤操作。

## 目录

1. [部署前准备](#1-部署前准备)
2. [服务器环境准备](#2-服务器环境准备)
3. [数据库部署](#3-数据库部署)
4. [后端服务部署](#4-后端服务部署)
5. [管理后台部署](#5-管理后台部署)
6. [小程序部署](#6-小程序部署)
7. [域名与SSL配置](#7-域名与ssl配置)
8. [部署后验证](#8-部署后验证)
9. [常见问题](#9-常见问题)

## 1. 部署前准备

### 1.1 服务器要求

最低配置：
- CPU: 2核
- 内存: 4GB
- 存储: 40GB SSD
- 带宽: 5Mbps
- 操作系统: Ubuntu 20.04 LTS 或 CentOS 7.x

推荐配置：
- CPU: 4核
- 内存: 8GB
- 存储: 100GB SSD
- 带宽: 10Mbps
- 操作系统: Ubuntu 20.04 LTS

### 1.2 需要准备的资源

1. **云服务器**
   - 推荐：阿里云ECS、腾讯云CVM
   - 需要有固定公网IP

2. **域名**
   - 一个已备案的域名（国内服务器必须）
   - 示例：yeslocker.example.com

3. **SSL证书**
   - 可申请免费证书（Let's Encrypt）
   - 或购买商业证书

4. **微信小程序账号**
   - 企业认证的小程序账号
   - AppID 和 AppSecret

5. **对象存储（可选）**
   - 阿里云OSS或腾讯云COS
   - 用于存储用户上传的图片

### 1.3 需要的软件版本

- JDK: 1.8
- MySQL: 8.0
- Nginx: 1.18+
- Node.js: 14.x（用于编译前端）
- Maven: 3.6+（用于编译后端）

## 2. 服务器环境准备

### 2.1 登录服务器

```bash
# 使用SSH登录服务器
ssh root@your-server-ip
```

### 2.2 更新系统

```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

### 2.3 安装基础软件

#### Ubuntu系统

```bash
# 安装必要的工具
sudo apt install -y curl wget git vim unzip

# 安装JDK 8
sudo apt install -y openjdk-8-jdk

# 安装MySQL 8.0
sudo apt install -y mysql-server

# 安装Nginx
sudo apt install -y nginx

# 安装Node.js 14.x
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs

# 安装Maven
sudo apt install -y maven
```

#### CentOS系统

```bash
# 安装必要的工具
sudo yum install -y curl wget git vim unzip

# 安装JDK 8
sudo yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel

# 安装MySQL 8.0
sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
sudo yum install -y mysql-community-server

# 安装Nginx
sudo yum install -y nginx

# 安装Node.js 14.x
curl -fsSL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs

# 安装Maven
sudo yum install -y maven
```

### 2.4 验证安装

```bash
# 验证Java
java -version
# 应显示: openjdk version "1.8.0_xxx"

# 验证MySQL
mysql --version
# 应显示: mysql Ver 8.0.xx

# 验证Nginx
nginx -v
# 应显示: nginx version: nginx/1.xx.x

# 验证Node.js
node --version
# 应显示: v14.x.x

# 验证Maven
mvn --version
# 应显示: Apache Maven 3.x.x
```

### 2.5 配置防火墙

```bash
# Ubuntu (使用ufw)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Spring Boot
sudo ufw allow 3306/tcp  # MySQL (如果需要远程访问)
sudo ufw enable

# CentOS (使用firewalld)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

## 3. 数据库部署

### 3.1 启动并配置MySQL

```bash
# 启动MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 运行安全配置脚本
sudo mysql_secure_installation

# 按提示操作：
# - 设置root密码（记住这个密码！）
# - 移除匿名用户：Y
# - 禁止root远程登录：Y
# - 删除测试数据库：Y
# - 重新加载权限表：Y
```

### 3.2 创建数据库和用户

```bash
# 登录MySQL
sudo mysql -u root -p

# 在MySQL命令行中执行
CREATE DATABASE litemall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'litemall'@'localhost' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON litemall.* TO 'litemall'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3 导入数据库结构

```bash
# 创建工作目录
mkdir -p /home/deploy
cd /home/deploy

# 从开发环境上传SQL文件或直接下载
# 假设已上传到服务器

# 导入基础表结构
mysql -u litemall -p litemall < litemall_schema.sql
mysql -u litemall -p litemall < litemall_table.sql
mysql -u litemall -p litemall < litemall_data.sql

# 导入储物柜扩展表
mysql -u litemall -p litemall < locker-extension.sql
mysql -u litemall -p litemall < locker-new-flow.sql
```

## 4. 后端服务部署

### 4.1 创建部署目录

```bash
# 创建应用目录
sudo mkdir -p /opt/litemall
sudo mkdir -p /opt/litemall/logs
sudo mkdir -p /opt/litemall/storage

# 创建运行用户（安全考虑，不使用root运行）
sudo useradd -r -s /bin/false litemall
sudo chown -R litemall:litemall /opt/litemall
```

### 4.2 上传JAR包

有两种方式：

**方式一：本地编译后上传**

在本地开发环境执行：
```bash
# 编译项目
cd litemall-all
mvn clean package -DskipTests

# 上传到服务器
scp target/litemall-all-0.1.0-exec.jar root@your-server-ip:/opt/litemall/litemall.jar
```

**方式二：服务器上编译（需要上传源代码）**

```bash
# 上传源代码到服务器后
cd /home/deploy/litemall
mvn clean package -DskipTests
cp litemall-all/target/litemall-all-*-exec.jar /opt/litemall/litemall.jar
```

### 4.3 配置应用

创建外部配置文件：

```bash
sudo vim /opt/litemall/application.yml
```

配置内容（根据实际情况修改）：

```yaml
spring:
  profiles:
    active: prod
  datasource:
    druid:
      url: jdbc:mysql://localhost:3306/litemall?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false
      username: litemall
      password: your_strong_password_here  # 修改为实际密码
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
    org.linlinjava.litemall: DEBUG
  file:
    path: /opt/litemall/logs

litemall:
  # 微信相关配置
  wx:
    app-id: your_app_id           # 修改为实际的小程序AppID
    app-secret: your_app_secret   # 修改为实际的AppSecret
    mch-id: your_mch_id          # 微信支付商户号（如果不需要支付可以先不配置）
    mch-key: your_mch_key        # 微信支付密钥
    notify-url: https://yourdomain.com/wx/order/pay-notify

  # 文件存储配置
  storage:
    active: local
    local:
      storagePath: /opt/litemall/storage
      # 注意：这里要配置为实际的访问地址
      address: https://yourdomain.com/wx/storage/fetch/

  # 系统配置
  mall:
    name: "耶氏体育台球杆存取"
    address: "您的地址"
    phone: "您的电话"
    qq: ""
```

### 4.4 创建系统服务

创建systemd服务文件：

```bash
sudo vim /etc/systemd/system/litemall.service
```

内容如下：

```ini
[Unit]
Description=Litemall Spring Boot Application
After=syslog.target network.target mysql.service

[Service]
Type=simple
User=litemall
Group=litemall
WorkingDirectory=/opt/litemall
ExecStart=/usr/bin/java -jar /opt/litemall/litemall.jar --spring.config.location=/opt/litemall/application.yml
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=litemall

# 内存限制（根据服务器配置调整）
Environment="JAVA_OPTS=-Xms512m -Xmx2048m"

[Install]
WantedBy=multi-user.target
```

### 4.5 启动后端服务

```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start litemall

# 设置开机自启
sudo systemctl enable litemall

# 查看服务状态
sudo systemctl status litemall

# 查看日志
sudo journalctl -u litemall -f
```

### 4.6 验证后端服务

```bash
# 测试后端API
curl http://localhost:8080/wx/home/index

# 应该返回JSON数据
```

## 5. 管理后台部署

### 5.1 编译管理后台

在本地开发环境或服务器上：

```bash
cd litemall-admin

# 安装依赖
npm install --registry=https://registry.npm.taobao.org

# 修改API地址
vim .env.production
# 修改 VUE_APP_BASE_API = 'https://yourdomain.com'

# 编译生产版本
npm run build:prod

# 编译后的文件在 dist/ 目录
```

### 5.2 部署静态文件

```bash
# 创建网站目录
sudo mkdir -p /var/www/litemall-admin

# 上传dist目录内容到服务器
# 本地执行：
scp -r dist/* root@your-server-ip:/var/www/litemall-admin/

# 设置权限
sudo chown -R www-data:www-data /var/www/litemall-admin
```

## 6. 小程序部署

### 6.1 配置小程序

修改小程序配置文件：

```javascript
// yeslocker-uniapp/src/config/api.js
const BASE_URL = 'https://yourdomain.com';

export default {
  baseUrl: BASE_URL,
  // ... 其他配置
}
```

### 6.2 编译小程序

```bash
cd yeslocker-uniapp

# 安装依赖
npm install

# 编译微信小程序
npm run build:mp-weixin

# 编译后的文件在 dist/build/mp-weixin 目录
```

### 6.3 上传到微信

1. 使用微信开发者工具打开 `dist/build/mp-weixin` 目录
2. 在项目设置中配置：
   - AppID：你的小程序AppID
   - 不校验合法域名（开发时）
3. 上传代码到微信后台
4. 在微信公众平台提交审核

## 7. 域名与SSL配置

### 7.1 配置Nginx

创建站点配置：

```bash
sudo vim /etc/nginx/sites-available/litemall
```

配置内容：

```nginx
# 后端API和管理后台配置
server {
    listen 80;
    server_name yourdomain.com;
    
    # 强制跳转HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL证书配置（后面会生成）
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # 日志
    access_log /var/log/nginx/litemall.access.log;
    error_log /var/log/nginx/litemall.error.log;
    
    # 管理后台
    location / {
        root /var/www/litemall-admin;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # 后端API代理
    location /wx/ {
        proxy_pass http://localhost:8080/wx/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 上传文件大小限制
        client_max_body_size 50m;
    }
    
    # 管理API代理
    location /admin/ {
        proxy_pass http://localhost:8080/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用站点：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/litemall /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 7.2 申请SSL证书

使用Let's Encrypt免费证书：

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d yourdomain.com

# 按提示操作：
# - 输入邮箱
# - 同意服务条款
# - 选择是否接收新闻邮件
# - 选择是否重定向HTTP到HTTPS（选择2）

# 设置自动续期
sudo systemctl enable certbot.timer
```

### 7.3 配置微信小程序域名

在微信公众平台配置服务器域名：

1. 登录微信公众平台
2. 开发 -> 开发设置 -> 服务器域名
3. 配置以下域名：
   - request合法域名：https://yourdomain.com
   - uploadFile合法域名：https://yourdomain.com
   - downloadFile合法域名：https://yourdomain.com

## 8. 部署后验证

### 8.1 检查服务状态

```bash
# 检查后端服务
sudo systemctl status litemall

# 检查Nginx
sudo systemctl status nginx

# 检查MySQL
sudo systemctl status mysql

# 检查端口监听
sudo netstat -tlnp | grep -E '(3306|8080|80|443)'
```

### 8.2 功能测试

1. **访问管理后台**
   - 浏览器访问：https://yourdomain.com
   - 默认账号：admin123 / admin123
   - 首次登录后立即修改密码

2. **测试API接口**
   ```bash
   # 测试首页API
   curl https://yourdomain.com/wx/home/index
   
   # 测试管理API
   curl https://yourdomain.com/admin/index/index
   ```

3. **小程序测试**
   - 在微信开发者工具中测试
   - 确保能正常登录和使用功能

### 8.3 监控设置

创建简单的监控脚本：

```bash
sudo vim /opt/litemall/check_health.sh
```

内容：

```bash
#!/bin/bash

# 检查后端服务
if ! systemctl is-active --quiet litemall; then
    echo "Litemall service is down!"
    systemctl start litemall
fi

# 检查API健康
if ! curl -f -s http://localhost:8080/wx/home/index > /dev/null; then
    echo "API is not responding!"
    systemctl restart litemall
fi
```

设置定时任务：

```bash
sudo chmod +x /opt/litemall/check_health.sh
sudo crontab -e

# 添加以下行（每5分钟检查一次）
*/5 * * * * /opt/litemall/check_health.sh >> /opt/litemall/logs/health_check.log 2>&1
```

## 9. 常见问题

### 9.1 后端服务启动失败

**问题**：服务无法启动或启动后立即停止

**解决方案**：
```bash
# 查看详细日志
sudo journalctl -u litemall -n 100

# 常见原因：
# 1. 数据库连接失败 - 检查数据库配置
# 2. 端口被占用 - 使用 netstat -tlnp | grep 8080 检查
# 3. 内存不足 - 调整JVM参数
```

### 9.2 上传文件失败

**问题**：用户无法上传图片

**解决方案**：
```bash
# 检查目录权限
ls -la /opt/litemall/storage

# 修复权限
sudo chown -R litemall:litemall /opt/litemall/storage
sudo chmod -R 755 /opt/litemall/storage

# 检查Nginx上传限制
# 在nginx配置中添加：client_max_body_size 50m;
```

### 9.3 小程序无法访问

**问题**：小程序提示网络错误

**解决方案**：
1. 检查域名是否在微信后台配置
2. 检查SSL证书是否有效
3. 检查防火墙是否开放443端口
4. 查看Nginx错误日志：`tail -f /var/log/nginx/litemall.error.log`

### 9.4 数据库连接数过多

**问题**：报错 "Too many connections"

**解决方案**：
```bash
# 修改MySQL配置
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加或修改
max_connections = 200

# 重启MySQL
sudo systemctl restart mysql
```

### 9.5 定期维护

建议定期执行以下维护任务：

1. **备份数据库**（每天）
   ```bash
   mysqldump -u litemall -p litemall > /backup/litemall_$(date +%Y%m%d).sql
   ```

2. **清理日志**（每周）
   ```bash
   find /opt/litemall/logs -name "*.log" -mtime +7 -delete
   ```

3. **更新SSL证书**（每2个月）
   ```bash
   sudo certbot renew
   ```

4. **监控磁盘空间**
   ```bash
   df -h
   ```

## 总结

按照以上步骤操作，您应该能够成功部署整个系统。部署过程中如遇到问题：

1. 先查看相关服务的日志
2. 检查配置文件是否正确
3. 确认防火墙和安全组规则
4. 参考常见问题解决方案

建议在正式上线前：
- 在测试环境完整演练一遍
- 准备好备份和回滚方案
- 制定监控和告警机制
- 准备运维文档和应急预案

祝您部署顺利！如有疑问，请参考项目文档或联系技术支持。