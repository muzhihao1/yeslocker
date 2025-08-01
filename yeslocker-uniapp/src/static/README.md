# 静态资源目录

## 需要的图片资源列表

### 1. 空状态图片
- **empty-locker.png** - 储物柜空状态图（建议尺寸：200x200）
- **empty-history.png** - 历史记录空状态图（建议尺寸：200x200）

### 2. TabBar 图标（建议尺寸：81x81）
- **tabbar/home.png** - 首页图标
- **tabbar/home-active.png** - 首页选中图标
- **tabbar/storage.png** - 存杆图标
- **tabbar/storage-active.png** - 存杆选中图标
- **tabbar/shop.png** - 商城图标
- **tabbar/shop-active.png** - 商城选中图标
- **tabbar/user.png** - 我的图标
- **tabbar/user-active.png** - 我的选中图标

### 3. 功能图标
- **icon-scan.png** - 扫码图标
- **icon-voucher.png** - 凭证图标
- **icon-locker.png** - 储物柜图标
- **icon-vip.png** - VIP图标

### 4. 广告占位图（建议尺寸：750x300）
- **ad-banner-1.jpg** - 轮播广告1
- **ad-banner-2.jpg** - 轮播广告2
- **ad-banner-3.jpg** - 轮播广告3
- **ad-inline.jpg** - 插入式广告（建议尺寸：690x150）

### 5. 其他图片
- **default-avatar.png** - 默认头像（建议尺寸：120x120）
- **locker-available.png** - 可用储物柜图标
- **locker-occupied.png** - 已占用储物柜图标
- **success.png** - 操作成功图标

## 临时解决方案

在获取正式设计稿之前，可以：
1. 使用纯色块作为占位图
2. 使用在线图标库（如 iconfont）
3. 使用 UniApp 内置图标

## 图片格式建议

- PNG：用于需要透明背景的图标
- JPG：用于照片类图片（如广告图）
- 尺寸：参考微信小程序设计规范
- 压缩：使用 TinyPNG 等工具压缩