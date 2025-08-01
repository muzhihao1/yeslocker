# YesLocker UniApp 前端项目

耶氏体育台球杆存取登记微信小程序 - 基于 UniApp 开发的跨平台前端应用。

## 项目概述

这是一个为台球厅设计的智能储物柜管理系统，主要功能包括：
- 用户身份验证
- 球杆存储和取回
- 凭证生成和管理
- 微信扫码功能
- 广告系统集成

## 技术架构

- **框架**：UniApp (Vue.js based)
- **目标平台**：微信小程序（主要）、H5、App
- **UI框架**：自定义组件 + UniApp 内置组件
- **状态管理**：Vuex
- **组件架构**：Context Engineering (Atoms/Molecules/Organisms)

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式

#### 微信小程序开发
```bash
# 启动开发服务器
npm run dev:mp-weixin

# 使用微信开发者工具导入 dist/dev/mp-weixin 目录
```

#### H5 开发
```bash
npm run dev:h5
```

### 生产构建

#### 构建微信小程序
```bash
npm run build:mp-weixin
```

#### 构建 H5
```bash
npm run build:h5
```

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── atoms/           # 原子组件（基础UI组件）
│   ├── molecules/       # 分子组件（业务组件）
│   └── organisms/       # 有机体组件（页面级组件）
├── pages/               # 页面目录
│   ├── home/           # 首页
│   ├── storage/        # 存储流程
│   ├── retrieval/      # 取回流程
│   ├── user/           # 用户中心
│   └── marketplace/    # 二手商城
├── store/              # Vuex 状态管理
├── utils/              # 工具函数
│   ├── request.js      # 网络请求封装
│   ├── wechat.js       # 微信API封装
│   ├── qrcode.js       # 二维码生成工具
│   └── constants.js    # 常量定义
├── api/                # API 接口定义
├── static/             # 静态资源
└── App.vue             # 应用入口
```

## 核心组件

### Advertisement 组件（新增）

多功能广告组件，支持多种广告展示形式：

#### 使用示例

```vue
<!-- 轮播广告 -->
<advertisement
  type="carousel"
  :ad-list="advertisements"
  :show-close-btn="false"
  position="home_banner"
  @click="handleAdClick"
  @exposure="handleAdExposure"
/>

<!-- 内嵌广告 -->
<advertisement
  type="inline"
  :ad-data="inlineAd"
  position="history_inline"
  @click="handleAdClick"
/>

<!-- 弹窗广告 -->
<advertisement
  type="popup"
  :ad-data="popupAd"
  @close="handleAdClose"
/>
```

#### 支持的广告类型

1. **banner** - 横幅广告
2. **carousel** - 轮播广告
3. **popup** - 弹窗广告
4. **inline** - 内嵌广告
5. **float** - 浮动广告

#### 广告数据格式

```javascript
{
  id: 'ad_001',
  title: '广告标题',
  description: '广告描述',
  imageUrl: '/static/ad-image.jpg',
  iconUrl: '/static/icon.png',  // 用于inline类型
  linkType: 'page',  // page|webview|miniprogram|external
  linkUrl: '/pages/target/index',
  appId: 'wx1234567890',  // 小程序跳转时使用
  actionText: '查看详情'  // 行动按钮文字
}
```

## 开发规范

### 组件开发规范

1. **原子组件**：纯UI展示，无业务逻辑
2. **分子组件**：包含业务逻辑的可复用组件
3. **有机体组件**：页面级别的大型组件

### 命名规范

- 组件文件：PascalCase（如 `UserCard.vue`）
- 页面文件：kebab-case（如 `select-locker.vue`）
- 工具函数：camelCase（如 `formatDate`）

### 样式规范

- 使用 rpx 作为尺寸单位
- 基准屏幕宽度：375px（750rpx）
- 使用 SCSS 预处理器
- 遵循 BEM 命名规范

## API 集成

所有 API 调用都通过 `utils/request.js` 封装，支持：
- 自动添加认证 Token
- 统一错误处理
- 请求/响应拦截
- Mock 数据支持

## 微信功能集成

通过 `utils/wechat.js` 封装的微信特定功能：
- 微信登录
- 扫码功能
- 手机号获取
- 订阅消息
- 位置选择

## 部署说明

### 微信小程序部署

1. 构建项目：`npm run build:mp-weixin`
2. 使用微信开发者工具上传代码
3. 配置服务器域名白名单
4. 提交审核并发布

### 注意事项

- 确保 `manifest.json` 中的 AppID 配置正确
- 检查所有使用的 API 权限是否已申请
- 遵循微信小程序设计规范

## 维护者

- 前端开发：终端 B
- 后端开发：终端 A

## 许可证

Private