# UserCard 用户卡片组件

## 组件介绍

UserCard 是一个用于展示用户基本信息的原子组件。通常用于个人中心、用户列表、评论区等需要展示用户信息的场景。

## 基础用法

```vue
<template>
  <user-card 
    :user-data="userInfo"
    @click="handleClick"
  />
</template>

<script>
import UserCard from '@/components/atoms/UserCard.vue'

export default {
  components: {
    UserCard
  },
  data() {
    return {
      userInfo: {
        name: '张三',
        phone: '13800138000',
        avatar: '/static/avatar.png',
        verified: true
      }
    }
  },
  methods: {
    handleClick() {
      console.log('用户卡片被点击')
    }
  }
}
</script>
```

## API 文档

### Props

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| userData | Object | {} | 是 | 用户数据对象 |
| userData.name | String | - | 是 | 用户姓名 |
| userData.phone | String | - | 否 | 用户手机号 |
| userData.avatar | String | /static/default-avatar.png | 否 | 用户头像 |
| userData.verified | Boolean | false | 否 | 是否已认证 |
| size | String | normal | 否 | 尺寸，可选值：small/normal/large |
| showPhone | Boolean | true | 否 | 是否显示手机号 |
| clickable | Boolean | true | 否 | 是否可点击 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | userData | 点击卡片时触发 |
| avatar-click | userData | 点击头像时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义卡片底部内容 |
| badge | 自定义徽章内容 |

## 高级用法

### 不同尺寸

```vue
<!-- 小尺寸 -->
<user-card 
  :user-data="userInfo"
  size="small"
/>

<!-- 正常尺寸 -->
<user-card 
  :user-data="userInfo"
  size="normal"
/>

<!-- 大尺寸 -->
<user-card 
  :user-data="userInfo"
  size="large"
/>
```

### 隐藏手机号

```vue
<user-card 
  :user-data="userInfo"
  :show-phone="false"
/>
```

### 使用插槽

```vue
<user-card :user-data="userInfo">
  <!-- 自定义底部内容 -->
  <template #default>
    <view class="custom-footer">
      <text>累计存储：12次</text>
    </view>
  </template>
  
  <!-- 自定义徽章 -->
  <template #badge>
    <view class="vip-badge">VIP</view>
  </template>
</user-card>
```

### 禁用点击

```vue
<user-card 
  :user-data="userInfo"
  :clickable="false"
/>
```

## 样式定制

### CSS 变量

组件提供了以下 CSS 变量供自定义：

```css
.user-card {
  --user-card-bg: #ffffff;
  --user-card-padding: 24rpx;
  --user-card-border-radius: 16rpx;
  --user-card-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  --user-card-hover-bg: #f5f5f5;
}
```

### 自定义样式示例

```vue
<template>
  <user-card 
    :user-data="userInfo"
    class="custom-user-card"
  />
</template>

<style lang="scss" scoped>
.custom-user-card {
  --user-card-bg: #f0f9ff;
  --user-card-border-radius: 24rpx;
  
  // 深度选择器修改内部样式
  :deep(.user-avatar) {
    border: 4rpx solid #1890ff;
  }
  
  :deep(.user-name) {
    color: #1890ff;
    font-weight: 600;
  }
}
</style>
```

## 完整示例

```vue
<template>
  <view class="page">
    <!-- 基础用法 -->
    <user-card 
      :user-data="userInfo"
      @click="handleUserClick"
      @avatar-click="handleAvatarClick"
    />
    
    <!-- 带自定义内容 -->
    <user-card 
      :user-data="vipUser"
      size="large"
      class="vip-card"
    >
      <template #badge>
        <view class="vip-badge">
          <text>钻石VIP</text>
        </view>
      </template>
      
      <template #default>
        <view class="user-stats">
          <view class="stat-item">
            <text class="stat-value">128</text>
            <text class="stat-label">存储次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">365</text>
            <text class="stat-label">累计天数</text>
          </view>
        </view>
      </template>
    </user-card>
  </view>
</template>

<script>
import UserCard from '@/components/atoms/UserCard.vue'

export default {
  components: {
    UserCard
  },
  data() {
    return {
      userInfo: {
        name: '张三',
        phone: '13800138000',
        avatar: '/static/avatar1.png',
        verified: true
      },
      vipUser: {
        name: '李四',
        phone: '13900139000',
        avatar: '/static/avatar2.png',
        verified: true
      }
    }
  },
  methods: {
    handleUserClick(userData) {
      uni.showToast({
        title: `点击了 ${userData.name}`,
        icon: 'none'
      })
    },
    handleAvatarClick(userData) {
      uni.previewImage({
        urls: [userData.avatar]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding: 32rpx;
  background-color: #f5f6f7;
}

.vip-card {
  margin-top: 24rpx;
  
  .vip-badge {
    padding: 4rpx 16rpx;
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #ffffff;
    font-size: 24rpx;
    border-radius: 20rpx;
  }
  
  .user-stats {
    display: flex;
    justify-content: space-around;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #1890ff;
      }
      
      .stat-label {
        display: block;
        font-size: 24rpx;
        color: #999999;
        margin-top: 8rpx;
      }
    }
  }
}
</style>
```

## 注意事项

1. **手机号格式化**：组件会自动将手机号格式化为 `138****8888` 的形式保护隐私
2. **默认头像**：如果未提供头像，会使用默认头像 `/static/default-avatar.png`
3. **点击反馈**：当 `clickable` 为 true 时，点击会有视觉反馈
4. **图片加载**：头像支持网络图片和本地图片，建议使用 CDN 加速
5. **性能优化**：在列表中使用时，建议配合虚拟列表优化性能

## 更新日志

- 2025-07-23：创建组件文档
- 2025-07-23：添加 size 属性支持
- 2025-07-23：添加插槽支持