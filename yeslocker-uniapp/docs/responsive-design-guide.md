# 响应式设计指南

## 概述

本项目采用基于 **375px** 设计稿的响应式布局方案，使用 UniApp 的 `rpx` 单位确保在不同设备上的一致体验。

## 设计规范

### 基准说明
- 设计稿宽度：375px
- rpx 单位：750rpx = 100vw（屏幕宽度）
- 换算关系：1rpx = 0.5px（在 375px 宽度屏幕上）

### 单位使用规则
- **布局尺寸**：使用 `rpx` 单位（宽度、高度、内外边距等）
- **字体大小**：使用 `rpx` 单位确保响应式缩放
- **边框**：固定使用 `2rpx`
- **行高**：使用相对值（如 1.5）

## 全局变量

### 颜色系统

```scss
// 主题色
$uni-color-primary: #1890ff;    // 主色
$uni-color-success: #52c41a;    // 成功色
$uni-color-warning: #faad14;    // 警告色
$uni-color-error: #ff4d4f;      // 错误色

// 文字色
$uni-text-color: #333333;       // 主要文字
$uni-text-color-regular: #666666; // 常规文字
$uni-text-color-secondary: #999999; // 次要文字
$uni-text-color-placeholder: #c8c9cc; // 占位符

// 背景色
$uni-bg-color: #ffffff;         // 白色背景
$uni-bg-color-grey: #f5f6f7;   // 灰色背景
$uni-bg-color-hover: #f0f0f0;  // 点击态背景
```

### 字体大小

```scss
$uni-font-size-xs: 24rpx;   // 12px - 辅助说明
$uni-font-size-sm: 26rpx;   // 13px - 次要信息
$uni-font-size-base: 28rpx; // 14px - 基础大小
$uni-font-size-lg: 30rpx;   // 15px - 正文
$uni-font-size-xl: 32rpx;   // 16px - 按钮文字
$uni-font-size-xxl: 36rpx;  // 18px - 标题
$uni-font-size-xxxl: 40rpx; // 20px - 大标题
```

### 间距系统

基于 8 的倍数设计：

```scss
$uni-spacing-xs: 8rpx;      // 4px - 极小间距
$uni-spacing-sm: 16rpx;     // 8px - 小间距
$uni-spacing-base: 24rpx;   // 12px - 基础间距
$uni-spacing-md: 24rpx;     // 12px - 中等间距
$uni-spacing-lg: 32rpx;     // 16px - 大间距
$uni-spacing-xl: 48rpx;     // 24px - 特大间距
$uni-spacing-xxl: 64rpx;    // 32px - 超大间距
```

### 圆角系统

```scss
$uni-border-radius-sm: 8rpx;     // 小圆角
$uni-border-radius-base: 12rpx;  // 基础圆角
$uni-border-radius-lg: 16rpx;    // 大圆角
$uni-border-radius-xl: 24rpx;    // 特大圆角
$uni-border-radius-circle: 9999rpx; // 圆形
```

## 工具类使用

### 文字样式

```html
<!-- 字体大小 -->
<text class="text-xs">极小文字 12px</text>
<text class="text-sm">小号文字 13px</text>
<text class="text-base">基础文字 14px</text>
<text class="text-lg">大号文字 15px</text>
<text class="text-xl">特大文字 16px</text>
<text class="text-xxl">超大文字 18px</text>

<!-- 字体颜色 -->
<text class="text-primary">主题色文字</text>
<text class="text-success">成功色文字</text>
<text class="text-error">错误色文字</text>
<text class="text-regular">常规文字</text>
<text class="text-secondary">次要文字</text>

<!-- 字重 -->
<text class="font-normal">正常字重 400</text>
<text class="font-medium">中等字重 500</text>
<text class="font-bold">粗体字重 600</text>

<!-- 对齐 -->
<view class="text-center">居中对齐</view>
<view class="text-left">左对齐</view>
<view class="text-right">右对齐</view>
```

### 布局工具

```html
<!-- Flex 布局 -->
<view class="flex">基础 flex 容器</view>
<view class="flex-center">水平垂直居中</view>
<view class="flex-between">两端对齐</view>
<view class="flex-column">垂直排列</view>
<view class="flex-1">弹性伸缩</view>

<!-- 间距 -->
<view class="p-lg">四周内边距 16px</view>
<view class="px-lg">左右内边距 16px</view>
<view class="py-lg">上下内边距 16px</view>
<view class="mt-lg">上外边距 16px</view>
<view class="mb-lg">下外边距 16px</view>

<!-- 背景 -->
<view class="bg-white">白色背景</view>
<view class="bg-grey">灰色背景</view>
<view class="bg-primary">主题色背景</view>

<!-- 圆角 -->
<view class="rounded-sm">小圆角</view>
<view class="rounded-lg">大圆角</view>
<view class="rounded-full">圆形</view>

<!-- 阴影 -->
<view class="shadow-sm">小阴影</view>
<view class="shadow">基础阴影</view>
<view class="shadow-lg">大阴影</view>
```

### 组件样式

```html
<!-- 按钮 -->
<button class="btn btn-primary btn-block">主要按钮</button>
<button class="btn btn-default">默认按钮</button>
<button class="btn btn-text">文字按钮</button>
<button class="btn btn-lg">大号按钮</button>
<button class="btn btn-sm">小号按钮</button>

<!-- 卡片 -->
<view class="card">
  <view class="card-header">
    <text class="card-title">卡片标题</text>
  </view>
  <view class="card-body">
    卡片内容
  </view>
</view>

<!-- 列表 -->
<view class="list">
  <view class="list-item">列表项 1</view>
  <view class="list-item">列表项 2</view>
</view>

<!-- 标签 -->
<text class="tag tag-primary">主要标签</text>
<text class="tag tag-success">成功标签</text>
<text class="tag tag-warning">警告标签</text>
<text class="tag tag-error">错误标签</text>
```

### 实用工具

```html
<!-- 文本省略 -->
<text class="ellipsis">单行文本省略...</text>
<text class="ellipsis-2">两行文本省略...</text>
<text class="ellipsis-3">三行文本省略...</text>

<!-- 禁用选择 -->
<view class="no-select">禁止选中的文本</view>

<!-- 加载状态 -->
<view class="loading">加载中...</view>

<!-- 空状态 -->
<view class="empty">
  <image class="empty-image" src="/static/empty.png" />
  <text class="empty-text">暂无数据</text>
</view>

<!-- 固定定位 -->
<view class="fixed-bottom">固定在底部</view>
<view class="fixed-top">固定在顶部</view>

<!-- 浮动按钮 -->
<view class="fab">+</view>

<!-- 安全区域 -->
<view class="safe-area-inset-bottom">底部安全区域</view>
<view class="safe-area-inset-top">顶部安全区域</view>
```

## 响应式适配

### 断点设置

```scss
// 小屏幕（手机）
@media screen and (max-width: 375px) {
  .hide-xs { display: none !important; }
}

// 中等屏幕（平板）
@media screen and (min-width: 768px) {
  .hide-md { display: none !important; }
  .show-md { display: block !important; }
}
```

### 使用示例

```html
<!-- 在手机上隐藏，平板上显示 -->
<view class="hide-xs show-md">
  平板端显示的内容
</view>

<!-- 只在手机上显示 -->
<view class="hide-md">
  手机端显示的内容
</view>
```

## 最佳实践

### 1. 统一使用设计变量

```scss
// ✅ 推荐
.my-component {
  padding: $uni-spacing-lg;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  border-radius: $uni-border-radius-lg;
}

// ❌ 避免
.my-component {
  padding: 32rpx;
  font-size: 28rpx;
  color: #333;
  border-radius: 16rpx;
}
```

### 2. 优先使用工具类

```html
<!-- ✅ 推荐 -->
<view class="flex-between p-lg bg-white rounded-lg shadow">
  <text class="text-lg font-medium">标题</text>
  <text class="text-sm text-secondary">副标题</text>
</view>

<!-- ❌ 避免写大量自定义样式 -->
<view style="display: flex; justify-content: space-between; padding: 32rpx;">
  <!-- ... -->
</view>
```

### 3. 组件内样式使用 SCSS

```vue
<style lang="scss" scoped>
.custom-component {
  // 使用全局变量
  background-color: $uni-bg-color;
  padding: $uni-spacing-lg;
  
  // 嵌套样式
  .title {
    font-size: $uni-font-size-xl;
    color: $uni-text-color;
    margin-bottom: $uni-spacing-sm;
  }
  
  // 响应式适配
  @media screen and (min-width: 768px) {
    padding: $uni-spacing-xl;
  }
}
</style>
```

### 4. 安全区域适配

```vue
<template>
  <!-- 适配顶部状态栏 -->
  <view class="safe-area-inset-top">
    <view class="header">页面标题</view>
  </view>
  
  <!-- 适配底部安全区域 -->
  <view class="fixed-bottom safe-area-inset-bottom">
    <button class="btn btn-primary btn-block">确定</button>
  </view>
</template>
```

## 注意事项

1. **rpx 单位**：在所有需要响应式的地方使用 rpx，不要使用 px
2. **设计稿换算**：设计稿上的 px 值直接 × 2 = rpx 值
3. **图片适配**：使用 `mode="aspectFit"` 或 `mode="aspectFill"` 确保图片正确显示
4. **测试设备**：在多种设备上测试，特别是 iPhone 6/7/8（375px）和 iPad
5. **性能优化**：避免过度嵌套，合理使用工具类

## 示例页面

```vue
<template>
  <view class="page">
    <!-- 页面头部 -->
    <view class="header safe-area-inset-top">
      <text class="header-title">页面标题</text>
    </view>
    
    <!-- 页面内容 -->
    <view class="content">
      <!-- 卡片列表 -->
      <view class="card mb-lg" v-for="item in list" :key="item.id">
        <view class="flex-between">
          <view class="flex-1">
            <text class="text-lg font-medium mb-xs">{{ item.title }}</text>
            <text class="text-sm text-secondary">{{ item.desc }}</text>
          </view>
          <button class="btn btn-sm btn-primary">操作</button>
        </view>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="footer fixed-bottom safe-area-inset-bottom">
      <button class="btn btn-primary btn-block btn-lg">确认提交</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
}

.header {
  background-color: $uni-bg-color;
  padding: $uni-spacing-lg;
  box-shadow: $uni-shadow-sm;
  
  &-title {
    font-size: $uni-font-size-xxl;
    font-weight: 600;
    color: $uni-text-color;
  }
}

.content {
  padding: $uni-spacing-lg;
  padding-bottom: calc(#{$uni-btn-height-lg} + #{$uni-spacing-lg} * 2);
}

.footer {
  padding: $uni-spacing-lg;
  background-color: $uni-bg-color;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.08);
}
</style>
```