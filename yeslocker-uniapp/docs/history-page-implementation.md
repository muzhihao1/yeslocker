# 历史记录页面实现文档

## 概述

历史记录页面（`/pages/user/history`）展示用户的所有存取操作记录，支持筛选、分页和统计功能。

## 功能特性

### 1. 记录展示
- 时间轴布局展示操作记录
- 区分存储和取回操作（不同颜色标识）
- 显示关键信息：时间、储物柜号、凭证码、状态
- 支持查看详情（点击跳转到申请详情页）

### 2. 筛选功能
- **全部**：显示所有记录
- **存储中**：仅显示当前活跃的存储记录
- **已完成**：显示已完成的操作记录
- 切换筛选时自动重新加载数据

### 3. 分页加载
- 每页10条记录
- 支持上拉加载更多
- 支持下拉刷新
- 加载状态提示

### 4. 统计功能
- 累计存储次数
- 累计取回次数
- 平均存储时长
- 通过浮动按钮查看统计面板

### 5. 空状态处理
- 无记录时显示友好的空状态插画
- 提供快捷入口跳转到存储页面

## API接口

### 获取历史记录
```javascript
GET /wx/locker/history

请求参数：
{
  page: 1,        // 页码
  size: 10,       // 每页数量
  type: 'store',  // 操作类型筛选（可选）
  status: 'active' // 状态筛选（可选）
}

响应数据：
{
  errno: 0,
  data: {
    list: [
      {
        id: 100,
        operationType: "store",
        lockerNumber: "A5",
        lockerId: 5,
        voucherCode: "20250127-1234",
        status: "active",
        createdAt: "2025-01-27T10:30:00Z",
        completedAt: null,
        notes: "红色球杆套",
        fee: 0,
        daysUsed: 2
      }
    ],
    pagination: {
      page: 1,
      size: 10,
      total: 45,
      hasMore: true
    }
  }
}
```

## 数据状态说明

### 操作类型（operationType）
- `store`: 存储操作
- `retrieve`: 取回操作

### 状态（status）
- `active`: 存储中（活跃状态）
- `completed`: 已完成
- `expired`: 已过期（超过30天）

## UI设计要点

### 1. 视觉区分
- 存储操作：绿色主题（📥图标）
- 取回操作：蓝色主题（📤图标）
- 状态标签：不同背景色区分

### 2. 时间显示
- 今天的记录：显示"今天 HH:mm"
- 昨天的记录：显示"昨天 HH:mm"
- 其他日期：显示"MM-DD HH:mm"
- 跨年记录：显示"YYYY-MM-DD HH:mm"

### 3. 凭证码格式化
- 原始格式：20250127XXXX
- 显示格式：2025-0127-XXXX（每4位一组）

### 4. 响应式设计
- 卡片式布局
- 适配不同屏幕尺寸
- 触摸友好的交互区域

## 实现细节

### 1. 组件结构
```vue
<template>
  <view class="history-page">
    <!-- 页面头部 -->
    <view class="page-header">...</view>
    
    <!-- 筛选标签 -->
    <view class="filter-tabs">...</view>
    
    <!-- 记录列表 -->
    <view class="records-list">...</view>
    
    <!-- 空状态 -->
    <view class="empty-state">...</view>
    
    <!-- 统计面板 -->
    <view class="stats-card">...</view>
    
    <!-- 浮动按钮 -->
    <view class="float-btn">...</view>
  </view>
</template>
```

### 2. 关键方法
- `loadRecords()`: 加载历史记录
- `loadStatistics()`: 加载统计数据
- `switchTab()`: 切换筛选标签
- `formatDateTime()`: 格式化时间显示
- `formatCode()`: 格式化凭证码

### 3. 性能优化
- 分页加载减少一次性数据量
- 使用计算属性过滤数据
- 延迟加载统计数据
- 图片懒加载

## Mock数据支持

在开发环境下，系统会自动拦截API请求并返回模拟数据：
- 生成20条模拟记录
- 支持分页和筛选
- 模拟不同状态和时间
- 便于开发测试

## 注意事项

1. **数据转换**：API返回的时间是ISO字符串，需要转换为时间戳
2. **状态映射**：确保状态值与后端保持一致
3. **错误处理**：网络错误时显示友好提示
4. **加载状态**：防止重复加载和并发请求

## 后续优化建议

1. 添加搜索功能（按凭证码搜索）
2. 支持日期范围筛选
3. 导出历史记录功能
4. 批量操作功能
5. 优化统计API，避免加载大量数据