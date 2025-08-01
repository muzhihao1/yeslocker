<template>
  <view class="retrieval-flow">
    <!-- Step: Voucher Verification -->
    <view v-if="currentStep === 'verify'" class="step-content">
      <view class="step-header">
        <text class="step-title">取回球杆</text>
        <text class="step-desc">请提供您的存储凭证</text>
      </view>
      
      <!-- Input Method Tabs -->
      <view class="input-methods">
        <view 
          class="method-tab"
          :class="{ active: inputMethod === 'scan' }"
          @click="switchMethod('scan')"
        >
          <text class="method-icon">📷</text>
          <text class="method-text">扫码取杆</text>
        </view>
        <view 
          class="method-tab"
          :class="{ active: inputMethod === 'manual' }"
          @click="switchMethod('manual')"
        >
          <text class="method-icon">⌨️</text>
          <text class="method-text">手动输入</text>
        </view>
      </view>
      
      <!-- Scan Method -->
      <view v-if="inputMethod === 'scan'" class="scan-method">
        <view class="scan-area" @click="startScan">
          <image 
            class="scan-icon" 
            src="/static/images/scan-qrcode.png"
            mode="aspectFit"
          />
          <text class="scan-text">点击扫描凭证二维码</text>
        </view>
      </view>
      
      <!-- Manual Input Method -->
      <view v-else class="manual-method">
        <view class="code-input-group">
          <input 
            v-model="voucherCode"
            class="code-input"
            placeholder="请输入12位凭证码"
            maxlength="12"
            @input="handleCodeInput"
          />
          <text class="code-format">格式：XXXX-XXXX-XXXX</text>
        </view>
        
        <button 
          class="verify-btn"
          :disabled="!isValidCode || verifying"
          @click="verifyVoucher"
        >
          {{ verifying ? '验证中...' : '验证凭证' }}
        </button>
      </view>
      
      <!-- Recent Records -->
      <view v-if="recentRecords.length > 0" class="recent-records">
        <text class="records-title">最近的存储记录</text>
        <view 
          v-for="record in recentRecords"
          :key="record.id"
          class="record-item"
          @click="useRecentRecord(record)"
        >
          <view class="record-info">
            <text class="record-locker">{{ record.zone || '' }}{{ record.lockerNumber }}号柜</text>
            <text class="record-time">{{ formatTime(record.createTime) }}</text>
          </view>
          <text class="record-arrow">→</text>
        </view>
      </view>
    </view>
    
    <!-- Step: Confirm Retrieval -->
    <view v-else-if="currentStep === 'confirm' && voucherInfo" class="step-content">
      <view class="step-header">
        <text class="step-title">确认取杆信息</text>
        <text class="step-desc">请核对以下信息</text>
      </view>
      
      <!-- Voucher Info Display -->
      <voucher-code
        :code="voucherInfo.code"
        :qr-code-url="voucherInfo.qrCodeUrl"
        :locker-number="voucherInfo.lockerNumber"
        :create-time="voucherInfo.createTime"
        :expiry-time="voucherInfo.expiryTime"
        :status="voucherInfo.status"
        :show-actions="false"
        class="voucher-display"
      />
      
      <!-- Storage Details -->
      <view class="storage-details">
        <view class="detail-item">
          <text class="detail-label">存储时长：</text>
          <text class="detail-value">{{ calculateDuration(voucherInfo.createTime) }}</text>
        </view>
        <view class="detail-item" v-if="voucherInfo.notes">
          <text class="detail-label">备注信息：</text>
          <text class="detail-value">{{ voucherInfo.notes }}</text>
        </view>
        <view class="detail-item" v-if="isOverdue">
          <text class="detail-label">超期费用：</text>
          <text class="detail-value overdue">¥{{ calculateOverdueFee() }}</text>
        </view>
      </view>
      
      <!-- Warning Messages -->
      <view v-if="warnings.length > 0" class="warnings">
        <view v-for="(warning, index) in warnings" :key="index" class="warning-item">
          <text class="warning-icon">⚠️</text>
          <text class="warning-text">{{ warning }}</text>
        </view>
      </view>
      
      <!-- Action Buttons -->
      <view class="action-buttons">
        <button class="btn-cancel" @click="cancelRetrieval">取消</button>
        <button 
          class="btn-confirm" 
          @click="confirmRetrieval"
        >
          确认取回
        </button>
      </view>
    </view>
    
    <!-- Step: Success -->
    <view v-else-if="currentStep === 'success'" class="step-content">
      <view class="success-container">
        <view class="success-icon">
          <text>✅</text>
        </view>
        <text class="success-title">取杆成功</text>
        <text class="success-desc">您的球杆已成功取回</text>
        
        <view class="success-info">
          <view class="info-item">
            <text class="info-label">储物柜号：</text>
            <text class="info-value">{{ voucherInfo.lockerNumber }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">取回时间：</text>
            <text class="info-value">{{ formatDateTime(new Date()) }}</text>
          </view>
        </view>
        
        <!-- Tips -->
        <view class="success-tips">
          <text class="tip-text">温馨提示：请检查您的球杆是否完好</text>
          <text class="tip-text">如有问题请及时联系工作人员</text>
        </view>
        
        <!-- Action Buttons -->
        <view class="action-buttons">
          <button class="btn-home" @click="backToHome">返回首页</button>
          <button class="btn-feedback" @click="giveFeedback">反馈问题</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import VoucherCode from '../atoms/VoucherCode.vue'
import { scanQRCode, parseScanResult } from '@/utils/wechat'
import { retrieveLocker } from '@/api/locker'
import { getMyVouchers } from '@/api/voucher'

export default {
  name: 'RetrievalFlow',
  components: {
    VoucherCode
  },
  props: {
    initialCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentStep: 'verify',
      inputMethod: 'scan',
      voucherCode: this.initialCode || '',
      voucherInfo: null,
      recentRecords: [],
      warnings: [],
      verifying: false,
      processing: false
    }
  },
  computed: {
    isValidCode() {
      // 验证凭证码格式（12位字母数字）
      return /^[A-Z0-9]{12}$/.test(this.voucherCode.replace(/-/g, ''))
    },
    isOverdue() {
      if (!this.voucherInfo) return false
      return new Date() > new Date(this.voucherInfo.expiryTime)
    }
  },
  mounted() {
    this.loadRecentRecords()
    
    // 如果有初始凭证码，直接验证
    if (this.initialCode) {
      this.voucherCode = this.initialCode
      this.verifyVoucher()
    }
  },
  methods: {
    async loadRecentRecords() {
      try {
        // 获取用户最近的活跃凭证
        const res = await getMyVouchers({ 
          status: 'active', 
          limit: 3 
        })
        
        if (res.errno === 0 && res.data && res.data.list) {
          this.recentRecords = res.data.list.map(voucher => ({
            id: voucher.id,
            lockerNumber: voucher.cabinetNumber || voucher.lockerNumber,
            createTime: new Date(voucher.createTime).getTime(),
            voucherCode: voucher.code,
            zone: voucher.zone,
            storeName: voucher.storeName
          }))
        }
      } catch (error) {
        console.error('加载最近记录失败:', error)
        // 静默失败，不影响主功能
      }
    },
    
    switchMethod(method) {
      this.inputMethod = method
    },
    
    async startScan() {
      try {
        // 使用封装的扫码功能
        const result = await scanQRCode({
          onlyFromCamera: true,
          scanType: ['qrCode']
        })
        
        // 解析扫码结果
        this.handleScanResult(result)
      } catch (error) {
        // 错误已在 scanQRCode 中处理
        if (error.message !== '用户取消授权' && error.message !== '用户取消扫码') {
          uni.showToast({
            title: error.message || '扫码失败',
            icon: 'none'
          })
        }
      }
    },
    
    handleScanResult(result) {
      // 使用工具函数解析扫码结果
      const data = parseScanResult(result)
      
      if (data.type === 'voucher') {
        // 扫描的是凭证码
        this.voucherCode = data.voucherCode
        this.verifyVoucher()
      } else {
        // 不是凭证码，提示用户
        uni.showModal({
          title: '提示',
          content: '请扫描凭证二维码',
          showCancel: false
        })
      }
    },
    
    handleCodeInput(e) {
      // 自动格式化输入的凭证码
      let value = e.detail.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
      if (value.length > 8) {
        value = value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8, 12)
      } else if (value.length > 4) {
        value = value.slice(0, 4) + '-' + value.slice(4)
      }
      this.voucherCode = value
    },
    
    async verifyVoucher() {
      if (!this.isValidCode || this.verifying) return
      
      this.verifying = true
      this.warnings = []
      
      try {
        // 清理凭证码格式
        const cleanCode = this.voucherCode.replace(/-/g, '')
        
        // 调用验证凭证API
        const res = await retrieveLocker(cleanCode)
        
        if (res.errno === 0 && res.data) {
          // 处理凭证信息
          this.voucherInfo = {
            code: cleanCode,
            lockerNumber: res.data.cabinetNumber,
            lockerId: res.data.lockerId,
            createTime: new Date(res.data.storageTime).getTime(),
            expiryTime: res.data.expiryTime ? new Date(res.data.expiryTime).getTime() : null,
            status: res.data.status || 'active',
            notes: res.data.notes || '',
            zone: res.data.zone,
            storeName: res.data.storeName
          }
          
          // 检查是否过期
          if (this.isOverdue && res.data.overdueFee) {
            this.warnings.push(`您的存储已超期，需支付超期费用：¥${res.data.overdueFee}`)
          }
          
          // 检查其他警告信息
          if (res.data.warnings && res.data.warnings.length > 0) {
            this.warnings.push(...res.data.warnings)
          }
          
          this.currentStep = 'confirm'
          this.$emit('voucher-verified', this.voucherInfo)
        } else {
          throw new Error(res.errmsg || '凭证验证失败')
        }
      } catch (error) {
        console.error('验证凭证失败:', error)
        
        // 处理特定错误
        let errorMessage = '凭证验证失败'
        if (error.message.includes('无效')) {
          errorMessage = '凭证码无效，请检查输入是否正确'
        } else if (error.message.includes('已使用')) {
          errorMessage = '该凭证已被使用'
        } else if (error.message.includes('过期')) {
          errorMessage = '凭证已过期'
        } else if (error.response && error.response.data) {
          errorMessage = error.response.data.errmsg || errorMessage
        }
        
        uni.showModal({
          title: '验证失败',
          content: errorMessage,
          showCancel: false
        })
      } finally {
        this.verifying = false
      }
    },
    
    useRecentRecord(record) {
      this.voucherCode = record.voucherCode
      this.verifyVoucher()
    },
    
    calculateDuration(createTime) {
      const now = new Date().getTime()
      const diff = now - createTime
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) {
        return `${days}天${hours}小时`
      }
      return `${hours}小时`
    },
    
    calculateOverdueFee() {
      if (!this.isOverdue) return 0
      
      const now = new Date().getTime()
      const expiryTime = new Date(this.voucherInfo.expiryTime).getTime()
      const overdueDays = Math.ceil((now - expiryTime) / (1000 * 60 * 60 * 24))
      
      // 每天5元超期费
      return overdueDays * 5
    },
    
    cancelRetrieval() {
      uni.showModal({
        title: '提示',
        content: '确定要取消取杆吗？',
        success: (res) => {
          if (res.confirm) {
            this.currentStep = 'verify'
            this.voucherCode = ''
            this.voucherInfo = null
            this.$emit('cancel')
          }
        }
      })
    },
    
    async confirmRetrieval() {
      if (this.processing) return
      
      this.processing = true
      uni.showLoading({ title: '处理中...' })
      
      try {
        // 确认取杆操作
        // 注意：实际的取杆操作可能已经在验证时完成，
        // 这里可能需要调用一个确认API或者只是本地处理
        
        // 如果有超期费用，可能需要先支付
        if (this.isOverdue && this.calculateOverdueFee() > 0) {
          // TODO: 跳转到支付页面或提示用户支付
          uni.hideLoading()
          uni.showModal({
            title: '支付提示',
            content: `需要支付超期费用 ¥${this.calculateOverdueFee()}`,
            showCancel: false
          })
          return
        }
        
        // 记录成功的取杆信息
        const retrievalData = {
          voucher: this.voucherInfo,
          retrievalTime: new Date().getTime(),
          lockerId: this.voucherInfo.lockerId,
          lockerNumber: this.voucherInfo.lockerNumber
        }
        
        this.currentStep = 'success'
        uni.hideLoading()
        
        this.$emit('complete', retrievalData)
        
        // 清除本地存储的凭证信息
        this.clearLocalVoucher()
        
        // 记录操作日志
        console.log('取杆成功:', retrievalData)
      } catch (error) {
        uni.hideLoading()
        console.error('确认取杆失败:', error)
        
        uni.showToast({
          title: error.message || '取杆失败，请重试',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.processing = false
      }
    },
    
    clearLocalVoucher() {
      // 清除本地存储的凭证信息
      try {
        // 清除当前凭证码
        uni.removeStorageSync(`voucher_${this.voucherInfo.code}`)
        
        // 更新活跃凭证列表
        const activeVouchers = uni.getStorageSync('activeVouchers') || []
        const updatedVouchers = activeVouchers.filter(v => v.code !== this.voucherInfo.code)
        uni.setStorageSync('activeVouchers', updatedVouchers)
        
        // 清除最后使用的凭证
        const lastVoucher = uni.getStorageSync('lastActiveVoucher')
        if (lastVoucher && lastVoucher.code === this.voucherInfo.code) {
          uni.removeStorageSync('lastActiveVoucher')
        }
      } catch (error) {
        console.error('清除本地凭证失败:', error)
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 86400000) {
        return '今天'
      } else if (diff < 172800000) {
        return '昨天'
      } else {
        return `${Math.floor(diff / 86400000)}天前`
      }
    },
    
    formatDateTime(date) {
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    },
    
    backToHome() {
      uni.switchTab({
        url: '/pages/home/index'
      })
    },
    
    giveFeedback() {
      uni.navigateTo({
        url: '/pages/user/feedback'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.retrieval-flow {
  min-height: 100vh;
  background-color: #f5f6f7;
  
  .step-content {
    padding: 32rpx;
  }
  
  .step-header {
    text-align: center;
    margin-bottom: 48rpx;
    
    .step-title {
      display: block;
      font-size: 40rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 16rpx;
    }
    
    .step-desc {
      display: block;
      font-size: 28rpx;
      color: #666666;
    }
  }
  
  // Verify Step
  .input-methods {
    display: flex;
    gap: 24rpx;
    margin-bottom: 48rpx;
    
    .method-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32rpx;
      background-color: #ffffff;
      border: 2rpx solid #e8e8e8;
      border-radius: 16rpx;
      transition: all 0.3s;
      
      &.active {
        border-color: #1890ff;
        background-color: #e6f7ff;
        
        .method-icon {
          color: #1890ff;
        }
        
        .method-text {
          color: #1890ff;
        }
      }
      
      .method-icon {
        font-size: 48rpx;
        margin-bottom: 16rpx;
      }
      
      .method-text {
        font-size: 28rpx;
        color: #666666;
      }
    }
  }
  
  .scan-method {
    .scan-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 80rpx;
      background-color: #ffffff;
      border-radius: 16rpx;
      
      .scan-icon {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 32rpx;
      }
      
      .scan-text {
        font-size: 32rpx;
        color: #1890ff;
      }
    }
  }
  
  .manual-method {
    .code-input-group {
      margin-bottom: 32rpx;
      
      .code-input {
        width: 100%;
        height: 88rpx;
        padding: 0 24rpx;
        background-color: #ffffff;
        border: 2rpx solid #e8e8e8;
        border-radius: 12rpx;
        font-size: 36rpx;
        font-weight: 500;
        text-align: center;
        letter-spacing: 4rpx;
      }
      
      .code-format {
        display: block;
        margin-top: 16rpx;
        font-size: 24rpx;
        color: #999999;
        text-align: center;
      }
    }
    
    .verify-btn {
      width: 100%;
      height: 88rpx;
      background-color: #1890ff;
      color: #ffffff;
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: 500;
      
      &[disabled] {
        background-color: #d9d9d9;
      }
    }
  }
  
  .recent-records {
    margin-top: 48rpx;
    
    .records-title {
      display: block;
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 16rpx;
    }
    
    .record-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx;
      background-color: #ffffff;
      border-radius: 12rpx;
      margin-bottom: 16rpx;
      
      .record-info {
        .record-locker {
          display: block;
          font-size: 32rpx;
          color: #333333;
          margin-bottom: 8rpx;
        }
        
        .record-time {
          display: block;
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .record-arrow {
        font-size: 32rpx;
        color: #999999;
      }
    }
  }
  
  // Confirm Step
  .voucher-display {
    margin-bottom: 32rpx;
  }
  
  .storage-details {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 32rpx;
    
    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .detail-label {
        font-size: 28rpx;
        color: #666666;
        width: 160rpx;
      }
      
      .detail-value {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
        
        &.overdue {
          color: #ff4d4f;
          font-weight: 500;
        }
      }
    }
  }
  
  .warnings {
    background-color: #fff7e6;
    border: 2rpx solid #ffd591;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 32rpx;
    
    .warning-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .warning-icon {
        font-size: 28rpx;
        margin-right: 12rpx;
      }
      
      .warning-text {
        flex: 1;
        font-size: 26rpx;
        color: #fa8c16;
        line-height: 36rpx;
      }
    }
  }
  
  // Success Step
  .success-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 32rpx;
    
    .success-icon {
      font-size: 120rpx;
      margin-bottom: 32rpx;
    }
    
    .success-title {
      font-size: 40rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 16rpx;
    }
    
    .success-desc {
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 48rpx;
    }
    
    .success-info {
      width: 100%;
      background-color: #ffffff;
      border-radius: 16rpx;
      padding: 32rpx;
      margin-bottom: 32rpx;
      
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          font-size: 28rpx;
          color: #666666;
          width: 160rpx;
        }
        
        .info-value {
          flex: 1;
          font-size: 28rpx;
          color: #333333;
          font-weight: 500;
        }
      }
    }
    
    .success-tips {
      text-align: center;
      margin-bottom: 48rpx;
      
      .tip-text {
        display: block;
        font-size: 26rpx;
        color: #999999;
        line-height: 40rpx;
      }
    }
  }
  
  // Action Buttons
  .action-buttons {
    display: flex;
    gap: 24rpx;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 32rpx;
    background-color: #ffffff;
    box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
    
    button {
      flex: 1;
      height: 88rpx;
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: 500;
      
      &.btn-cancel,
      &.btn-home {
        background-color: #ffffff;
        color: #666666;
        border: 2rpx solid #e8e8e8;
      }
      
      &.btn-confirm,
      &.btn-feedback {
        background-color: #1890ff;
        color: #ffffff;
        border: none;
      }
    }
  }
}
</style>