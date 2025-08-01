# VoucherCode 凭证码组件

## 组件介绍

VoucherCode 是一个用于展示存取凭证的原子组件。支持二维码和数字码两种展示形式，常用于存储凭证页面、凭证详情页等场景。

## 基础用法

```vue
<template>
  <voucher-code 
    :voucher-data="voucherInfo"
    @qr-click="handleQrClick"
  />
</template>

<script>
import VoucherCode from '@/components/atoms/VoucherCode.vue'

export default {
  components: {
    VoucherCode
  },
  data() {
    return {
      voucherInfo: {
        code: 'YE2025072300001',
        qrCode: '/static/qr-code.png',
        expiryDate: '2025-08-22',
        lockerNumber: 'A01'
      }
    }
  },
  methods: {
    handleQrClick() {
      console.log('二维码被点击')
    }
  }
}
</script>
```

## API 文档

### Props

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| voucherData | Object | {} | 是 | 凭证数据对象 |
| voucherData.code | String | - | 是 | 凭证码 |
| voucherData.qrCode | String | - | 否 | 二维码图片路径 |
| voucherData.expiryDate | String | - | 否 | 有效期 |
| voucherData.lockerNumber | String | - | 否 | 储物柜编号 |
| showQrCode | Boolean | true | 否 | 是否显示二维码 |
| showDigitalCode | Boolean | true | 否 | 是否显示数字码 |
| size | String | normal | 否 | 尺寸：small/normal/large |
| theme | String | default | 否 | 主题：default/dark/compact |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| qr-click | voucherData | 点击二维码时触发 |
| code-click | voucherData | 点击数字码时触发 |
| copy | code | 复制凭证码时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| header | 自定义头部内容 |
| footer | 自定义底部内容 |

## 展示样式

### 1. 默认样式
```vue
<voucher-code 
  :voucher-data="voucherInfo"
/>
```

### 2. 仅显示二维码
```vue
<voucher-code 
  :voucher-data="voucherInfo"
  :show-digital-code="false"
/>
```

### 3. 仅显示数字码
```vue
<voucher-code 
  :voucher-data="voucherInfo"
  :show-qr-code="false"
/>
```

### 4. 紧凑模式
```vue
<voucher-code 
  :voucher-data="voucherInfo"
  theme="compact"
  size="small"
/>
```

## 高级用法

### 带操作按钮的凭证展示

```vue
<template>
  <view class="voucher-container">
    <voucher-code 
      :voucher-data="voucherInfo"
      @qr-click="handleQrClick"
      @copy="handleCopy"
    >
      <template #footer>
        <view class="action-buttons">
          <button class="action-btn" @click="saveToAlbum">
            保存到相册
          </button>
          <button class="action-btn primary" @click="shareVoucher">
            分享凭证
          </button>
        </view>
      </template>
    </voucher-code>
  </view>
</template>

<script>
export default {
  data() {
    return {
      voucherInfo: {
        code: 'YE2025072300001',
        qrCode: '/static/qr-code.png',
        expiryDate: '2025-08-22',
        lockerNumber: 'A01'
      }
    }
  },
  methods: {
    handleQrClick() {
      // 预览二维码
      uni.previewImage({
        urls: [this.voucherInfo.qrCode],
        longPressActions: {
          itemList: ['保存图片'],
          success: (data) => {
            if (data.tapIndex === 0) {
              this.saveToAlbum()
            }
          }
        }
      })
    },
    handleCopy(code) {
      uni.setClipboardData({
        data: code,
        success: () => {
          uni.showToast({
            title: '凭证码已复制',
            icon: 'success'
          })
        }
      })
    },
    saveToAlbum() {
      uni.saveImageToPhotosAlbum({
        filePath: this.voucherInfo.qrCode,
        success: () => {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    },
    shareVoucher() {
      // #ifdef MP-WEIXIN
      uni.showShareMenu({
        withShareTicket: true
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.voucher-container {
  padding: 32rpx;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
  
  .action-btn {
    flex: 1;
    height: 80rpx;
    background-color: #f5f5f5;
    color: #333333;
    border: none;
    border-radius: 40rpx;
    font-size: 28rpx;
    
    &.primary {
      background-color: #1890ff;
      color: #ffffff;
    }
  }
}
</style>
```

### 凭证列表展示

```vue
<template>
  <view class="voucher-list">
    <view 
      v-for="voucher in vouchers" 
      :key="voucher.code"
      class="voucher-item"
    >
      <voucher-code 
        :voucher-data="voucher"
        theme="compact"
        size="small"
        @code-click="viewVoucherDetail"
      >
        <template #header>
          <view class="voucher-status" :class="voucher.status">
            <text>{{ getStatusText(voucher.status) }}</text>
          </view>
        </template>
      </voucher-code>
    </view>
  </view>
</template>

<script>
import VoucherCode from '@/components/atoms/VoucherCode.vue'

export default {
  components: {
    VoucherCode
  },
  data() {
    return {
      vouchers: [
        {
          code: 'YE2025072300001',
          qrCode: '/static/qr1.png',
          expiryDate: '2025-08-22',
          lockerNumber: 'A01',
          status: 'active'
        },
        {
          code: 'YE2025072200002',
          qrCode: '/static/qr2.png',
          expiryDate: '2025-07-22',
          lockerNumber: 'B03',
          status: 'expired'
        },
        {
          code: 'YE2025072100003',
          qrCode: '/static/qr3.png',
          expiryDate: '2025-07-21',
          lockerNumber: 'C05',
          status: 'used'
        }
      ]
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        active: '使用中',
        expired: '已过期',
        used: '已取回'
      }
      return statusMap[status] || '未知'
    },
    viewVoucherDetail(voucher) {
      uni.navigateTo({
        url: `/pages/voucher/detail?code=${voucher.code}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.voucher-list {
  padding: 24rpx;
  
  .voucher-item {
    margin-bottom: 24rpx;
    background-color: #ffffff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  }
  
  .voucher-status {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    
    &.active {
      background-color: #f6ffed;
      color: #52c41a;
    }
    
    &.expired {
      background-color: #fff1f0;
      color: #ff4d4f;
    }
    
    &.used {
      background-color: #f0f0f0;
      color: #999999;
    }
  }
}
</style>
```

## 样式定制

### CSS 变量

```css
.voucher-code {
  --voucher-bg: #ffffff;
  --voucher-border-color: #e8e8e8;
  --voucher-text-primary: #333333;
  --voucher-text-secondary: #999999;
  --voucher-qr-size: 300rpx;
  --voucher-code-font-size: 48rpx;
  --voucher-radius: 16rpx;
}
```

### 主题样式

#### Dark 主题
```vue
<voucher-code 
  :voucher-data="voucherInfo"
  theme="dark"
/>
```

#### Compact 主题
```vue
<voucher-code 
  :voucher-data="voucherInfo"
  theme="compact"
/>
```

## 完整示例

```vue
<template>
  <view class="voucher-page">
    <!-- 主要凭证展示 -->
    <voucher-code 
      :voucher-data="currentVoucher"
      size="large"
      @qr-click="previewQrCode"
      @copy="copyVoucherCode"
    >
      <template #header>
        <view class="voucher-header">
          <text class="title">存储凭证</text>
          <text class="subtitle">请妥善保管您的凭证</text>
        </view>
      </template>
      
      <template #footer>
        <view class="voucher-info">
          <view class="info-item">
            <text class="label">储物柜：</text>
            <text class="value">{{ currentVoucher.lockerNumber }}</text>
          </view>
          <view class="info-item">
            <text class="label">有效期至：</text>
            <text class="value">{{ currentVoucher.expiryDate }}</text>
          </view>
          <view class="info-item" v-if="daysRemaining > 0">
            <text class="label">剩余天数：</text>
            <text class="value" :class="{ warning: daysRemaining < 7 }">
              {{ daysRemaining }}天
            </text>
          </view>
        </view>
        
        <view class="action-section">
          <button class="save-btn" @click="saveVoucher">
            <text class="icon">💾</text>
            <text>保存凭证</text>
          </button>
          <button class="share-btn" @click="shareVoucher">
            <text class="icon">📤</text>
            <text>分享给他人</text>
          </button>
        </view>
      </template>
    </voucher-code>
    
    <!-- 使用说明 -->
    <view class="instructions">
      <view class="instruction-title">使用说明</view>
      <view class="instruction-item">
        1. 取回球杆时请出示此凭证
      </view>
      <view class="instruction-item">
        2. 可以使用二维码或数字码
      </view>
      <view class="instruction-item">
        3. 请在有效期内取回球杆
      </view>
      <view class="instruction-item">
        4. 超期将收取额外保管费
      </view>
    </view>
  </view>
</template>

<script>
import VoucherCode from '@/components/atoms/VoucherCode.vue'

export default {
  components: {
    VoucherCode
  },
  data() {
    return {
      currentVoucher: {
        code: 'YE2025072300001',
        qrCode: '/static/voucher-qr.png',
        expiryDate: '2025-08-22',
        lockerNumber: 'A01'
      }
    }
  },
  computed: {
    daysRemaining() {
      const today = new Date()
      const expiry = new Date(this.currentVoucher.expiryDate)
      const diffTime = expiry - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    }
  },
  methods: {
    previewQrCode() {
      uni.previewImage({
        urls: [this.currentVoucher.qrCode],
        current: 0
      })
    },
    copyVoucherCode(code) {
      uni.setClipboardData({
        data: code,
        success: () => {
          uni.showToast({
            title: '凭证码已复制',
            icon: 'success'
          })
        }
      })
    },
    saveVoucher() {
      // 保存到相册
      uni.saveImageToPhotosAlbum({
        filePath: this.currentVoucher.qrCode,
        success: () => {
          uni.showToast({
            title: '已保存到相册',
            icon: 'success'
          })
        }
      })
    },
    shareVoucher() {
      // 分享功能
      // #ifdef MP-WEIXIN
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        title: '我的存储凭证',
        summary: `凭证码：${this.currentVoucher.code}`,
        imageUrl: this.currentVoucher.qrCode
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.voucher-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding: 32rpx;
}

.voucher-header {
  text-align: center;
  margin-bottom: 32rpx;
  
  .title {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 8rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: #999999;
  }
}

.voucher-info {
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      font-size: 28rpx;
      color: #666666;
    }
    
    .value {
      font-size: 28rpx;
      color: #333333;
      font-weight: 500;
      
      &.warning {
        color: #ff4d4f;
      }
    }
  }
}

.action-section {
  display: flex;
  gap: 24rpx;
  
  button {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
    
    .icon {
      margin-right: 8rpx;
      font-size: 32rpx;
    }
  }
  
  .save-btn {
    background-color: #f0f0f0;
    color: #333333;
  }
  
  .share-btn {
    background-color: #1890ff;
    color: #ffffff;
  }
}

.instructions {
  margin-top: 48rpx;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  
  .instruction-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 24rpx;
  }
  
  .instruction-item {
    font-size: 28rpx;
    color: #666666;
    line-height: 1.6;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
```

## 注意事项

1. **二维码生成**：如果未提供 qrCode 路径，组件会根据 code 自动生成二维码
2. **过期提醒**：建议在凭证快过期时（如剩余7天）给予明显提示
3. **安全性**：凭证码应该具有足够的复杂度，避免被猜测
4. **复制功能**：点击数字码默认会触发复制操作
5. **图片保存**：保存二维码需要用户授权相册权限
6. **分享限制**：不同平台的分享功能可能有所差异

## 更新日志

- 2025-07-23：创建组件文档
- 2025-07-23：添加主题支持
- 2025-07-23：添加插槽功能