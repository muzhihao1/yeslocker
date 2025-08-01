# StorageFlow 存储流程组件

## 组件介绍

StorageFlow 是一个完整的球杆存储流程管理分子组件。整合了身份验证、储物柜选择、信息确认、凭证生成等多个步骤，提供流畅的存储体验。该组件管理整个存储工作流，确保每个步骤都正确完成。

## 基础用法

```vue
<template>
  <storage-flow 
    :user-info="userInfo"
    @complete="handleStorageComplete"
    @cancel="handleCancel"
  />
</template>

<script>
import StorageFlow from '@/components/molecules/StorageFlow.vue'

export default {
  components: {
    StorageFlow
  },
  data() {
    return {
      userInfo: {
        userId: '12345',
        name: '张三',
        phone: '13800138000',
        verified: true
      }
    }
  },
  methods: {
    handleStorageComplete(result) {
      console.log('存储完成:', result)
      // result 包含凭证信息、储物柜信息等
      uni.redirectTo({
        url: `/pages/storage/success?voucherId=${result.voucherId}`
      })
    },
    handleCancel() {
      uni.showModal({
        title: '提示',
        content: '确定要取消存储吗？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    }
  }
}
</script>
```

## API 文档

### Props

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| userInfo | Object | {} | 否 | 用户信息对象 |
| initialStep | Number | 1 | 否 | 初始步骤 |
| skipVerify | Boolean | false | 否 | 是否跳过身份验证 |
| lockerType | String | all | 否 | 储物柜类型筛选 |
| maxStorageTime | Number | 30 | 否 | 最大存储天数 |
| showProgress | Boolean | true | 否 | 是否显示进度条 |
| allowMultiple | Boolean | false | 否 | 是否允许存储多个球杆 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| complete | result | 存储流程完成时触发 |
| cancel | - | 取消流程时触发 |
| step-change | step | 步骤变化时触发 |
| error | error | 发生错误时触发 |
| locker-select | locker | 选择储物柜时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| header | 自定义头部内容 |
| step-{n} | 自定义特定步骤内容 |
| footer | 自定义底部内容 |

### Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| nextStep | - | 进入下一步 |
| prevStep | - | 返回上一步 |
| jumpToStep | step | 跳转到指定步骤 |
| reset | - | 重置流程 |
| validateCurrentStep | - | 验证当前步骤 |

## 流程步骤

### 默认流程（4步）

```vue
<storage-flow 
  :show-progress="true"
  @step-change="onStepChange"
>
  <!-- 步骤1：身份验证 -->
  <template #step-1>
    <view class="step-content">
      <text class="step-title">身份验证</text>
      <text class="step-desc">首次使用需要验证身份</text>
    </view>
  </template>
  
  <!-- 步骤2：选择储物柜 -->
  <template #step-2>
    <view class="step-content">
      <text class="step-title">选择储物柜</text>
      <text class="step-desc">请选择合适的储物柜</text>
    </view>
  </template>
  
  <!-- 步骤3：确认信息 -->
  <template #step-3>
    <view class="step-content">
      <text class="step-title">确认信息</text>
      <text class="step-desc">请核对存储信息</text>
    </view>
  </template>
  
  <!-- 步骤4：生成凭证 -->
  <template #step-4>
    <view class="step-content">
      <text class="step-title">生成凭证</text>
      <text class="step-desc">凭证是取回球杆的唯一凭据</text>
    </view>
  </template>
</storage-flow>
```

## 高级用法

### 自定义流程控制

```vue
<template>
  <view class="storage-page">
    <storage-flow 
      ref="storageFlow"
      :user-info="userInfo"
      :initial-step="currentStep"
      :skip-verify="isVerified"
      @step-change="handleStepChange"
      @locker-select="handleLockerSelect"
      @complete="handleComplete"
    >
      <!-- 自定义进度展示 -->
      <template #header>
        <view class="custom-progress">
          <view 
            v-for="(step, index) in steps" 
            :key="index"
            class="progress-item"
            :class="{ 
              active: index + 1 === currentStep,
              completed: index + 1 < currentStep 
            }"
          >
            <view class="step-circle">{{ index + 1 }}</view>
            <text class="step-name">{{ step }}</text>
          </view>
        </view>
      </template>
      
      <!-- 自定义储物柜选择 -->
      <template #step-2>
        <view class="locker-selection">
          <view class="filter-bar">
            <picker 
              mode="selector" 
              :range="sizeOptions" 
              @change="onSizeChange"
            >
              <view class="filter-item">
                <text>尺寸：{{ selectedSize }}</text>
                <text class="arrow">▼</text>
              </view>
            </picker>
            
            <view class="filter-item" @click="toggleVipOnly">
              <text>VIP专属</text>
              <switch :checked="vipOnly" />
            </view>
          </view>
          
          <view class="locker-grid">
            <locker-item 
              v-for="locker in filteredLockers"
              :key="locker.id"
              :locker="locker"
              :selected="selectedLocker?.id === locker.id"
              @click="selectLocker(locker)"
            />
          </view>
        </view>
      </template>
      
      <!-- 自定义确认页面 -->
      <template #step-3>
        <view class="confirm-info">
          <view class="info-card">
            <view class="info-item">
              <text class="label">储物柜编号</text>
              <text class="value">{{ selectedLocker.number }}</text>
            </view>
            <view class="info-item">
              <text class="label">存储物品</text>
              <text class="value">台球杆 × {{ itemCount }}</text>
            </view>
            <view class="info-item">
              <text class="label">预计存储时间</text>
              <picker 
                mode="selector" 
                :range="durationOptions" 
                @change="onDurationChange"
              >
                <view class="value picker">
                  {{ selectedDuration }}
                  <text class="arrow">▼</text>
                </view>
              </picker>
            </view>
            <view class="info-item">
              <text class="label">费用估算</text>
              <text class="value price">¥{{ estimatedCost }}</text>
            </view>
          </view>
          
          <view class="notes">
            <textarea 
              v-model="notes"
              placeholder="备注信息（选填）"
              maxlength="200"
            />
          </view>
        </view>
      </template>
    </storage-flow>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button 
        class="btn-prev" 
        v-if="currentStep > 1"
        @click="goPrevStep"
      >
        上一步
      </button>
      <button 
        class="btn-next" 
        :class="{ 'full-width': currentStep === 1 }"
        @click="goNextStep"
      >
        {{ currentStep === 4 ? '完成' : '下一步' }}
      </button>
    </view>
  </view>
</template>

<script>
import StorageFlow from '@/components/molecules/StorageFlow.vue'
import LockerItem from '@/components/atoms/LockerItem.vue'

export default {
  components: {
    StorageFlow,
    LockerItem
  },
  data() {
    return {
      currentStep: 1,
      steps: ['身份验证', '选择储物柜', '确认信息', '生成凭证'],
      userInfo: {},
      isVerified: false,
      
      // 储物柜选择
      selectedSize: '中号',
      sizeOptions: ['小号', '中号', '大号'],
      vipOnly: false,
      lockers: [],
      filteredLockers: [],
      selectedLocker: null,
      
      // 确认信息
      itemCount: 1,
      selectedDuration: '7天',
      durationOptions: ['1天', '3天', '7天', '15天', '30天'],
      notes: '',
      estimatedCost: 0
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadLockers()
  },
  methods: {
    async loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
        this.isVerified = userInfo.verified || false
      }
    },
    
    async loadLockers() {
      try {
        const res = await this.$api.locker.getAvailableLockers()
        this.lockers = res.data
        this.filterLockers()
      } catch (error) {
        console.error('加载储物柜失败:', error)
      }
    },
    
    handleStepChange(step) {
      this.currentStep = step
    },
    
    handleLockerSelect(locker) {
      this.selectedLocker = locker
      this.calculateCost()
    },
    
    selectLocker(locker) {
      if (locker.status === 'available') {
        this.selectedLocker = locker
        this.calculateCost()
      } else if (locker.status === 'vip' && !this.userInfo.isVip) {
        uni.showToast({
          title: '需要VIP会员',
          icon: 'none'
        })
      }
    },
    
    filterLockers() {
      this.filteredLockers = this.lockers.filter(locker => {
        if (this.vipOnly && locker.status !== 'vip') return false
        if (this.selectedSize !== '全部' && locker.size !== this.selectedSize) {
          return false
        }
        return true
      })
    },
    
    onSizeChange(e) {
      this.selectedSize = this.sizeOptions[e.detail.value]
      this.filterLockers()
    },
    
    toggleVipOnly() {
      this.vipOnly = !this.vipOnly
      this.filterLockers()
    },
    
    onDurationChange(e) {
      this.selectedDuration = this.durationOptions[e.detail.value]
      this.calculateCost()
    },
    
    calculateCost() {
      if (!this.selectedLocker) return
      
      const durationMap = {
        '1天': 1,
        '3天': 3,
        '7天': 7,
        '15天': 15,
        '30天': 30
      }
      
      const days = durationMap[this.selectedDuration] || 7
      const dailyRate = this.selectedLocker.dailyRate || 10
      this.estimatedCost = days * dailyRate * this.itemCount
      
      // VIP折扣
      if (this.userInfo.isVip) {
        this.estimatedCost = Math.floor(this.estimatedCost * 0.8)
      }
    },
    
    async goNextStep() {
      // 验证当前步骤
      const isValid = await this.$refs.storageFlow.validateCurrentStep()
      if (!isValid) return
      
      if (this.currentStep < 4) {
        this.$refs.storageFlow.nextStep()
      } else {
        // 完成存储
        this.submitStorage()
      }
    },
    
    goPrevStep() {
      this.$refs.storageFlow.prevStep()
    },
    
    async submitStorage() {
      uni.showLoading({
        title: '正在提交...'
      })
      
      try {
        const data = {
          userId: this.userInfo.userId,
          lockerId: this.selectedLocker.id,
          itemCount: this.itemCount,
          duration: this.selectedDuration,
          notes: this.notes,
          estimatedCost: this.estimatedCost
        }
        
        const res = await this.$api.locker.store(data)
        
        uni.hideLoading()
        
        // 触发完成事件
        this.handleComplete(res.data)
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '存储失败',
          icon: 'none'
        })
      }
    },
    
    handleComplete(result) {
      // 保存凭证信息
      uni.setStorageSync('latestVoucher', result.voucher)
      
      // 跳转到成功页面
      uni.redirectTo({
        url: `/pages/storage/success?voucherId=${result.voucher.id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.storage-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 120rpx;
}

.custom-progress {
  display: flex;
  justify-content: space-between;
  padding: 32rpx;
  background-color: #ffffff;
  
  .progress-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    .step-circle {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #e8e8e8;
      color: #999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      margin-bottom: 8rpx;
      transition: all 0.3s;
    }
    
    .step-name {
      font-size: 24rpx;
      color: #999999;
      transition: all 0.3s;
    }
    
    &.active {
      .step-circle {
        background-color: #1890ff;
        color: #ffffff;
        transform: scale(1.1);
      }
      .step-name {
        color: #1890ff;
        font-weight: 500;
      }
    }
    
    &.completed {
      .step-circle {
        background-color: #52c41a;
        color: #ffffff;
      }
      .step-name {
        color: #52c41a;
      }
    }
  }
}

.locker-selection {
  padding: 24rpx;
  
  .filter-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24rpx;
    padding: 24rpx;
    background-color: #ffffff;
    border-radius: 16rpx;
    
    .filter-item {
      display: flex;
      align-items: center;
      
      .arrow {
        margin-left: 8rpx;
        color: #999999;
      }
    }
  }
  
  .locker-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
  }
}

.confirm-info {
  padding: 24rpx;
  
  .info-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        font-size: 30rpx;
        color: #666666;
      }
      
      .value {
        font-size: 30rpx;
        color: #333333;
        font-weight: 500;
        
        &.picker {
          display: flex;
          align-items: center;
          
          .arrow {
            margin-left: 8rpx;
            color: #999999;
          }
        }
        
        &.price {
          color: #ff4d4f;
          font-size: 36rpx;
        }
      }
    }
  }
  
  .notes {
    textarea {
      width: 100%;
      height: 200rpx;
      padding: 24rpx;
      background-color: #ffffff;
      border-radius: 16rpx;
      font-size: 28rpx;
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 24rpx;
  
  button {
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    
    &.btn-prev {
      flex: 1;
      background-color: #f0f0f0;
      color: #333333;
    }
    
    &.btn-next {
      flex: 2;
      background-color: #1890ff;
      color: #ffffff;
      
      &.full-width {
        flex: 1;
      }
    }
  }
}
</style>
```

### 快速存储模式

```vue
<template>
  <storage-flow 
    ref="quickStorage"
    mode="quick"
    :skip-verify="true"
    :auto-select-locker="true"
    @complete="handleQuickComplete"
  >
    <template #quick-mode>
      <view class="quick-storage">
        <view class="scan-area" @click="scanLocker">
          <image src="/static/scan-icon.png" class="scan-icon" />
          <text>扫描储物柜二维码</text>
        </view>
        
        <view class="or-divider">
          <text>或</text>
        </view>
        
        <input 
          v-model="lockerCode"
          type="text"
          placeholder="输入储物柜编号"
          @confirm="submitQuickStorage"
        />
        
        <button 
          class="quick-btn"
          :disabled="!lockerCode"
          @click="submitQuickStorage"
        >
          快速存储
        </button>
      </view>
    </template>
  </storage-flow>
</template>

<script>
export default {
  data() {
    return {
      lockerCode: ''
    }
  },
  methods: {
    async scanLocker() {
      const res = await uni.scanCode({
        onlyFromCamera: true
      })
      
      if (res.result) {
        this.lockerCode = res.result
        this.submitQuickStorage()
      }
    },
    
    async submitQuickStorage() {
      if (!this.lockerCode) return
      
      // 调用快速存储接口
      this.$refs.quickStorage.quickStore(this.lockerCode)
    },
    
    handleQuickComplete(result) {
      uni.showToast({
        title: '存储成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/voucher/detail?id=${result.voucherId}`
        })
      }, 1500)
    }
  }
}
</script>
```

## 错误处理

```vue
<template>
  <storage-flow 
    @error="handleError"
    :error-recovery="true"
  >
    <template #error="{ error, retry }">
      <view class="error-page">
        <image src="/static/error-icon.png" class="error-icon" />
        <text class="error-title">{{ getErrorTitle(error.code) }}</text>
        <text class="error-message">{{ error.message }}</text>
        
        <view class="error-actions">
          <button class="retry-btn" @click="retry">
            重试
          </button>
          <button class="help-btn" @click="getHelp">
            获取帮助
          </button>
        </view>
      </view>
    </template>
  </storage-flow>
</template>

<script>
export default {
  methods: {
    handleError(error) {
      // 记录错误日志
      this.logError(error)
      
      // 根据错误类型处理
      switch (error.code) {
        case 'NETWORK_ERROR':
          this.handleNetworkError()
          break
        case 'LOCKER_UNAVAILABLE':
          this.handleLockerError()
          break
        case 'PAYMENT_FAILED':
          this.handlePaymentError()
          break
        default:
          this.showErrorModal(error)
      }
    },
    
    getErrorTitle(code) {
      const titles = {
        'NETWORK_ERROR': '网络连接失败',
        'LOCKER_UNAVAILABLE': '储物柜不可用',
        'PAYMENT_FAILED': '支付失败',
        'VERIFY_FAILED': '验证失败'
      }
      return titles[code] || '操作失败'
    },
    
    handleNetworkError() {
      uni.showToast({
        title: '请检查网络连接',
        icon: 'none'
      })
    },
    
    handleLockerError() {
      uni.showModal({
        title: '储物柜不可用',
        content: '该储物柜已被占用或维护中，请选择其他储物柜',
        confirmText: '重新选择',
        success: (res) => {
          if (res.confirm) {
            this.$refs.storageFlow.jumpToStep(2)
          }
        }
      })
    },
    
    handlePaymentError() {
      uni.showModal({
        title: '支付失败',
        content: '请检查支付方式或余额',
        confirmText: '重新支付',
        cancelText: '取消存储'
      })
    },
    
    showErrorModal(error) {
      uni.showModal({
        title: '提示',
        content: error.message,
        showCancel: false
      })
    },
    
    logError(error) {
      // 上报错误日志
      console.error('Storage flow error:', error)
      
      // 发送到日志服务器
      this.$api.log.reportError({
        type: 'storage_flow_error',
        error: {
          code: error.code,
          message: error.message,
          stack: error.stack,
          step: this.currentStep
        }
      })
    },
    
    getHelp() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      })
    }
  }
}
</script>
```

## 样式定制

### CSS 变量

```css
.storage-flow {
  --flow-primary-color: #1890ff;
  --flow-success-color: #52c41a;
  --flow-warning-color: #faad14;
  --flow-error-color: #ff4d4f;
  --flow-bg-color: #f5f6f7;
  --flow-card-bg: #ffffff;
  --flow-text-primary: #333333;
  --flow-text-secondary: #666666;
  --flow-border-color: #e8e8e8;
  --flow-step-size: 80rpx;
}
```

## 注意事项

1. **流程完整性**：确保每个步骤都有适当的验证，防止跳过关键步骤
2. **数据持久化**：流程中断时保存用户进度，支持断点续传
3. **错误恢复**：提供友好的错误提示和恢复机制
4. **性能优化**：大量储物柜展示时使用虚拟列表
5. **用户体验**：提供清晰的进度指示和操作引导
6. **安全性**：敏感操作需要二次确认，防止误操作

## 更新日志

- 2025-07-23：创建组件文档
- 2025-07-23：添加快速存储模式
- 2025-07-23：增强错误处理机制