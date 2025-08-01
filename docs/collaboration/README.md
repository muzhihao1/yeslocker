# YesLocker 协作开发中心

## 📋 核心协作文档

### 👫 [前后端协作开发文档](./COLLABORATION-STATUS.md)
Terminal A 和 Terminal B 共同使用的协作文档，包含：
- 实时任务进度跟踪
- API契约定义
- 依赖关系管理
- 实时沟通记录

## 🚀 快速开始

### 两个终端并行工作

**Terminal A (前端)**
```bash
cd yeslocker-uniapp
npm install
npm run dev:mp-weixin
```

**Terminal B (后端)**
```bash
# 窗口1: 启动后端服务
./start-backend.sh

# 窗口2: 启动管理后台
cd litemall-admin
npm run dev
```

## 📌 协作重点

1. **同步工作**: 查看协作文档中的依赖关系
2. **API优先**: 后端先定义接口，前端再对接
3. **实时沟通**: 在协作文档中留言交流
4. **快速迭代**: 小步快跑，频繁同步

## 🎯 今日焦点

- **协同任务**: 储物柜管理API对接（A01 + B01）
- **并行任务**: A做前端UI，B做管理功能

## 📡 项目资源

- [项目总览](../../README.md)
- [API文档](../api-documentation.md)
- [数据库设计](../database-design.md)
- [架构设计](../../context-engineering/CONTEXT.md)

---

💡 **提示**: 所有协作细节都在 [COLLABORATION-STATUS.md](./COLLABORATION-STATUS.md) 中，这是你们的主要工作文档！