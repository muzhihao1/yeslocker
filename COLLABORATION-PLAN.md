# 耶氏台球杆存取系统 - 双终端协同开发计划

## 🎯 项目概述

### 项目背景
基于 **Litemall** 开源商城系统，使用 **Context Engineering** 架构方法，开发一个台球杆储物柜管理系统。前端采用 **UniApp** 框架实现跨平台能力，首要目标是**微信小程序**。

### 技术架构整合方案

```
┌─────────────────────────────────────────────────────────┐
│                    UniApp 前端                           │
│         (编译目标：微信小程序、H5、App等)                   │
├─────────────────────────────────────────────────────────┤
│                  RESTful API 层                          │
├─────────────────────────────────────────────────────────┤
│              Litemall 后端 (Spring Boot)                 │
│                    +                                     │
│           储物柜扩展功能 (基于Context Engineering)          │
├─────────────────────────────────────────────────────────┤
│           MySQL 8.0        │        Redis 5.0           │
└─────────────────────────────────────────────────────────┘
```

### Context Engineering 分层架构映射

1. **Level 1 - Atoms（原子层）** → Litemall-db 模块
   - 7个核心实体：用户、储物柜、球杆、操作记录、凭证、管理员、日志
   - 扩展 Litemall 数据库表结构

2. **Level 2 - Neural（神经层）** → Litemall-core + wx-api 模块
   - 业务流程：存杆流程、取杆流程、身份验证流程
   - 用户旅程：新用户注册、老用户操作

3. **Level 3 - Protocols（协议层）** → 系统集成模块
   - 微信登录、模板消息
   - 七牛云存储（二维码）
   - 监控告警系统

## 📋 任务分配方案（前后端分离模式）

### 终端 A - 后端开发负责人
**负责模块**：完整的后端开发（环境搭建、数据库、API开发、业务逻辑）

**Phase 1 - 基础环境搭建**：
1. [ ] 完成 Java/Maven 环境安装配置
2. [ ] 搭建 MySQL 8.0 数据库，创建 yeslocker 数据库
3. [ ] 安装配置 Redis 5.0
4. [ ] 配置 Litemall 后端 application.yml
5. [ ] 验证后端服务启动正常（http://localhost:8080）

**Phase 2 - 数据库设计与实现**：
1. [ ] 基于 Context Engineering Level-1 设计扩展数据表
   ```sql
   -- 需要创建的扩展表
   - litemall_locker (储物柜表)
   - litemall_locker_operation (操作记录表)
   - litemall_cue_stick (球杆信息表)
   - litemall_voucher (凭证表)
   ```
2. [ ] 创建 MyBatis Mapper 和实体类
3. [ ] 编写数据库初始化脚本

**Phase 3 - API 开发与业务逻辑**：
1. [ ] 基于 Context Engineering Level-2 实现核心 API
   ```java
   // 用户相关
   POST /wx/auth/login          // 微信登录
   POST /wx/auth/verify         // 身份验证
   GET  /wx/user/profile        // 用户信息
   
   // 储物柜操作
   POST /wx/locker/store        // 存杆
   POST /wx/locker/retrieve     // 取杆
   GET  /wx/locker/status       // 查询状态
   GET  /wx/locker/history      // 历史记录
   
   // 凭证相关
   GET  /wx/voucher/:code       // 凭证详情
   POST /wx/voucher/validate    // 验证凭证
   ```
2. [ ] 实现业务逻辑层
   - 存杆流程（生成凭证、分配柜子）
   - 取杆流程（验证凭证、释放柜子）
   - 超时提醒（定时任务）
3. [ ] 集成第三方服务
   - 七牛云（二维码存储）
   - 微信模板消息
4. [ ] 编写 API 文档（Swagger）
5. [ ] 创建 Postman 测试集合

**输出标准**：
- 后端服务稳定运行
- 所有 API 可正常调用
- 数据库设计合理且性能良好
- API 文档完整，支持前端开发

### 终端 B - 前端开发负责人
**负责模块**：完整的 UniApp 前端开发（UI实现、业务交互、微信小程序适配）

**Phase 1 - 项目架构与组件设计**：
1. [ ] 设计 UniApp 组件架构
   ```
   components/
   ├── atoms/          # 基础组件（对应Level-1）
   │   ├── UserCard.vue
   │   ├── LockerItem.vue
   │   └── VoucherCode.vue
   ├── molecules/      # 业务组件（对应Level-2）
   │   ├── StorageFlow.vue
   │   ├── RetrievalFlow.vue
   │   └── IdentityVerify.vue
   └── organisms/      # 页面组件（对应Level-3）
       ├── HomePage.vue
       ├── StoragePage.vue
       └── UserCenter.vue
   ```
2. [ ] 配置项目结构和路由
3. [ ] 集成 UI 框架（uView 或 Vant Weapp）
4. [ ] 实现请求封装和状态管理

**Phase 2 - 核心页面开发**：
1. [ ] 首页
   - 扫码入口按钮
   - 当前存储状态展示
   - 广告轮播位
2. [ ] 存杆流程页面（4步）
   - 身份验证
   - 扫码/输入柜号
   - 确认信息
   - 生成凭证
3. [ ] 取杆页面
   - 凭证验证（扫码/输入）
   - 确认取杆
4. [ ] 个人中心
   - 用户信息
   - 操作历史
   - 设置页面
5. [ ] 二手球杆商城（保留 Litemall 功能）

**Phase 3 - 功能集成与优化**：
1. [ ] 集成微信登录
2. [ ] 实现扫码功能（微信扫一扫 API）
3. [ ] 响应式布局优化（375px 基准）
4. [ ] 配置微信小程序编译和调试
5. [ ] 性能优化和错误处理
6. [ ] 实现广告位组件和埋点

**输出标准**：
- UniApp 项目结构清晰
- 可成功编译为微信小程序
- UI 交互流畅，符合设计稿
- 完成与后端 API 的联调

## 🤝 协作规则

### 1. 进度更新机制
- 每完成一个任务，在本文档中打勾 ✓
- 遇到阻塞问题，在进度更新区说明
- 每日更新进度，不另建新文档

### 2. 代码管理
- 所有代码提交到 `yeshi-mvp` 分支
- 提交信息格式：`[终端A]` 或 `[终端B]` + 功能描述
- 冲突解决：先提交者优先，后提交者负责合并

### 3. 沟通机制
- 重要决策写入本文档
- API 变更：终端 A 更新后需通知终端 B
- 数据库变更：终端 A 负责更新文档
- 前端需求：终端 B 可在文档中提出 API 需求

### 4. 并行开发策略
- **终端 A 先行任务**：环境搭建、数据库设计、Mock API
- **终端 B 并行任务**：组件设计、页面布局、使用 Mock 数据开发
- **联调阶段**：两终端共同完成 API 对接和测试

### 5. 关键文件位置
```
yeslocker/
├── COLLABORATION-PLAN.md          # 本协作文档
├── context-engineering/           # Context Engineering 设计文档
├── 方案/                          # 原始需求文档
├── litemall-*/                   # Litemall 各模块
├── yeslocker-uniapp/             # UniApp 前端项目
└── docs/                         # API 文档
```

## 📊 进度更新区

### 2024-01-22 更新（终端 A）
- ✓ 克隆 yeslocker 仓库，创建 yeshi-mvp 分支
- ✓ 分析 Litemall 项目结构
- ✓ 创建 UniApp 项目框架
- ✓ 编写协作计划文档
- ✓ 创建数据库设计文档 (docs/database-design.md)
- ✓ 编写 SQL 初始化脚本 (sql/locker-extension.sql)
- ✓ 创建 API 文档 (docs/api-documentation.md)
- ✓ 提供 Mock 数据服务 (yeslocker-uniapp/src/mock/api.js)
- ⏳ Java/Maven 环境待安装
- ⏳ MySQL/Redis 待配置

### 2024-01-22 更新（终端 B）
- ✓ 创建组件目录结构 (components/atoms, molecules, organisms)
- ✓ 实现所有原子组件：
  - ✓ UserCard.vue - 用户信息卡片组件
  - ✓ LockerItem.vue - 储物柜展示组件
  - ✓ VoucherCode.vue - 凭证码展示组件
- ⏳ 准备配置项目路由和页面结构
- ⏳ 计划实现分子组件 (StorageFlow, RetrievalFlow, IdentityVerify)

---

## 🚀 启动指南

### 终端 A 快速开始
```bash
# 1. 安装 Java 17 和 Maven（如果未安装）
brew install openjdk@17
brew install maven

# 2. 配置数据库
mysql -u root -p
CREATE DATABASE yeslocker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. 导入 Litemall 基础数据
cd litemall-db/sql
mysql -u root -p yeslocker < litemall_schema.sql
mysql -u root -p yeslocker < litemall_table.sql
mysql -u root -p yeslocker < litemall_data.sql

# 4. 编译运行
cd ../..
mvn clean install
java -jar litemall-all/target/litemall-all-*-exec.jar
```

### 终端 B 快速开始
```bash
# 1. 进入 UniApp 项目
cd yeslocker-uniapp

# 2. 安装依赖
npm install

# 3. 运行开发服务器
npm run dev:h5  # H5 预览
npm run dev:mp-weixin  # 微信小程序

# 4. 使用微信开发者工具
# 导入 dist/dev/mp-weixin 目录
```

## 📝 重要提醒

1. **UniApp 是高优先级**：使用 UniApp 实现跨平台能力，但微信小程序是首要目标
2. **遵循 Context Engineering**：所有设计和实现都要参考 context-engineering 目录下的文档
3. **保留 Litemall 优势**：不要破坏原有的电商功能，储物柜是扩展功能
4. **持续更新本文档**：这是唯一的协作文档，所有进度都在此更新

---

*最后更新：2024-01-22 by 终端 A（重新分配为双终端模式）*