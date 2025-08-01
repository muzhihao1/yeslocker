# 耶氏台球杆存取系统 - 后端环境搭建指南

## 📋 环境要求

- **操作系统**: macOS / Linux / Windows
- **Java**: OpenJDK 8 或 11
- **Maven**: 3.6+
- **MySQL**: 8.0+
- **Redis**: 5.0+
- **Git**: 2.0+

## 🚀 快速开始

### 1. Java 环境安装

#### macOS (使用 Homebrew)
```bash
# 安装 OpenJDK 11
brew install openjdk@11

# 设置环境变量
echo 'export PATH="/usr/local/opt/openjdk@11/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
java -version
```

#### Linux (Ubuntu/Debian)
```bash
# 更新包管理器
sudo apt update

# 安装 OpenJDK 11
sudo apt install openjdk-11-jdk

# 验证安装
java -version
```

#### Windows
1. 下载 [OpenJDK 11](https://adoptium.net/)
2. 运行安装程序
3. 设置 JAVA_HOME 环境变量
4. 添加 %JAVA_HOME%\bin 到 PATH

### 2. Maven 安装

#### macOS
```bash
# 使用 Homebrew 安装
brew install maven

# 验证安装
mvn -version
```

#### Linux
```bash
# 下载 Maven
wget https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz

# 解压
tar -xzf apache-maven-3.9.6-bin.tar.gz
sudo mv apache-maven-3.9.6 /opt/maven

# 设置环境变量
echo 'export MAVEN_HOME=/opt/maven' >> ~/.bashrc
echo 'export PATH=$MAVEN_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 验证安装
mvn -version
```

### 3. MySQL 8.0 安装配置

#### macOS
```bash
# 安装 MySQL
brew install mysql@8.0

# 启动 MySQL 服务
brew services start mysql@8.0

# 安全配置
mysql_secure_installation
```

#### Linux
```bash
# 添加 MySQL APT 仓库
wget https://dev.mysql.com/get/mysql-apt-config_0.8.29-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.29-1_all.deb

# 安装 MySQL
sudo apt update
sudo apt install mysql-server

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

#### 创建数据库和用户
```sql
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE yeslocker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权
CREATE USER 'yeslocker'@'localhost' IDENTIFIED BY 'yeslocker123456';
GRANT ALL PRIVILEGES ON yeslocker.* TO 'yeslocker'@'localhost';
FLUSH PRIVILEGES;

# 退出
exit;
```

### 4. Redis 安装配置

#### macOS
```bash
# 安装 Redis
brew install redis

# 启动 Redis 服务
brew services start redis

# 测试连接
redis-cli ping
```

#### Linux
```bash
# 安装 Redis
sudo apt update
sudo apt install redis-server

# 配置 Redis（编辑配置文件）
sudo nano /etc/redis/redis.conf
# 找到 supervised 并设置为 systemd
# supervised systemd

# 重启 Redis
sudo systemctl restart redis
sudo systemctl enable redis

# 测试连接
redis-cli ping
```

## 📦 项目初始化

### 1. 导入数据库结构

```bash
# 进入项目目录
cd /Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker

# 导入 Litemall 基础表结构
cd litemall-db/sql
mysql -u yeslocker -p yeslocker < litemall_schema.sql
mysql -u yeslocker -p yeslocker < litemall_table.sql
mysql -u yeslocker -p yeslocker < litemall_data.sql

# 导入储物柜扩展表
cd ../../sql
mysql -u yeslocker -p yeslocker < locker-extension.sql
```

### 2. 配置应用程序

编辑 `litemall-all/src/main/resources/application-dev.yml`:

```yaml
spring:
  profiles:
    active: dev
  datasource:
    druid:
      url: jdbc:mysql://localhost:3306/yeslocker?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&verifyServerCertificate=false&useSSL=false
      driver-class-name: com.mysql.cj.jdbc.Driver
      username: yeslocker
      password: yeslocker123456
      initial-size: 10
      max-active: 50
      min-idle: 10
      max-wait: 60000
  redis:
    host: localhost
    port: 6379
    password: # 如果设置了密码
    database: 0
    timeout: 3000ms

# 文件存储配置（使用本地存储）
litemall:
  storage:
    active: local
    local:
      storagePath: storage
      address: http://localhost:8080/wx/storage/fetch/

# 微信配置（需要替换为实际值）
  wx:
    app-id: wx8xxxxxxxxxxxxx
    app-secret: xxxxxxxxxxxxxxxxxxxxxx
    mch-id: xxxxxxxxxx
    mch-key: xxxxxxxxxxxxxxxxxxxxxx
    notify-url: http://你的域名/wx/order/pay-notify
```

### 3. 编译项目

```bash
# 在项目根目录执行
mvn clean install -DskipTests
```

### 4. 启动后端服务

```bash
# 方式1：使用 java -jar 运行
java -jar litemall-all/target/litemall-all-*-exec.jar

# 方式2：使用 Maven 运行
cd litemall-all
mvn spring-boot:run

# 方式3：开发模式运行（推荐）
java -Dfile.encoding=UTF-8 -jar litemall-all/target/litemall-all-*-exec.jar --spring.profiles.active=dev
```

## ✅ 验证安装

### 1. 检查服务状态

```bash
# 检查后端服务
curl http://localhost:8080/wx/home/index

# 检查管理后台
curl http://localhost:8080/admin/index/index

# 检查数据库连接
mysql -u yeslocker -p -e "SHOW TABLES;" yeslocker

# 检查 Redis 连接
redis-cli ping
```

### 2. 访问管理后台

打开浏览器访问：
- 管理后台：http://localhost:8080/admin/index.html
- 默认账号：admin123
- 默认密码：admin123

### 3. API 测试

使用 Postman 或 curl 测试 API：

```bash
# 获取商品列表
curl http://localhost:8080/wx/goods/list

# 获取可用储物柜
curl http://localhost:8080/wx/locker/available
```

## 🛠 常见问题

### 1. Maven 下载慢
创建 `~/.m2/settings.xml` 使用阿里云镜像：

```xml
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
```

### 2. MySQL 时区问题
如果遇到时区错误，在 MySQL 中执行：

```sql
SET GLOBAL time_zone = '+8:00';
SET time_zone = '+8:00';
```

### 3. 端口占用
修改 `application-dev.yml` 中的端口配置：

```yaml
server:
  port: 8081  # 修改为其他端口
```

### 4. Redis 连接失败
检查 Redis 是否启动：

```bash
# macOS
brew services list | grep redis

# Linux
sudo systemctl status redis
```

## 📱 前端联调

后端启动成功后，前端可以通过以下配置连接：

在 `yeslocker-uniapp/src/config/index.js` 中配置：

```javascript
const config = {
  development: {
    baseUrl: 'http://localhost:8080',
    imgUrl: 'http://localhost:8080/wx/storage/fetch/'
  }
}
```

## 🚀 下一步

1. 完成身份验证功能的具体实现
2. 配置微信小程序的 AppID 和 Secret
3. 配置七牛云存储（用于二维码图片）
4. 部署到生产环境

---

如有问题，请参考：
- [Litemall 官方文档](https://linlinjava.gitbook.io/litemall/)
- [项目协作计划](../COLLABORATION-PLAN.md)
- [API 文档](./api-documentation.md)