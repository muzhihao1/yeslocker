<template>
  <view class="storage-flow">
    <!-- Step: Select Locker -->
    <view v-if="currentStep === 'select-locker'" class="step-content">
      <view class="step-header">
        <text class="step-title">选择储物柜</text>
        <text class="step-desc">请选择一个可用的储物柜</text>
      </view>
      
      <!-- Loading State -->
      <view v-if="isLoading && areas.length === 0" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- Content Container with Pull to Refresh -->
      <scroll-view
        v-else
        scroll-y
        class="content-scroll"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        :refresher-threshold="45"
        refresher-default-style="white"
        refresher-background="#f5f6f7"
        @refresherrefresh="onPullDownRefresh"
      >
        <!-- Area Selection -->
        <view class="area-selection">
          <scroll-view 
            scroll-x 
            class="area-tabs"
            :show-scrollbar="false"
          >
            <view 
              v-for="area in areas" 
              :key="area.id"
              class="area-tab"
              :class="{ active: selectedArea === area.id }"
              @click="selectArea(area.id)"
            >
              {{ area.name }}
              <text class="area-count">({{ area.availableCount }}/{{ area.totalCount }})</text>
            </view>
          </scroll-view>
        </view>
        
        <!-- Scan Button -->
        <view class="scan-section">
          <button class="scan-btn" @click="handleScanLocker">
            <text class="scan-icon">📷</text>
            <text class="scan-text">扫描储物柜二维码</text>
          </button>
        </view>
        
        <!-- Locker Grid -->
        <view v-if="filteredLockers.length > 0" class="locker-grid">
          <locker-item
            v-for="locker in filteredLockers"
            :key="locker.id"
            :locker-number="locker.number"
            :status="locker.status"
            :is-selected="selectedLocker && selectedLocker.id === locker.id"
            :expiry-time="locker.expiryTime"
            @click="selectLocker(locker)"
            class="locker-grid-item"
          />
        </view>
        
        <!-- Empty State -->
        <view v-else-if="!isLoading" class="empty-state">
          <text class="empty-icon">📦</text>
          <text class="empty-text">该区域暂无可用储物柜</text>
        </view>
      </scroll-view>
      
      <!-- Selected Locker Info -->
      <view v-if="selectedLocker" class="selected-info">
        <view class="info-header">
          <text class="info-title">已选择：{{ selectedLocker.number }}号柜</text>
          <text class="info-desc">{{ getLockerDescription(selectedLocker) }}</text>
        </view>
      </view>
      
      <!-- Action Buttons -->
      <view class="action-buttons">
        <button class="btn-cancel" @click="cancel">取消</button>
        <button 
          class="btn-confirm" 
          :disabled="!selectedLocker"
          @click="confirmLocker"
        >
          确认选择
        </button>
      </view>
    </view>
    
    <!-- Step: Confirm Storage -->
    <view v-else-if="currentStep === 'confirm'" class="step-content">
      <view class="step-header">
        <text class="step-title">确认存储信息</text>
        <text class="step-desc">请核对以下信息是否正确</text>
      </view>
      
      <!-- Confirmation Details -->
      <view class="confirm-card">
        <view class="confirm-item">
          <text class="confirm-label">储物柜号：</text>
          <text class="confirm-value">{{ selectedLocker.number }}</text>
        </view>
        <view class="confirm-item">
          <text class="confirm-label">存储位置：</text>
          <text class="confirm-value">{{ getAreaName(selectedLocker.zone) }}</text>
        </view>
        <view class="confirm-item">
          <text class="confirm-label">球杆信息：</text>
          <text class="confirm-value">{{ cueStickInfo || '个人球杆' }}</text>
        </view>
        <view class="confirm-item">
          <text class="confirm-label">存储期限：</text>
          <text class="confirm-value">30天</text>
        </view>
        <view class="confirm-item">
          <text class="confirm-label">到期时间：</text>
          <text class="confirm-value">{{ formatExpiryDate() }}</text>
        </view>
      </view>
      
      <!-- Additional Notes -->
      <view class="notes-section">
        <text class="notes-title">备注信息（选填）</text>
        <textarea 
          v-model="notes"
          class="notes-input"
          placeholder="请输入备注信息，如球杆品牌、特征等"
          maxlength="200"
        />
      </view>
      
      <!-- Terms -->
      <view class="terms">
        <checkbox-group @change="handleTermsChange">
          <label class="terms-label">
            <checkbox :value="true" :checked="termsAccepted" />
            <text>我已阅读并同意</text>
            <text class="terms-link" @click.stop="showTerms">《存储服务条款》</text>
          </label>
        </checkbox-group>
      </view>
      
      <!-- Action Buttons -->
      <view class="action-buttons">
        <button class="btn-back" @click="backToSelect">返回修改</button>
        <button 
          class="btn-confirm" 
          :disabled="!termsAccepted"
          @click="submitStorage"
        >
          确认存储
        </button>
      </view>
    </view>
    
    <!-- Step: Generate Voucher -->
    <view v-else-if="currentStep === 'voucher' && voucher" class="step-content">
      <view class="step-header">
        <text class="step-title">存储成功</text>
        <text class="step-desc">请保存好您的存储凭证</text>
      </view>
      
      <!-- Voucher Component -->
      <voucher-code
        :code="voucher.code"
        :qr-code-url="voucher.qrCodeUrl"
        :locker-number="selectedLocker.number"
        :create-time="voucher.createTime"
        :expiry-time="voucher.expiryTime"
        :status="voucher.status"
        :show-actions="true"
        :can-share="true"
        @share="shareVoucher"
        class="voucher-display"
      />
      
      <!-- Success Tips -->
      <view class="success-tips">
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <text class="tip-text">凭证是取回球杆的唯一凭据，请妥善保管</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">📸</text>
          <text class="tip-text">建议截图保存或分享给微信文件传输助手</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">⏰</text>
          <text class="tip-text">到期前3天将通过微信通知提醒您</text>
        </view>
      </view>
      
      <!-- Action Buttons -->
      <view class="action-buttons">
        <button class="btn-home" @click="backToHome">返回首页</button>
        <button class="btn-save" @click="saveVoucher">保存凭证</button>
      </view>
    </view>
  </view>
</template>

<script>
import LockerItem from '../atoms/LockerItem.vue'
import VoucherCode from '../atoms/VoucherCode.vue'
import { scanQRCode, parseScanResult } from '@/utils/wechat'
import { generateVoucherQRCode, saveQRCodeToAlbum } from '@/utils/qrcode'
import { get } from '@/utils/request'
import { createStorageRequest } from '@/api/locker'

export default {
  name: 'StorageFlow',
  components: {
    LockerItem,
    VoucherCode
  },
  props: {
    initialStep: {
      type: String,
      default: 'select-locker'
    },
    userInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentStep: this.initialStep,
      areas: [],
      selectedArea: null,
      lockers: [],
      selectedLocker: null,
      cueStickInfo: '',
      notes: '',
      termsAccepted: false,
      voucher: null,
      isLoading: false,
      isRefreshing: false
    }
  },
  computed: {
    filteredLockers() {
      if (!this.selectedArea) return []
      return this.lockers.filter(locker => locker.zone === this.selectedArea)
    }
  },
  mounted() {
    this.loadLockers()
  },
  methods: {
    async loadLockers(isRefresh = false) {
      // 防止重复加载
      if (this.isLoading || this.isRefreshing) return
      
      if (isRefresh) {
        this.isRefreshing = true
      } else {
        this.isLoading = true
      }
      
      try {
        // 调用API获取可用储物柜列表
        const response = await get('/locker/available')
        
        if (response && Array.isArray(response)) {
          // 处理储物柜数据
          this.lockers = response.map(locker => ({
            id: locker.id,
            number: locker.cabinetNumber,
            zone: locker.zone,
            areaId: locker.zone, // 兼容旧代码
            status: locker.status,
            expiryTime: null
          }))
          
          // 根据zone分组计算区域信息
          const zoneMap = {}
          this.lockers.forEach(locker => {
            if (!zoneMap[locker.zone]) {
              zoneMap[locker.zone] = {
                id: locker.zone,
                name: locker.zone,
                availableCount: 0,
                totalCount: 0
              }
            }
            zoneMap[locker.zone].totalCount++
            if (locker.status === 'available') {
              zoneMap[locker.zone].availableCount++
            }
          })
          
          // 转换为数组并排序
          this.areas = Object.values(zoneMap).sort((a, b) => {
            // VIP区排在最后
            if (a.id.includes('VIP')) return 1
            if (b.id.includes('VIP')) return -1
            // 其他按字母顺序
            return a.id.localeCompare(b.id)
          })
          
          // 如果没有选中区域，默认选择第一个
          if (!this.selectedArea && this.areas.length > 0) {
            this.selectedArea = this.areas[0].id
          }
          
          // 如果是刷新操作，显示成功提示
          if (isRefresh) {
            uni.showToast({
              title: '刷新成功',
              icon: 'success',
              duration: 1500
            })
          }
        } else {
          throw new Error('数据格式错误')
        }
      } catch (error) {
        console.error('加载储物柜失败:', error)
        
        // 网络错误处理
        let errorMessage = '加载失败，请检查网络连接'
        if (error.message && error.message.includes('errno')) {
          errorMessage = '服务器异常，请稍后重试'
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        })
        
        // 加载失败时使用模拟数据，确保用户可以继续使用
        this.loadMockData()
      } finally {
        this.isLoading = false
        this.isRefreshing = false
      }
    },
    
    // 加载模拟数据作为降级方案
    loadMockData() {
      const mockAreas = [
        { id: 'A区', name: 'A区', availableCount: 8, totalCount: 20 },
        { id: 'B区', name: 'B区', availableCount: 12, totalCount: 20 },
        { id: 'C区', name: 'C区', availableCount: 5, totalCount: 15 },
        { id: 'VIP区', name: 'VIP区', availableCount: 3, totalCount: 10 }
      ]
      
      const mockLockers = []
      for (let area of mockAreas) {
        const totalInArea = area.totalCount
        const occupiedCount = area.totalCount - area.availableCount
        
        for (let i = 1; i <= totalInArea; i++) {
          const areaPrefix = area.id.replace('区', '')
          mockLockers.push({
            id: `${areaPrefix}-${i}`,
            number: `${areaPrefix}${String(i).padStart(2, '0')}`,
            zone: area.id,
            areaId: area.id,
            status: i <= occupiedCount ? 'occupied' : 'available',
            expiryTime: i <= occupiedCount ? new Date().getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000 : null
          })
        }
      }
      
      this.areas = mockAreas
      this.lockers = mockLockers
      
      if (!this.selectedArea && this.areas.length > 0) {
        this.selectedArea = this.areas[0].id
      }
    },
    
    // 下拉刷新处理
    onPullDownRefresh() {
      this.loadLockers(true).finally(() => {
        // 停止下拉刷新动画
        uni.stopPullDownRefresh()
      })
    },
    
    selectArea(areaId) {
      this.selectedArea = areaId
      this.selectedLocker = null
    },
    
    selectLocker(locker) {
      if (locker.status !== 'available') {
        uni.showToast({
          title: '该储物柜已被占用',
          icon: 'none'
        })
        return
      }
      this.selectedLocker = locker
    },
    
    async handleScanLocker() {
      try {
        // 扫描二维码
        const result = await scanQRCode({
          onlyFromCamera: true,
          scanType: ['qrCode']
        })
        
        // 解析扫码结果
        const data = parseScanResult(result)
        
        if (data.type === 'locker') {
          // 查找对应的储物柜
          const locker = this.lockers.find(l => l.number === data.lockerNumber)
          
          if (locker) {
            // 自动选择区域
            this.selectedArea = locker.zone
            
            // 选择储物柜
            this.selectLocker(locker)
            
            uni.showToast({
              title: `已选择 ${locker.number} 号柜`,
              icon: 'success'
            })
          } else {
            uni.showModal({
              title: '提示',
              content: '未找到该储物柜，请检查二维码是否正确',
              showCancel: false
            })
          }
        } else {
          uni.showModal({
            title: '提示',
            content: '请扫描储物柜二维码',
            showCancel: false
          })
        }
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
    
    getLockerDescription(locker) {
      const area = this.areas.find(a => a.id === locker.zone)
      return area ? `${area.name} - 标准储物柜` : '标准储物柜'
    },
    
    getAreaName(zone) {
      const area = this.areas.find(a => a.id === zone)
      return area ? area.name : zone || ''
    },
    
    confirmLocker() {
      if (!this.selectedLocker) return
      this.currentStep = 'confirm'
      this.$emit('step-change', { step: 'confirm', locker: this.selectedLocker })
    },
    
    backToSelect() {
      this.currentStep = 'select-locker'
      this.termsAccepted = false
      this.$emit('step-change', { step: 'select-locker' })
    },
    
    handleTermsChange(e) {
      this.termsAccepted = e.detail.value.length > 0
    },
    
    showTerms() {
      // TODO: 显示存储条款
      uni.navigateTo({
        url: '/pages/common/terms'
      })
    },
    
    formatExpiryDate() {
      const date = new Date()
      date.setDate(date.getDate() + 30)
      return date.toLocaleDateString('zh-CN')
    },
    
    async submitStorage() {
      if (!this.termsAccepted) return
      
      uni.showLoading({ title: '处理中...' })
      
      try {
        // 调用API创建存储请求
        const response = await createStorageRequest({
          lockerId: this.selectedLocker.id,
          storeId: 1, // 默认店铺ID
          notes: this.notes
        })
        
        // 处理响应数据
        if (response.errno === 0 && response.data) {
          const { requestId, voucherCode, qrcodeUrl, status, expiresAt } = response.data
          
          // 构建凭证数据
          const voucherData = {
            requestId,
            code: voucherCode,
            qrCodeUrl: qrcodeUrl || await generateVoucherQRCode(voucherCode), // 如果后端没返回二维码，则本地生成
            lockerNumber: this.selectedLocker.number,
            createTime: new Date().getTime(),
            expiryTime: new Date(expiresAt).getTime(),
            status: status || 'active'
          }
          
          // 保存凭证数据并切换到凭证显示步骤
          this.voucher = voucherData
          this.currentStep = 'voucher'
          
          // 触发完成事件
          this.$emit('complete', {
            locker: this.selectedLocker,
            voucher: voucherData,
            notes: this.notes,
            requestId
          })
          
          uni.hideLoading()
          
          // 显示成功提示
          uni.showToast({
            title: '存储成功',
            icon: 'success'
          })
        } else {
          throw new Error(response.errmsg || '存储请求失败')
        }
      } catch (error) {
        console.error('存储失败:', error)
        uni.hideLoading()
        
        // 如果是网络错误，尝试使用Mock数据（降级处理）
        if (error.message && error.message.includes('网络')) {
          uni.showModal({
            title: '提示',
            content: '网络连接失败，是否使用离线模式？',
            confirmText: '使用离线',
            cancelText: '重试',
            success: (res) => {
              if (res.confirm) {
                this.submitStorageOffline()
              }
            }
          })
        } else {
          uni.showToast({
            title: error.message || '存储失败，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }
      }
    },
    
    // 离线模式存储（Mock数据）
    async submitStorageOffline() {
      uni.showLoading({ title: '离线处理中...' })
      
      try {
        // 生成本地凭证
        const voucherCode = this.generateVoucherCode()
        const qrCodeUrl = await generateVoucherQRCode(voucherCode)
        
        const voucherData = {
          requestId: 'OFFLINE_' + Date.now(),
          code: voucherCode,
          qrCodeUrl: qrCodeUrl,
          lockerNumber: this.selectedLocker.number,
          createTime: new Date().getTime(),
          expiryTime: new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
          status: 'active',
          offline: true // 标记为离线生成
        }
        
        // 模拟处理延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.voucher = voucherData
        this.currentStep = 'voucher'
        
        uni.hideLoading()
        
        // 提示用户
        uni.showToast({
          title: '离线凭证已生成',
          icon: 'none',
          duration: 2000
        })
        
        this.$emit('complete', {
          locker: this.selectedLocker,
          voucher: voucherData,
          notes: this.notes,
          offline: true
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '生成凭证失败',
          icon: 'none'
        })
      }
    },
    
    generateVoucherCode() {
      // 生成12位凭证码
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    },
    
    shareVoucher() {
      // TODO: 实现分享功能
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 5,
        imageUrl: this.voucher.qrCodeUrl,
        title: '台球杆存储凭证',
        miniProgram: {
          id: 'gh_xxxxxxxxxx',
          path: `/pages/retrieval/index?code=${this.voucher.code}`,
          type: 0
        }
      })
    },
    
    async saveVoucher() {
      if (!this.voucher || !this.voucher.qrCodeUrl) {
        uni.showToast({
          title: '凭证信息不完整',
          icon: 'none'
        })
        return
      }
      
      try {
        await saveQRCodeToAlbum(this.voucher.qrCodeUrl)
        // 成功提示已在 saveQRCodeToAlbum 中处理
      } catch (error) {
        // 错误处理已在 saveQRCodeToAlbum 中完成
        console.error('保存凭证失败:', error)
      }
    },
    
    backToHome() {
      uni.switchTab({
        url: '/pages/home/index'
      })
    },
    
    cancel() {
      uni.showModal({
        title: '提示',
        content: '确定要取消存储吗？',
        success: (res) => {
          if (res.confirm) {
            this.$emit('cancel')
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.storage-flow {
  min-height: 100vh;
  background-color: #f5f6f7;
  
  .step-content {
    padding: 32rpx;
    height: calc(100vh - 200rpx); // 留出底部按钮空间
    display: flex;
    flex-direction: column;
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
  
  // Loading State
  .loading-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .loading-spinner {
      width: 60rpx;
      height: 60rpx;
      border: 4rpx solid #f0f0f0;
      border-top-color: #1890ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .loading-text {
      margin-top: 24rpx;
      font-size: 28rpx;
      color: #666666;
    }
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  // Content Scroll
  .content-scroll {
    flex: 1;
    height: 100%;
  }
  
  // Empty State
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 0;
    
    .empty-icon {
      font-size: 80rpx;
      margin-bottom: 24rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }
  
  // Select Locker Step
  .area-selection {
    margin-bottom: 32rpx;
    
    .area-tabs {
      white-space: nowrap;
      
      .area-tab {
        display: inline-block;
        padding: 16rpx 32rpx;
        margin-right: 24rpx;
        background-color: #ffffff;
        border: 2rpx solid #e8e8e8;
        border-radius: 32rpx;
        font-size: 28rpx;
        color: #666666;
        transition: all 0.3s;
        
        &.active {
          background-color: #1890ff;
          border-color: #1890ff;
          color: #ffffff;
          
          .area-count {
            color: rgba(255, 255, 255, 0.8);
          }
        }
        
        .area-count {
          font-size: 24rpx;
          color: #999999;
          margin-left: 8rpx;
        }
      }
    }
  }
  
  .scan-section {
    margin-bottom: 32rpx;
    
    .scan-btn {
      width: 100%;
      height: 88rpx;
      background-color: #ffffff;
      border: 2rpx solid #1890ff;
      border-radius: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      color: #1890ff;
      
      &:active {
        background-color: #f0f8ff;
      }
      
      .scan-icon {
        font-size: 36rpx;
        margin-right: 12rpx;
      }
      
      .scan-text {
        font-weight: 500;
      }
    }
  }
  
  .locker-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16rpx;
    margin-bottom: 32rpx;
    
    .locker-grid-item {
      // LockerItem component styles
    }
  }
  
  .selected-info {
    background-color: #e6f7ff;
    border: 2rpx solid #91d5ff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 32rpx;
    
    .info-header {
      .info-title {
        display: block;
        font-size: 32rpx;
        font-weight: 500;
        color: #1890ff;
        margin-bottom: 8rpx;
      }
      
      .info-desc {
        display: block;
        font-size: 26rpx;
        color: #666666;
      }
    }
  }
  
  // Confirm Step
  .confirm-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 32rpx;
    
    .confirm-item {
      display: flex;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .confirm-label {
        font-size: 28rpx;
        color: #666666;
        width: 160rpx;
      }
      
      .confirm-value {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
        font-weight: 500;
      }
    }
  }
  
  .notes-section {
    margin-bottom: 32rpx;
    
    .notes-title {
      display: block;
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 16rpx;
    }
    
    .notes-input {
      width: 100%;
      min-height: 160rpx;
      padding: 24rpx;
      background-color: #ffffff;
      border: 2rpx solid #e8e8e8;
      border-radius: 12rpx;
      font-size: 28rpx;
    }
  }
  
  .terms {
    margin-bottom: 32rpx;
    
    .terms-label {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #666666;
      
      checkbox {
        margin-right: 12rpx;
      }
      
      .terms-link {
        color: #1890ff;
        margin-left: 4rpx;
      }
    }
  }
  
  // Voucher Step
  .voucher-display {
    margin-bottom: 32rpx;
  }
  
  .success-tips {
    background-color: #f6ffed;
    border: 2rpx solid #b7eb8f;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 32rpx;
    
    .tip-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .tip-icon {
        font-size: 32rpx;
        margin-right: 16rpx;
      }
      
      .tip-text {
        flex: 1;
        font-size: 26rpx;
        color: #52c41a;
        line-height: 36rpx;
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
      &.btn-back,
      &.btn-home {
        background-color: #ffffff;
        color: #666666;
        border: 2rpx solid #e8e8e8;
      }
      
      &.btn-confirm,
      &.btn-save {
        background-color: #1890ff;
        color: #ffffff;
        border: none;
        
        &[disabled] {
          background-color: #d9d9d9;
        }
      }
    }
  }
}
</style>