<template>
  <view class="store-select-page">
    <!-- Header -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">选择您的门店</text>
        <text class="header-desc">请选择您要使用储物柜服务的门店</text>
      </view>
    </view>

    <!-- Store List -->
    <view class="store-list">
      <view 
        v-for="store in stores" 
        :key="store.id"
        class="store-item"
        :class="{ selected: selectedStore && selectedStore.id === store.id }"
        @click="selectStore(store)"
      >
        <view class="store-header">
          <view class="store-name-wrapper">
            <text class="store-name">{{ store.name }}</text>
            <view v-if="store.status !== 'active'" class="store-status" :class="store.status">
              {{ getStatusText(store.status) }}
            </view>
          </view>
          <view class="radio-wrapper">
            <view class="radio" :class="{ checked: selectedStore && selectedStore.id === store.id }">
              <view v-if="selectedStore && selectedStore.id === store.id" class="radio-inner"></view>
            </view>
          </view>
        </view>
        
        <view class="store-info">
          <view class="info-item">
            <text class="info-icon">📍</text>
            <text class="info-text">{{ store.address }}</text>
          </view>
          <view class="info-item">
            <text class="info-icon">📞</text>
            <text class="info-text">{{ store.phone }}</text>
          </view>
          <view class="info-item">
            <text class="info-icon">🕐</text>
            <text class="info-text">营业时间：{{ store.businessHours }}</text>
          </view>
          <view class="info-item">
            <text class="info-icon">🗄️</text>
            <text class="info-text">储物柜数量：{{ store.lockerCount }}个</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty State -->
    <view v-if="!loading && stores.length === 0" class="empty-state">
      <text class="empty-text">暂无可用门店</text>
    </view>

    <!-- Bottom Actions -->
    <view class="bottom-actions">
      <button class="btn-secondary" @click="handleBack">返回</button>
      <button 
        class="btn-primary" 
        :disabled="!selectedStore || selectedStore.status !== 'active'"
        @click="confirmSelection"
      >
        下一步
      </button>
    </view>
  </view>
</template>

<script>
import { getStoreList } from '@/api/store'

export default {
  name: 'StoreSelectPage',
  data() {
    return {
      stores: [],
      selectedStore: null,
      registrationData: null,
      loading: false
    }
  },
  onLoad(options) {
    // 获取注册数据
    this.registrationData = uni.getStorageSync('registrationData')
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
    
    // 加载门店列表
    this.loadStores()
  },
  methods: {
    async loadStores() {
      try {
        this.loading = true
        uni.showLoading({
          title: '加载中...'
        })
        
        const res = await getStoreList()
        
        if (res.errno === 0) {
          this.stores = res.data.list || []
          
          // 如果只有一个门店且状态为active，自动选中
          const activeStores = this.stores.filter(store => store.status === 'active')
          if (activeStores.length === 1) {
            this.selectedStore = activeStores[0]
          }
        } else {
          throw new Error(res.errmsg || '获取门店列表失败')
        }
        
      } catch (error) {
        console.error('加载门店列表失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
        
        // 开发环境使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          console.log('使用模拟数据')
          this.loadMockData()
        }
      } finally {
        this.loading = false
        uni.hideLoading()
      }
    },
    
    loadMockData() {
      // 模拟数据
      this.stores = [
        {
          id: 1,
          name: '耶氏体育台球俱乐部（总店）',
          code: 'YS001',
          address: '北京市朝阳区建国路88号',
          phone: '010-12345678',
          businessHours: '09:00-22:00',
          status: 'active',
          lockerCount: 20
        },
        {
          id: 2,
          name: '耶氏体育台球俱乐部（望京店）',
          code: 'YS002',
          address: '北京市朝阳区望京SOHO T2',
          phone: '010-87654321',
          businessHours: '10:00-23:00',
          status: 'active',
          lockerCount: 15
        },
        {
          id: 3,
          name: '耶氏体育台球俱乐部（中关村店）',
          code: 'YS003',
          address: '北京市海淀区中关村大街1号',
          phone: '010-11223344',
          businessHours: '09:00-21:00',
          status: 'maintenance',
          lockerCount: 25
        }
      ]
      
      // 自动选中第一个active门店
      const activeStores = this.stores.filter(store => store.status === 'active')
      if (activeStores.length > 0) {
        this.selectedStore = activeStores[0]
      }
    },
    
    selectStore(store) {
      if (store.status !== 'active') {
        uni.showToast({
          title: '该门店暂不可用',
          icon: 'none'
        })
        return
      }
      
      this.selectedStore = store
    },
    
    getStatusText(status) {
      const statusMap = {
        'active': '营业中',
        'inactive': '已停业',
        'maintenance': '维护中'
      }
      return statusMap[status] || status
    },
    
    handleBack() {
      uni.navigateBack()
    },
    
    confirmSelection() {
      if (!this.selectedStore) {
        uni.showToast({
          title: '请选择一个门店',
          icon: 'none'
        })
        return
      }
      
      if (this.selectedStore.status !== 'active') {
        uni.showToast({
          title: '该门店暂不可用',
          icon: 'none'
        })
        return
      }
      
      // 保存选中的门店信息
      uni.setStorageSync('selectedStore', this.selectedStore)
      
      // 跳转到选择储物柜页面
      uni.navigateTo({
        url: '/pages/auth/locker-select'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.store-select-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 200rpx; // 为底部按钮留出空间
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

.store-list {
  padding: 24rpx;
  
  .store-item {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 32rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    transition: all 0.3s;
    border: 2rpx solid transparent;
    
    &:active {
      transform: scale(0.98);
    }
    
    &.selected {
      border-color: #667eea;
      box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.15);
    }
    
    .store-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24rpx;
      
      .store-name-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .store-name {
          font-size: 34rpx;
          font-weight: 600;
          color: #333333;
        }
        
        .store-status {
          padding: 4rpx 16rpx;
          border-radius: 8rpx;
          font-size: 24rpx;
          
          &.inactive {
            background: #f5f5f5;
            color: #999999;
          }
          
          &.maintenance {
            background: #fff7e6;
            color: #faad14;
          }
        }
      }
      
      .radio-wrapper {
        padding: 8rpx;
        
        .radio {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          border: 4rpx solid #d9d9d9;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          
          &.checked {
            border-color: #667eea;
            
            .radio-inner {
              width: 24rpx;
              height: 24rpx;
              border-radius: 50%;
              background: #667eea;
            }
          }
        }
      }
    }
    
    .store-info {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-icon {
          font-size: 28rpx;
          margin-right: 12rpx;
          width: 40rpx;
          text-align: center;
        }
        
        .info-text {
          flex: 1;
          font-size: 28rpx;
          color: #666666;
          line-height: 1.5;
        }
      }
    }
  }
}

.empty-state {
  padding: 200rpx 32rpx;
  text-align: center;
  
  .empty-text {
    font-size: 32rpx;
    color: #999999;
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