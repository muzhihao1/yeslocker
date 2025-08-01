# 耶氏台球杆存取系统 (YesLocker)

基于 Litemall 开源商城系统扩展的台球杆储物柜管理系统，采用 Spring Boot + UniApp 技术栈，使用 Context Engineering 架构方法设计。

## 📊 项目进度

- **后端开发**: 100% ✅ 完成
- **前端开发**: 95% （待API集成）
- **整体进度**: 97.5%

## 🚀 项目特点

- **跨平台支持**：使用 UniApp 开发，可编译为微信小程序、H5、iOS/Android App
- **成熟基础**：基于 Litemall 商城系统，保留二手球杆交易功能
- **架构清晰**：采用 Context Engineering 分层架构设计
- **功能完整**：身份验证、扫码存取、凭证管理、广告系统

## 📁 项目结构

```
yeslocker/
├── litemall-admin/           # 管理后台 (Vue.js)
├── litemall-admin-api/       # 管理后台 API
├── litemall-core/            # 核心业务模块
├── litemall-db/              # 数据库模块
├── litemall-wx-api/          # 小程序 API
├── litemall-all/             # 聚合部署模块
├── yeslocker-uniapp/         # UniApp 前端项目
├── sql/                      # 数据库脚本
│   └── locker-extension.sql  # 储物柜扩展表
├── docs/                     # 项目文档
│   ├── database-design.md    # 数据库设计
│   └── api-documentation.md  # API 文档
└── context-engineering/      # 架构设计文档
```

## 🛠️ 技术栈

### 后端技术
- Spring Boot 2.x
- MyBatis
- MySQL 8.0
- Redis
- JWT 认证
- 七牛云存储

### 前端技术
- UniApp (Vue.js)
- WeUI 组件库
- 微信小程序 SDK

## 🚀 快速开始

### 环境要求
- JDK 11+ （推荐使用 OpenJDK 11）
- Maven 3.6+
- MySQL 8.0+
- Redis 5.0+
- Node.js 14+
- 微信开发者工具

### 后端启动

1. 创建数据库
```bash
mysql -u root -p
CREATE DATABASE yeslocker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 导入数据表
```bash
cd sql
mysql -u root -p yeslocker < litemall_schema.sql
mysql -u root -p yeslocker < litemall_table.sql
mysql -u root -p yeslocker < litemall_data.sql
mysql -u root -p yeslocker < locker-extension.sql
```

3. 修改配置
```bash
cd litemall-all/src/main/resources
cp application-dev.yml.example application-dev.yml
# 编辑 application-dev.yml，修改数据库密码等配置
```

4. 编译运行
```bash
mvn clean package
java -jar litemall-all/target/litemall-all-*-exec.jar --spring.profiles.active=dev

# 或使用启动脚本
./start-backend.sh
```

### 🔧 快速启动（推荐）

```bash
# 1. 检查环境
./check-environment.sh

# 2. 设置数据库
./scripts/setup-database.sh

# 3. 修改配置（编辑 application-dev.yml 中的数据库密码）

# 4. 启动服务
./start-backend.sh
```

详见 [快速启动指南](QUICK-START.md)

### 前端启动

1. 安装依赖
```bash
cd yeslocker-uniapp
npm install
```

2. 运行开发服务器
```bash
# H5 预览
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin
```

3. 微信开发者工具
- 导入项目：选择 `yeslocker-uniapp/dist/dev/mp-weixin` 目录
- 配置 AppID：在项目设置中填入小程序 AppID

## 📖 开发文档

- [协同开发计划](./COLLABORATION-PLAN.md) - 双终端任务分配
- [数据库设计](./docs/database-design.md) - 数据表结构说明
- [API 文档](./docs/api-documentation.md) - 接口定义和示例
- [Context Engineering](./context-engineering/) - 架构设计文档

## 🔑 核心功能

### 用户端
- 微信登录与身份验证
- 扫码选择储物柜
- 存储球杆生成凭证
- 凭证二维码取回球杆
- 操作历史查询
- 二手球杆市场

### 管理端
- 储物柜管理
- 用户管理
- 操作记录查询
- 数据统计分析
- 广告位管理
- 系统配置

## 🤝 参与贡献

请查看 [COLLABORATION-PLAN.md](./COLLABORATION-PLAN.md) 了解开发任务分配。

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 重构代码
- test: 测试用例
- chore: 其他修改

### 分支管理
- main: 主分支
- yeshi-mvp: MVP 开发分支
- feature/*: 功能分支
- hotfix/*: 紧急修复分支

## 📄 许可证

本项目基于 MIT 许可证开源，详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- [Litemall](https://github.com/linlinjava/litemall) - 提供商城系统基础
- [UniApp](https://uniapp.dcloud.io/) - 跨平台开发框架
- [WeUI](https://weui.io/) - 微信官方设计组件库