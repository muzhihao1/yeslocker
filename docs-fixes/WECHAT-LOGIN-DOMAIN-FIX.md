# 微信小程序登录域名问题解决方案

## 问题描述

1. **域名校验错误**: 小程序无法访问 `http://localhost:8080`，提示"不在 request 合法域名列表中"
2. **静态资源缺失**: `/static/storage-intro.png` 文件不存在，返回500错误
3. **getUserProfile频繁调用**: 登录函数可能被重复调用

## 解决方案

### 方案一：开发环境快速解决（推荐）

#### 1. 在微信开发者工具中关闭域名校验

在微信开发者工具中：
1. 点击右上角"详情"按钮
2. 找到"本地设置"标签
3. 勾选以下选项：
   - ✅ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
   - ✅ 不校验小程序代码编译和自动热重载时的文件校验

> 注意：这个设置只在开发环境有效，不影响线上版本

#### 2. 创建缺失的静态资源

```bash
cd /Users/liasiloam/项目开发/杆柜管理/yeslocker/yeslocker-uniapp

# 创建占位图片
cp src/static/empty-locker.png src/static/storage-intro.png

# 或者创建一个简单的占位图
echo "This is a placeholder for storage-intro.png" > src/static/storage-intro-placeholder.txt
```

#### 3. 修复登录频繁调用问题

检查登录代码是否有防抖处理。如果没有，需要添加防抖逻辑。

### 方案二：生产环境部署方案

#### 1. 配置小程序后台域名

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" → "开发设置" → "服务器域名"
3. 添加以下域名：
   - request合法域名：`https://api.yeslocker.com`（你的生产环境API域名）
   - uploadFile合法域名：`https://api.yeslocker.com`
   - downloadFile合法域名：`https://api.yeslocker.com`

#### 2. 部署后端到HTTPS域名

生产环境必须使用HTTPS协议，且不能使用IP地址或非标准端口。

### 方案三：内网穿透方案（开发测试）

如果需要在真机上测试本地后端：

1. 使用内网穿透工具（如 ngrok、花生壳等）
2. 获取HTTPS临时域名
3. 修改 `src/config/api.js`：

```javascript
// 开发环境使用内网穿透地址
if (isDev) {
  return 'https://your-temp-domain.ngrok.io'
}
```

## 快速修复步骤

1. **立即修复**（在微信开发者工具中）：
   - 在工具栏找到"详情" → "本地设置"
   - 勾选"不校验合法域名..."选项
   - 重新编译项目

2. **创建缺失图片**：
```bash
# 在项目根目录执行
cd yeslocker/yeslocker-uniapp/src/static
# 复制一个现有图片作为占位
cp empty-locker.png storage-intro.png
```

3. **确保后端正在运行**：
```bash
# 检查后端是否启动
curl http://localhost:8080/wx/auth/info

# 如果没有启动，运行：
cd /Users/liasiloam/项目开发/杆柜管理/yeslocker
./start-backend.sh
```

## 验证修复

1. 重新编译小程序
2. 尝试登录功能
3. 检查控制台是否还有域名错误

## 注意事项

- 开发环境可以使用 http://localhost
- 生产环境必须使用 HTTPS 域名
- 域名必须在小程序后台配置
- 不能使用 IP 地址或带端口的域名（除80/443外）

## 长期解决方案

1. 将所有需要的静态资源文件准备好
2. 为开发环境配置一个稳定的测试域名
3. 在登录函数中添加防抖和错误处理
4. 确保项目文档中包含完整的环境配置说明