# RetrievalFlow 取回流程组件

## 组件介绍

RetrievalFlow 是一个完整的球杆取回流程管理分子组件。包含凭证验证、费用计算、超期处理、确认取回等功能，确保用户能够安全、便捷地取回存储的球杆。

## 基础用法

```vue
<template>
  <retrieval-flow 
    :initial-code="voucherCode"
    @complete="handleRetrievalComplete"
    @cancel="handleCancel"
  />
</template>

<script>
import RetrievalFlow from '@/components/molecules/RetrievalFlow.vue'

export default {
  components: {
    RetrievalFlow
  },
  data() {
    return {
      voucherCode: '' // 可以预填凭证码
    }
  },
  onLoad(options) {
    // 从扫码或其他页面传入的凭证码
    if (options.code) {
      this.voucherCode = options.code
    }
  },
  methods: {
    handleRetrievalComplete(result) {
      console.log('取回完成:', result)
      uni.showToast({
        title: '取回成功',
        icon: 'success'
      })
      
      // 跳转到成功页面
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/home/index'
        })
      }, 1500)
    },
    handleCancel() {
      uni.navigateBack()
    }
  }
}
</script>
```

## API 文档

### Props

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| initialCode | String | - | 否 | 初始凭证码 |
| mode | String | normal | 否 | 模式：normal/quick/staff |
| allowOverdue | Boolean | true | 否 | 是否允许超期取回 |
| maxOverdueDays | Number | 30 | 否 | 最大超期天数 |
| showFeeDetail | Boolean | true | 否 | 是否显示费用明细 |
| requireConfirm | Boolean | true | 否 | 是否需要确认 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| complete | result | 取回完成时触发 |
| cancel | - | 取消流程时触发 |
| verify-success | voucher | 凭证验证成功时触发 |
| verify-fail | error | 凭证验证失败时触发 |
| fee-calculated | feeInfo | 费用计算完成时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| scan | 自定义扫码区域 |
| fee-detail | 自定义费用详情展示 |
| confirm | 自定义确认界面 |

### Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| verifyVoucher | code | 验证凭证 |
| calculateFee | - | 计算费用 |
| confirmRetrieval | - | 确认取回 |
| reset | - | 重置流程 |

## 取回模式

### 1. 正常模式 (mode="normal")
```vue
<template>
  <retrieval-flow 
    mode="normal"
    @verify-success="onVerifySuccess"
    @fee-calculated="onFeeCalculated"
    @complete="onComplete"
  >
    <!-- 自定义扫码区域 -->
    <template #scan>
      <view class="scan-container">
        <view class="scan-box" @click="scanCode">
          <image src="/static/scan-qr.png" class="scan-icon" />
          <text class="scan-text">扫描凭证二维码</text>
        </view>
        
        <view class="divider">
          <text>或</text>
        </view>
        
        <view class="input-box">
          <input 
            v-model="manualCode"
            type="text"
            placeholder="输入凭证码"
            @confirm="submitCode"
          />
          <button class="verify-btn" @click="submitCode">
            验证
          </button>
        </view>
      </view>
    </template>
  </retrieval-flow>
</template>

<script>
export default {
  data() {
    return {
      manualCode: ''
    }
  },
  methods: {
    async scanCode() {
      try {
        const res = await uni.scanCode({
          onlyFromCamera: true,
          scanType: ['qrCode']
        })
        
        if (res.result) {
          this.$refs.retrievalFlow.verifyVoucher(res.result)
        }
      } catch (error) {
        console.error('扫码失败:', error)
      }
    },
    
    submitCode() {
      if (this.manualCode) {
        this.$refs.retrievalFlow.verifyVoucher(this.manualCode)
      }
    },
    
    onVerifySuccess(voucher) {
      console.log('凭证验证成功:', voucher)
    },
    
    onFeeCalculated(feeInfo) {
      console.log('费用计算完成:', feeInfo)
    },
    
    onComplete(result) {
      console.log('取回完成:', result)
    }
  }
}
</script>
```

### 2. 快速模式 (mode="quick")
```vue
<retrieval-flow 
  mode="quick"
  :require-confirm="false"
  :show-fee-detail="false"
  @complete="handleQuickComplete"
/>
```

### 3. 员工模式 (mode="staff")
```vue
<retrieval-flow 
  mode="staff"
  :allow-overdue="true"
  :max-overdue-days="60"
  @complete="handleStaffComplete"
>
  <template #staff-actions>
    <view class="staff-actions">
      <button class="waive-fee-btn" @click="waiveFee">
        免除超期费用
      </button>
      <button class="force-open-btn" @click="forceOpen">
        强制开柜
      </button>
    </view>
  </template>
</retrieval-flow>
```

## 高级用法

### 超期费用处理

```vue
<template>
  <view class="retrieval-page">
    <retrieval-flow 
      ref="retrievalFlow"
      :show-fee-detail="true"
      @fee-calculated="handleFeeCalculated"
      @complete="handleComplete"
    >
      <!-- 自定义费用详情 -->
      <template #fee-detail="{ feeInfo }">
        <view class="fee-detail-card">
          <view class="fee-header">
            <text class="title">费用明细</text>
            <text class="status" :class="feeInfo.isOverdue ? 'overdue' : 'normal'">
              {{ feeInfo.isOverdue ? '已超期' : '未超期' }}
            </text>
          </view>
          
          <view class="fee-items">
            <view class="fee-item">
              <text class="label">存储时间</text>
              <text class="value">{{ feeInfo.storageDays }}天</text>
            </view>
            
            <view class="fee-item">
              <text class="label">基础费用</text>
              <text class="value">¥{{ feeInfo.baseFee }}</text>
            </view>
            
            <view class="fee-item" v-if="feeInfo.isOverdue">
              <text class="label">超期天数</text>
              <text class="value warning">{{ feeInfo.overdueDays }}天</text>
            </view>
            
            <view class="fee-item" v-if="feeInfo.overdueFee > 0">
              <text class="label">超期费用</text>
              <text class="value warning">¥{{ feeInfo.overdueFee }}</text>
            </view>
            
            <view class="fee-item" v-if="feeInfo.discount > 0">
              <text class="label">会员折扣</text>
              <text class="value discount">-¥{{ feeInfo.discount }}</text>
            </view>
            
            <view class="fee-total">
              <text class="label">应付总额</text>
              <text class="value">¥{{ feeInfo.totalFee }}</text>
            </view>
          </view>
          
          <!-- 支付方式选择 -->
          <view class="payment-methods" v-if="feeInfo.totalFee > 0">
            <text class="section-title">选择支付方式</text>
            <radio-group @change="onPaymentChange">
              <label class="payment-item" v-for="method in paymentMethods" :key="method.id">
                <radio :value="method.id" :checked="selectedPayment === method.id" />
                <image :src="method.icon" class="payment-icon" />
                <text>{{ method.name }}</text>
              </label>
            </radio-group>
          </view>
          
          <!-- 优惠券使用 -->
          <view class="coupon-section" v-if="availableCoupons.length > 0">
            <view class="coupon-header" @click="showCouponPicker">
              <text>优惠券</text>
              <view class="coupon-info">
                <text v-if="selectedCoupon">{{ selectedCoupon.name }}</text>
                <text v-else>{{ availableCoupons.length }}张可用</text>
                <text class="arrow">›</text>
              </view>
            </view>
          </view>
        </view>
      </template>
      
      <!-- 自定义确认界面 -->
      <template #confirm="{ voucherInfo, feeInfo }">
        <view class="confirm-card">
          <view class="confirm-header">
            <text class="title">确认取回信息</text>
          </view>
          
          <view class="confirm-items">
            <view class="confirm-item">
              <text class="label">储物柜编号</text>
              <text class="value">{{ voucherInfo.lockerNumber }}</text>
            </view>
            
            <view class="confirm-item">
              <text class="label">存储物品</text>
              <text class="value">台球杆 × {{ voucherInfo.itemCount }}</text>
            </view>
            
            <view class="confirm-item">
              <text class="label">存储时间</text>
              <text class="value">
                {{ formatDate(voucherInfo.storeTime) }} - {{ formatDate(new Date()) }}
              </text>
            </view>
            
            <view class="confirm-item" v-if="feeInfo.totalFee > 0">
              <text class="label">需支付费用</text>
              <text class="value price">¥{{ feeInfo.totalFee }}</text>
            </view>
          </view>
          
          <view class="confirm-notice">
            <checkbox-group @change="onAgreeChange">
              <label>
                <checkbox :checked="agreed" />
                <text>我已确认以上信息无误</text>
              </label>
            </checkbox-group>
          </view>
          
          <view class="confirm-actions">
            <button class="cancel-btn" @click="cancelRetrieval">
              取消
            </button>
            <button 
              class="confirm-btn" 
              :disabled="!agreed || (feeInfo.totalFee > 0 && !selectedPayment)"
              @click="confirmRetrieval"
            >
              {{ feeInfo.totalFee > 0 ? '支付并取回' : '确认取回' }}
            </button>
          </view>
        </view>
      </template>
    </retrieval-flow>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedPayment: 'wechat',
      paymentMethods: [
        { id: 'wechat', name: '微信支付', icon: '/static/wechat-pay.png' },
        { id: 'alipay', name: '支付宝', icon: '/static/alipay.png' },
        { id: 'balance', name: '余额支付', icon: '/static/balance.png' }
      ],
      availableCoupons: [],
      selectedCoupon: null,
      agreed: false
    }
  },
  methods: {
    async handleFeeCalculated(feeInfo) {
      // 加载可用优惠券
      if (feeInfo.totalFee > 0) {
        this.loadAvailableCoupons(feeInfo.totalFee)
      }
    },
    
    async loadAvailableCoupons(amount) {
      try {
        const res = await this.$api.coupon.getAvailable({
          type: 'retrieval',
          amount: amount
        })
        this.availableCoupons = res.data
      } catch (error) {
        console.error('加载优惠券失败:', error)
      }
    },
    
    onPaymentChange(e) {
      this.selectedPayment = e.detail.value
    },
    
    showCouponPicker() {
      // 显示优惠券选择器
      uni.navigateTo({
        url: `/pages/coupon/picker?amount=${this.feeInfo.totalFee}`
      })
    },
    
    onAgreeChange(e) {
      this.agreed = e.detail.value.length > 0
    },
    
    async confirmRetrieval() {
      if (!this.agreed) return
      
      if (this.feeInfo.totalFee > 0 && !this.selectedPayment) {
        uni.showToast({
          title: '请选择支付方式',
          icon: 'none'
        })
        return
      }
      
      // 执行支付和取回
      try {
        if (this.feeInfo.totalFee > 0) {
          await this.processPayment()
        }
        
        await this.$refs.retrievalFlow.confirmRetrieval()
        
      } catch (error) {
        uni.showToast({
          title: error.message || '操作失败',
          icon: 'none'
        })
      }
    },
    
    async processPayment() {
      uni.showLoading({
        title: '支付中...'
      })
      
      try {
        const paymentData = {
          amount: this.feeInfo.totalFee,
          method: this.selectedPayment,
          couponId: this.selectedCoupon?.id,
          orderId: this.voucherInfo.id
        }
        
        const res = await this.$api.payment.create(paymentData)
        
        // 调起支付
        if (this.selectedPayment === 'wechat') {
          await this.wxPay(res.data)
        } else if (this.selectedPayment === 'alipay') {
          await this.aliPay(res.data)
        } else {
          // 余额支付直接成功
          await this.$api.payment.confirm(res.data.paymentId)
        }
        
        uni.hideLoading()
        
      } catch (error) {
        uni.hideLoading()
        throw error
      }
    },
    
    formatDate(date) {
      const d = new Date(date)
      return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
    },
    
    cancelRetrieval() {
      this.$refs.retrievalFlow.reset()
    }
  }
}
</script>
```

### 异常情况处理

```vue
<template>
  <retrieval-flow 
    @verify-fail="handleVerifyFail"
    @error="handleError"
  >
    <!-- 凭证失效提示 -->
    <template #invalid-voucher="{ error }">
      <view class="error-container">
        <image src="/static/error-icon.png" class="error-icon" />
        <text class="error-title">凭证无效</text>
        <text class="error-message">{{ getErrorMessage(error.code) }}</text>
        
        <view class="error-actions">
          <button class="retry-btn" @click="retry">
            重新扫描
          </button>
          <button class="help-btn" @click="contactSupport">
            联系客服
          </button>
        </view>
        
        <!-- 相关操作建议 -->
        <view class="suggestions" v-if="showSuggestions">
          <text class="suggestion-title">您可以尝试：</text>
          <view class="suggestion-item" @click="checkHistory">
            <text>1. 查看历史记录</text>
          </view>
          <view class="suggestion-item" @click="searchByPhone">
            <text>2. 通过手机号查询</text>
          </view>
          <view class="suggestion-item" @click="reportLoss">
            <text>3. 申报凭证丢失</text>
          </view>
        </view>
      </view>
    </template>
  </retrieval-flow>
</template>

<script>
export default {
  data() {
    return {
      showSuggestions: false
    }
  },
  methods: {
    handleVerifyFail(error) {
      console.error('凭证验证失败:', error)
      
      // 根据错误类型显示不同处理方式
      switch (error.code) {
        case 'VOUCHER_NOT_FOUND':
          this.showNotFoundError()
          break
        case 'VOUCHER_EXPIRED':
          this.showExpiredError()
          break
        case 'VOUCHER_USED':
          this.showUsedError()
          break
        case 'VOUCHER_INVALID':
          this.showInvalidError()
          break
        default:
          this.showGeneralError(error)
      }
      
      this.showSuggestions = true
    },
    
    getErrorMessage(code) {
      const messages = {
        'VOUCHER_NOT_FOUND': '凭证不存在，请检查输入是否正确',
        'VOUCHER_EXPIRED': '凭证已过期，无法使用',
        'VOUCHER_USED': '该凭证已被使用',
        'VOUCHER_INVALID': '凭证格式错误'
      }
      return messages[code] || '凭证验证失败'
    },
    
    showNotFoundError() {
      uni.showModal({
        title: '凭证不存在',
        content: '未找到该凭证，请确认凭证码是否正确',
        confirmText: '重新输入',
        cancelText: '查看帮助',
        success: (res) => {
          if (res.confirm) {
            this.retry()
          } else {
            this.showHelp()
          }
        }
      })
    },
    
    showExpiredError() {
      uni.showModal({
        title: '凭证已过期',
        content: '该凭证已超过有效期，请联系工作人员处理',
        confirmText: '联系客服',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            this.contactSupport()
          }
        }
      })
    },
    
    showUsedError() {
      uni.showModal({
        title: '凭证已使用',
        content: '该凭证已被使用，如有疑问请联系客服',
        showCancel: false
      })
    },
    
    retry() {
      this.$refs.retrievalFlow.reset()
    },
    
    contactSupport() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      })
    },
    
    checkHistory() {
      uni.navigateTo({
        url: '/pages/user/history'
      })
    },
    
    searchByPhone() {
      uni.navigateTo({
        url: '/pages/retrieval/search'
      })
    },
    
    reportLoss() {
      uni.navigateTo({
        url: '/pages/support/report-loss'
      })
    },
    
    showHelp() {
      uni.navigateTo({
        url: '/pages/help/retrieval-help'
      })
    }
  }
}
</script>
```

### 批量取回功能

```vue
<template>
  <view class="batch-retrieval">
    <retrieval-flow 
      mode="batch"
      :allow-multiple="true"
      @complete="handleBatchComplete"
    >
      <template #batch-list="{ vouchers }">
        <view class="voucher-list">
          <view class="list-header">
            <text>已验证凭证 ({{ vouchers.length }})</text>
            <button class="add-more-btn" @click="addMore">
              继续添加
            </button>
          </view>
          
          <view 
            v-for="(voucher, index) in vouchers" 
            :key="voucher.id"
            class="voucher-item"
          >
            <view class="voucher-info">
              <text class="locker-number">{{ voucher.lockerNumber }}</text>
              <text class="voucher-code">{{ voucher.code }}</text>
            </view>
            <view class="voucher-fee">
              <text v-if="voucher.fee > 0" class="fee">¥{{ voucher.fee }}</text>
              <text v-else class="free">免费</text>
            </view>
            <view class="remove-btn" @click="removeVoucher(index)">
              <text>×</text>
            </view>
          </view>
          
          <view class="total-info">
            <text class="label">总计费用：</text>
            <text class="total">¥{{ totalFee }}</text>
          </view>
        </view>
      </template>
    </retrieval-flow>
  </view>
</template>

<script>
export default {
  data() {
    return {
      vouchers: [],
      totalFee: 0
    }
  },
  methods: {
    addMore() {
      // 继续扫描或输入凭证
      this.$refs.retrievalFlow.addVoucher()
    },
    
    removeVoucher(index) {
      this.vouchers.splice(index, 1)
      this.calculateTotalFee()
    },
    
    calculateTotalFee() {
      this.totalFee = this.vouchers.reduce((sum, v) => sum + (v.fee || 0), 0)
    },
    
    async handleBatchComplete(result) {
      uni.showToast({
        title: `成功取回${result.count}个球杆`,
        icon: 'success'
      })
      
      // 显示批量取回结果
      uni.navigateTo({
        url: `/pages/retrieval/batch-result?ids=${result.voucherIds.join(',')}`
      })
    }
  }
}
</script>
```

## 样式定制

### CSS 变量

```css
.retrieval-flow {
  --retrieval-primary-color: #1890ff;
  --retrieval-success-color: #52c41a;
  --retrieval-warning-color: #faad14;
  --retrieval-error-color: #ff4d4f;
  --retrieval-bg-color: #f5f6f7;
  --retrieval-card-bg: #ffffff;
  --retrieval-text-primary: #333333;
  --retrieval-text-secondary: #666666;
  --retrieval-border-radius: 16rpx;
}
```

## 注意事项

1. **安全验证**：凭证验证需要严格的安全机制，防止伪造
2. **费用计算**：超期费用计算要准确，避免纠纷
3. **支付安全**：支付流程需要完善的错误处理和回滚机制
4. **并发控制**：防止同一凭证被多次使用
5. **异常处理**：提供完善的异常处理和用户引导
6. **操作日志**：记录所有取回操作，便于追溯

## 更新日志

- 2025-07-23：创建组件文档
- 2025-07-23：添加批量取回功能
- 2025-07-23：完善异常处理机制