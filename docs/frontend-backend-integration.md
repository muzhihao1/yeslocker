# 前后端整合指南

## 整合状态

- ✅ 后端服务已启动：http://localhost:8080
- ✅ Mock 数据已禁用
- ✅ API 基础路径已配置：http://localhost:8080/wx
- ✅ Token 认证机制已对接

## 启动前端开发服务器

### 1. 进入 UniApp 项目目录
```bash
cd yeslocker-uniapp
```

### 2. 安装依赖（如果未安装）
```bash
npm install
```

### 3. 启动 H5 开发服务器
```bash
npm run dev:h5
```

访问地址：http://localhost:8081

### 4. 启动微信小程序开发
```bash
npm run dev:mp-weixin
```

然后在微信开发者工具中导入 `dist/dev/mp-weixin` 目录。

## 测试流程

### 1. 测试登录流程

由于真实的微信登录需要在微信环境中，H5 开发时可以使用以下方式模拟：

1. 修改登录页面，添加测试登录按钮
2. 使用固定的测试 code 进行登录
3. 或者在后端添加测试登录接口

### 2. 测试核心功能

#### 2.1 查看可用储物柜
- 访问首页
- 点击"存储球杆"
- 应该能看到可用的储物柜列表

#### 2.2 存储球杆流程
1. 登录后进入存储页面
2. 选择储物柜
3. 确认信息
4. 生成凭证

#### 2.3 取回球杆流程
1. 点击"取回球杆"
2. 输入或扫描凭证码
3. 确认取回

### 3. 处理跨域问题

如果遇到跨域错误，有以下解决方案：

#### 方案 1：后端添加 CORS 配置
在 Spring Boot 后端添加 CORS 配置类。

#### 方案 2：使用代理（推荐用于开发）
在 `vue.config.js` 中配置代理：

```javascript
module.exports = {
  devServer: {
    proxy: {
      '/wx': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
}
```

## 常见问题

### Q: 登录失败，提示"请登录"
A: 检查以下几点：
1. 后端服务是否正常运行
2. API 路径是否正确
3. Token 是否正确传递（请求头：X-Litemall-Token）

### Q: 网络请求失败
A: 检查：
1. 后端服务端口是否为 8080
2. 防火墙是否阻止了请求
3. 查看浏览器控制台的具体错误信息

### Q: 微信登录在 H5 中如何测试？
A: 可以创建一个测试登录页面，使用以下模拟数据：
```javascript
// 模拟微信登录
const testLogin = async () => {
  const res = await loginByWeixin({
    code: 'test_code_123',
    userInfo: {
      nickName: '测试用户',
      avatarUrl: 'https://example.com/avatar.jpg',
      gender: 1
    }
  })
  // 保存 token
  if (res.token) {
    saveToken(res.token, res.tokenExpire)
  }
}
```

## 部署准备

1. 修改 `utils/request.js` 中的生产环境 API 地址
2. 构建生产版本：`npm run build:mp-weixin`
3. 在微信公众平台配置服务器域名白名单

## 后续优化

1. 实现真实的微信登录流程
2. 添加错误重试机制
3. 优化加载状态展示
4. 添加网络状态检测