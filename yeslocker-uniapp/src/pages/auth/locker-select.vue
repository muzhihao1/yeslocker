<template>
  <view class="locker-select-page">
    <!-- Header -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">选择您的专属储物柜</text>
        <text class="header-desc">选定后将作为您的固定存储位置</text>
      </view>
    </view>

    <!-- Zone Selection -->
    <view class="zone-section">
      <text class="section-title">选择区域</text>
      <scroll-view scroll-x class="zone-tabs" :show-scrollbar="false">
        <view 
          v-for="zone in zones" 
          :key="zone.id"
          class="zone-tab"
          :class="{ active: selectedZone === zone.id }"
          @click="selectZone(zone.id)"
        >
          <text class="zone-name">{{ zone.name }}</text>
          <text class="zone-info">可用 {{ zone.available }}/{{ zone.total }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- Locker Grid -->
    <view class="locker-section">
      <text class="section-title">选择储物柜</text>
      <view class="locker-grid">
        <view 
          v-for="locker in filteredLockers" 
          :key="locker.id"
          class="locker-item"
          :class="{ 
            available: locker.status === 'available',
            occupied: locker.status === 'occupied',
            selected: selectedLocker && selectedLocker.id === locker.id
          }"
          @click="selectLocker(locker)"
        >
          <text class="locker-number">{{ locker.number }}</text>
          <text class="locker-status">{{ getLockerStatusText(locker.status) }}</text>
        </view>
      </view>
    </view>

    <!-- Selected Locker Preview -->
    <view v-if="selectedLocker" class="preview-section">
      <view class="preview-card">
        <view class="preview-header">
          <text class="preview-title">已选择储物柜</text>
          <text class="preview-number">{{ selectedLocker.number }}</text>
        </view>
        <view class="preview-info">
          <view class="info-item">
            <text class="info-label">位置：</text>
            <text class="info-value">{{ getZoneName(selectedLocker.zone_id) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">规格：</text>
            <text class="info-value">{{ selectedLocker.size }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">状态：</text>
            <text class="info-value success">可用</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Bottom Actions -->
    <view class="bottom-actions">
      <button class="btn-secondary" @click="handleBack">返回</button>
      <button 
        class="btn-primary" 
        :disabled="!selectedLocker"
        @click="confirmSelection"
      >
        确认选择
      </button>
    </view>
  </view>
</template>

<script>
import { getAvailableLockers } from '@/api/locker'
import { completeRegistration } from '@/api/auth'

export default {
  name: 'LockerSelectPage',
  data() {
    return {
      zones: [
        { id: 'A', name: 'A区', available: 15, total: 30 },
        { id: 'B', name: 'B区', available: 20, total: 40 },
        { id: 'C', name: 'C区', available: 10, total: 25 },
        { id: 'D', name: 'D区', available: 25, total: 35 }
      ],
      selectedZone: 'A',
      lockers: [],
      selectedLocker: null,
      registrationData: null,
      selectedStore: null,
      loading: false
    }
  },
  computed: {
    filteredLockers() {
      return this.lockers.filter(locker => locker.zone_id === this.selectedZone)
    }
  },
  onLoad(options) {
    // 获取注册数据
    this.registrationData = uni.getStorageSync('registrationData')
    this.selectedStore = uni.getStorageSync('selectedStore')
    
    if (!this.registrationData) {
      uni.showModal({
        title: '提示',
        content: '请先完成身份验证',
        showCancel: false,
        success: () => {
          uni.navigateBack()
        }
      })
      return
    }
    
    if (!this.selectedStore) {
      uni.showModal({
        title: '提示',
        content: '请先选择门店',
        showCancel: false,
        success: () => {
          uni.navigateBack()
        }
      })
      return
    }
    
    // 加载可用储物柜
    this.loadAvailableLockers()
  },
  methods: {
    async loadAvailableLockers() {
      try {
        this.loading = true
        
        // 调用 API 获取可用储物柜，传入门店ID进行筛选
        const res = await getAvailableLockers({ storeId: this.selectedStore.id })
        
        if (res.errno === 0) {
          this.lockers = res.data.list || []
          
          // 更新区域统计信息
          this.updateZoneStats()
        } else {
          throw new Error(res.errmsg || '获取储物柜列表失败')
        }
        
      } catch (error) {
        console.error('加载储物柜失败:', error)
        
        // 开发环境使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          console.log('使用模拟数据')
          this.loadMockData()
        } else {
          uni.showToast({
            title: error.message || '加载失败',
            icon: 'none'
          })
        }
      } finally {
        this.loading = false
      }
    },
    
    loadMockData() {
      // 模拟数据
      const mockLockers = []
      const zones = ['A', 'B', 'C', 'D']
      
      zones.forEach(zone => {
        for (let i = 1; i <= 30; i++) {
          mockLockers.push({
            id: `${zone}${i}`,
            number: `${zone}${i.toString().padStart(2, '0')}`,
            zone_id: zone,
            status: Math.random() > 0.3 ? 'available' : 'occupied',
            size: i <= 10 ? '大号' : i <= 20 ? '中号' : '小号'
          })
        }
      })
      
      this.lockers = mockLockers
      this.updateZoneStats()
    },
    
    updateZoneStats() {
      // 更新区域统计
      const stats = {}
      this.lockers.forEach(locker => {
        if (!stats[locker.zone_id]) {
          stats[locker.zone_id] = { total: 0, available: 0 }
        }
        stats[locker.zone_id].total++
        if (locker.status === 'available') {
          stats[locker.zone_id].available++
        }
      })
      
      // 更新zones数据
      this.zones = this.zones.map(zone => ({
        ...zone,
        total: stats[zone.id]?.total || 0,
        available: stats[zone.id]?.available || 0
      }))
    },
    
    selectZone(zoneId) {
      this.selectedZone = zoneId
      // 清除之前的选择
      if (this.selectedLocker && this.selectedLocker.zone_id !== zoneId) {
        this.selectedLocker = null
      }
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
    
    getLockerStatusText(status) {
      const statusMap = {
        'available': '可用',
        'occupied': '已占用',
        'maintenance': '维护中'
      }
      return statusMap[status] || status
    },
    
    getZoneName(zoneId) {
      const zone = this.zones.find(z => z.id === zoneId)
      return zone ? zone.name : zoneId
    },
    
    handleBack() {
      uni.showModal({
        title: '提示',
        content: '确定要返回吗？您需要重新进行身份验证。',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    },
    
    async confirmSelection() {
      if (!this.selectedLocker) {
        uni.showToast({
          title: '请选择一个储物柜',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: '确认选择',
        content: `您选择了 ${this.selectedLocker.number} 号储物柜，确定后将作为您的专属储物柜。`,
        success: async (res) => {
          if (res.confirm) {
            await this.submitRegistration()
          }
        }
      })
    },
    
    async submitRegistration() {
      try {
        uni.showLoading({
          title: '正在提交...'
        })
        
        // 组合注册数据
        const registrationData = {
          ...this.registrationData,
          lockerId: this.selectedLocker.id,
          storeId: this.selectedStore.id
        }
        
        // 调用注册 API
        const res = await completeRegistration(registrationData)
        
        if (res.errno === 0) {
          // 保存用户信息
          const userInfo = res.data.userInfo
          uni.setStorageSync('userInfo', userInfo)
          uni.setStorageSync('token', res.data.token)
          uni.setStorageSync('isVerified', true)
          uni.removeStorageSync('registrationData')
          uni.removeStorageSync('selectedStore')
          
          uni.hideLoading()
          
          // 显示成功
          uni.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000
          })
          
          // 跳转到首页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/home/index'
            })
          }, 2000)
        } else {
          throw new Error(res.errmsg || '注册失败')
        }
        
      } catch (error) {
        uni.hideLoading()
        console.error('提交注册失败:', error)
        uni.showModal({
          title: '提交失败',
          content: error.message || '注册失败，请重试',
          showCancel: false
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.locker-select-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 32rpx 60rpx;
  
  .header-content {
    .header-title {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 12rpx;
    }
    
    .header-desc {
      display: block;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.zone-section {
  background: #ffffff;
  padding: 32rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 24rpx;
  }
  
  .zone-tabs {
    white-space: nowrap;
    
    .zone-tab {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx 32rpx;
      margin-right: 20rpx;
      background: #f5f6f7;
      border-radius: 16rpx;
      transition: all 0.3s;
      
      .zone-name {
        font-size: 30rpx;
        font-weight: 500;
        color: #666666;
        margin-bottom: 8rpx;
      }
      
      .zone-info {
        font-size: 24rpx;
        color: #999999;
      }
      
      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        
        .zone-name,
        .zone-info {
          color: #ffffff;
        }
      }
    }
  }
}

.locker-section {
  background: #ffffff;
  padding: 32rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 24rpx;
  }
  
  .locker-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16rpx;
    
    .locker-item {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      border: 2rpx solid #e8e8e8;
      transition: all 0.3s;
      
      .locker-number {
        font-size: 28rpx;
        font-weight: 600;
        margin-bottom: 4rpx;
      }
      
      .locker-status {
        font-size: 20rpx;
      }
      
      &.available {
        background: #f0f9ff;
        border-color: #1890ff;
        color: #1890ff;
        
        &:active {
          transform: scale(0.95);
        }
      }
      
      &.occupied {
        background: #f5f5f5;
        color: #999999;
        cursor: not-allowed;
      }
      
      &.selected {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        color: #ffffff;
        box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
        transform: scale(1.05);
      }
    }
  }
}

.preview-section {
  padding: 32rpx;
  
  .preview-card {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 32rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      padding-bottom: 24rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .preview-title {
        font-size: 30rpx;
        color: #666666;
      }
      
      .preview-number {
        font-size: 36rpx;
        font-weight: bold;
        color: #667eea;
      }
    }
    
    .preview-info {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          font-size: 28rpx;
          color: #999999;
          margin-right: 16rpx;
        }
        
        .info-value {
          font-size: 28rpx;
          color: #333333;
          
          &.success {
            color: #52c41a;
          }
        }
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 24rpx;
  
  button {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.btn-secondary {
      background: #f5f6f7;
      color: #666666;
      
      &:active {
        opacity: 0.8;
      }
    }
    
    &.btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      
      &:active:not(:disabled) {
        opacity: 0.8;
      }
      
      &:disabled {
        opacity: 0.5;
      }
    }
  }
}
</style>