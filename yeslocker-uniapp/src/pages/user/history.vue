<template>
  <view class="history-page">
    <!-- Loading Skeleton -->
    <history-page-skeleton v-if="initialLoading" :count="5" />
    
    <!-- Main Content -->
    <view v-else>
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">操作记录</text>
      <text class="page-desc">您的所有存取记录</text>
    </view>
    
    <!-- Filter Tabs -->
    <view class="filter-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <text class="tab-count" v-if="tab.count > 0">({{ tab.count }})</text>
      </view>
    </view>
    
    <!-- Records List -->
    <view class="records-list" v-if="filteredRecords.length > 0">
      <template v-for="(record, index) in filteredRecords">
        <view 
          :key="record.id"
          class="record-item"
          @click="viewRecordDetail(record)"
        >
        <!-- Record Header -->
        <view class="record-header">
          <view class="record-type" :class="'type-' + record.type">
            <text class="type-icon">{{ record.type === 'store' ? '📥' : '📤' }}</text>
            <text class="type-text">{{ record.type === 'store' ? '存储' : '取回' }}</text>
          </view>
          <text class="record-time">{{ formatDateTime(record.createTime) }}</text>
        </view>
        
        <!-- Record Content -->
        <view class="record-content">
          <view class="content-row">
            <text class="content-label">储物柜：</text>
            <text class="content-value">{{ record.lockerNumber }}号</text>
          </view>
          <view class="content-row" v-if="record.voucherCode">
            <text class="content-label">凭证码：</text>
            <text class="content-value code">{{ formatCode(record.voucherCode) }}</text>
          </view>
          <view class="content-row" v-if="record.notes">
            <text class="content-label">备注：</text>
            <text class="content-value">{{ record.notes }}</text>
          </view>
        </view>
        
        <!-- Record Status -->
        <view class="record-footer">
          <view class="status-tag" :class="'status-' + record.status">
            {{ getStatusText(record.status) }}
          </view>
          <view class="actions" v-if="record.status === 'active' && record.type === 'store'">
            <text class="action-btn" @click.stop="useVoucher(record)">使用凭证</text>
          </view>
        </view>
      </view>
      
      <!-- Insert inline ad after every 3 records -->
      <advertisement
        :key="index"
        v-if="(index + 1) % 3 === 0 && index < filteredRecords.length - 1"
        type="inline"
        :ad-data="inlineAd"
        :show-close-btn="false"
        position="history_inline"
        @click="handleAdClick"
      />
      </template>
    </view>
    
    <!-- Empty State -->
    <view class="empty-state" v-else>
      <lazy-image src="/static/empty-history.png" mode="aspectFit" custom-class="empty-image" :width="240" :height="240" />
      <text class="empty-text">暂无{{ currentTabText }}记录</text>
      <button class="empty-btn" @click="goToStorage" v-if="currentTab === 'all'">
        去存储球杆
      </button>
    </view>
    
    <!-- Load More -->
    <view class="load-more" v-if="hasMore && filteredRecords.length > 0">
      <text class="load-more-text" v-if="!loading" @click="loadMore">加载更多</text>
      <text class="load-more-text" v-else>加载中...</text>
    </view>
    
    <!-- Statistics Card -->
    <view class="stats-card" v-if="showStats">
      <view class="stats-header">
        <text class="stats-title">使用统计</text>
        <text class="stats-close" @click="showStats = false">✕</text>
      </view>
      <view class="stats-content">
        <view class="stat-item">
          <text class="stat-label">累计存储</text>
          <text class="stat-value">{{ stats.totalStore }}次</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">累计取回</text>
          <text class="stat-value">{{ stats.totalRetrieve }}次</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">平均存储时长</text>
          <text class="stat-value">{{ stats.avgDuration }}天</text>
        </view>
      </view>
    </view>
    
    <!-- Floating Button -->
    <view class="float-btn" @click="showStats = true">
      <text class="float-icon">📊</text>
    </view>
    </view>
    
    <!-- Network Error -->
    <network-error 
      v-if="networkError && !initialLoading"
      title="加载失败"
      message="无法获取历史记录"
      @retry="retryLoading"
    />
    
    <!-- Loading More Skeleton -->
    <view v-if="loading && !initialLoading" class="loading-more">
      <loading-skeleton type="list" :count="2" :show-avatar="false" />
    </view>
  </view>
</template>

<script>
import Advertisement from '@/components/molecules/Advertisement.vue'
import HistoryPageSkeleton from '@/components/molecules/HistoryPageSkeleton.vue'
import NetworkError from '@/components/atoms/NetworkError.vue'
import LoadingSkeleton from '@/components/atoms/LoadingSkeleton.vue'
import { getOperationHistory } from '@/api/locker'
import { toast } from '@/utils/toast'

export default {
  name: 'UserHistoryPage',
  components: {
    Advertisement,
    HistoryPageSkeleton,
    NetworkError,
    LoadingSkeleton
  },
  data() {
    return {
      tabs: [
        { label: '全部', value: 'all', count: 0 },
        { label: '存储中', value: 'active', count: 0 },
        { label: '已完成', value: 'completed', count: 0 }
      ],
      currentTab: 'all',
      records: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      initialLoading: true,
      networkError: false,
      showStats: false,
      stats: {
        totalStore: 0,
        totalRetrieve: 0,
        avgDuration: 0
      },
      inlineAd: {
        id: 'history_inline_1',
        title: '会员专享特权',
        description: '升级会员享受专属储物柜，优先使用权限',
        iconUrl: '/static/vip-icon.png',
        linkType: 'page',
        linkUrl: '/pages/user/membership',
        actionText: '立即查看'
      }
    }
  },
  computed: {
    filteredRecords() {
      if (this.currentTab === 'all') {
        return this.records
      } else if (this.currentTab === 'active') {
        return this.records.filter(r => r.status === 'active')
      } else {
        return this.records.filter(r => r.status === 'completed')
      }
    },
    currentTabText() {
      const tab = this.tabs.find(t => t.value === this.currentTab)
      return tab ? tab.label : ''
    }
  },
  onLoad() {
    this.initializeData()
  },
  onPullDownRefresh() {
    this.page = 1
    this.records = []
    this.loadRecords().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async initializeData() {
      this.initialLoading = true
      this.networkError = false
      
      try {
        await Promise.all([
          this.loadRecords(),
          this.loadStatistics()
        ])
        this.initialLoading = false
      } catch (error) {
        this.initialLoading = false
        
        // 判断是否是网络错误
        if (error.type === 'NETWORK_ERROR' || !navigator.onLine) {
          this.networkError = true
        } else {
          toast.error('加载失败，请稍后重试')
        }
      }
    },
    
    async retryLoading() {
      this.networkError = false
      await this.initializeData()
    },
    
    async loadRecords() {
      if (this.loading) return
      
      this.loading = true
      
      try {
        // 调用API获取历史记录
        const res = await getOperationHistory({
          page: this.page,
          size: this.pageSize,
          type: this.currentTab === 'all' ? undefined : (this.currentTab === 'active' ? 'store' : undefined),
          status: this.currentTab === 'all' ? undefined : this.currentTab
        })
        
        if (res.errno !== 0) {
          throw new Error(res.errmsg || '获取历史记录失败')
        }
        
        const { list, pagination } = res.data
        
        // 转换数据格式以兼容现有页面
        const formattedRecords = list.map(record => ({
          id: record.id,
          type: record.operationType, // operationType -> type
          lockerNumber: record.lockerNumber,
          lockerId: record.lockerId,
          voucherCode: record.voucherCode,
          code: record.voucherCode, // 兼容性
          status: record.status,
          createTime: new Date(record.createdAt).getTime(), // ISO string -> timestamp
          completeTime: record.completedAt ? new Date(record.completedAt).getTime() : null,
          notes: record.notes,
          fee: record.fee,
          daysUsed: record.daysUsed
        }))
        
        if (this.page === 1) {
          this.records = formattedRecords
        } else {
          this.records = [...this.records, ...formattedRecords]
        }
        
        // 更新统计
        this.updateTabCounts()
        
        // 检查是否有更多数据
        this.hasMore = pagination.hasMore
        
        this.page++
      } catch (error) {
        console.error('加载记录失败:', error)
        
        // 第一页加载失败时抛出错误，让上层处理
        if (this.page === 1) {
          throw error
        } else {
          // 加载更多失败时，显示错误提示但不影响已有数据
          toast.error('加载更多失败')
        }
      } finally {
        this.loading = false
      }
    },
    
    async loadStatistics() {
      try {
        // 获取所有记录来计算统计（简化版本，实际应该有专门的统计API）
        const res = await getOperationHistory({
          page: 1,
          size: 100 // 获取更多数据用于统计
        })
        
        if (res.errno === 0) {
          const allRecords = res.data.list
          
          // 计算统计数据
          const storeCount = allRecords.filter(r => r.operationType === 'store').length
          const retrieveCount = allRecords.filter(r => r.operationType === 'retrieve').length
          
          // 计算平均存储时长（完成的存储记录）
          const completedStores = allRecords.filter(r => 
            r.operationType === 'store' && 
            r.status === 'completed' && 
            r.daysUsed
          )
          
          let avgDuration = 0
          if (completedStores.length > 0) {
            const totalDuration = completedStores.reduce((sum, record) => {
              return sum + (record.daysUsed || 0)
            }, 0)
            avgDuration = (totalDuration / completedStores.length).toFixed(1)
          }
          
          this.stats = {
            totalStore: storeCount,
            totalRetrieve: retrieveCount,
            avgDuration: avgDuration
          }
        }
      } catch (error) {
        console.error('加载统计失败:', error)
        // 统计失败不影响主功能，静默处理
      }
    },
    
    updateTabCounts() {
      const all = this.records.length
      const active = this.records.filter(r => r.status === 'active').length
      const completed = this.records.filter(r => r.status === 'completed').length
      
      this.tabs[0].count = all
      this.tabs[1].count = active
      this.tabs[2].count = completed
    },
    
    generateMockCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    },
    
    switchTab(value) {
      if (this.currentTab === value) return
      
      this.currentTab = value
      this.page = 1
      this.records = []
      this.hasMore = true
      this.networkError = false
      
      // 切换标签时显示简单的加载状态
      this.loading = true
      this.loadRecords().catch(error => {
        this.loading = false
        if (error.type === 'NETWORK_ERROR') {
          this.networkError = true
        } else {
          toast.error('加载失败')
        }
      })
    },
    
    formatDateTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      // 今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `今天 ${hours}:${minutes}`
      }
      
      // 昨天
      if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `昨天 ${hours}:${minutes}`
      }
      
      // 其他日期
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      if (date.getFullYear() === now.getFullYear()) {
        return `${month}-${day} ${hours}:${minutes}`
      }
      
      return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}`
    },
    
    formatCode(code) {
      if (!code || code.length !== 12) return code
      return code.match(/.{1,4}/g).join('-')
    },
    
    getStatusText(status) {
      const statusMap = {
        active: '存储中',
        completed: '已完成',
        expired: '已过期',
        cancelled: '已取消'
      }
      return statusMap[status] || status
    },
    
    viewRecordDetail(record) {
      // 跳转到申请详情页
      uni.navigateTo({
        url: `/pages/storage/request-detail?code=${record.voucherCode}&type=${record.type}`
      })
    },
    
    useVoucher(record) {
      // 跳转到申请详情页
      uni.navigateTo({
        url: `/pages/storage/request-detail?code=${record.voucherCode}&type=${record.type}`
      })
    },
    
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.loadRecords()
      }
    },
    
    goToStorage() {
      uni.switchTab({
        url: '/pages/storage/index'
      })
    },
    
    handleAdClick(ad) {
      // 广告点击处理
      console.log('历史页面广告被点击:', ad)
      
      // 可以添加特定的业务逻辑
      // 比如跳转到会员页面等
    }
  }
}
</script>

<style lang="scss" scoped>
.history-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 32rpx;
}

.page-header {
  padding: 32rpx;
  background-color: #ffffff;
  text-align: center;
  
  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 8rpx;
  }
  
  .page-desc {
    display: block;
    font-size: 28rpx;
    color: #666666;
  }
}

.filter-tabs {
  display: flex;
  padding: 0 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 0;
    position: relative;
    
    .tab-text {
      font-size: 30rpx;
      color: #666666;
      transition: all 0.3s;
    }
    
    .tab-count {
      font-size: 24rpx;
      color: #999999;
      margin-left: 8rpx;
    }
    
    &.active {
      .tab-text {
        color: #1890ff;
        font-weight: 500;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #1890ff;
      }
    }
  }
}

.records-list {
  padding: 24rpx 32rpx;
  
  .record-item {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      
      .record-type {
        display: flex;
        align-items: center;
        
        .type-icon {
          font-size: 32rpx;
          margin-right: 12rpx;
        }
        
        .type-text {
          font-size: 30rpx;
          font-weight: 500;
        }
        
        &.type-store {
          .type-text {
            color: #52c41a;
          }
        }
        
        &.type-retrieve {
          .type-text {
            color: #1890ff;
          }
        }
      }
      
      .record-time {
        font-size: 26rpx;
        color: #999999;
      }
    }
    
    .record-content {
      margin-bottom: 24rpx;
      
      .content-row {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .content-label {
          font-size: 28rpx;
          color: #666666;
          width: 120rpx;
        }
        
        .content-value {
          flex: 1;
          font-size: 28rpx;
          color: #333333;
          
          &.code {
            font-family: monospace;
            color: #1890ff;
          }
        }
      }
    }
    
    .record-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .status-tag {
        display: inline-block;
        padding: 8rpx 20rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        
        &.status-active {
          background-color: #f6ffed;
          color: #52c41a;
        }
        
        &.status-completed {
          background-color: #f0f0f0;
          color: #666666;
        }
        
        &.status-expired {
          background-color: #fff1f0;
          color: #ff4d4f;
        }
      }
      
      .actions {
        .action-btn {
          font-size: 28rpx;
          color: #1890ff;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 32rpx;
  
  .empty-image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
  }
  
  .empty-text {
    font-size: 30rpx;
    color: #999999;
    margin-bottom: 48rpx;
  }
  
  .empty-btn {
    width: 280rpx;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #1890ff;
    color: #ffffff;
    border-radius: 40rpx;
    font-size: 30rpx;
  }
}

.load-more {
  text-align: center;
  padding: 32rpx 0;
  
  .load-more-text {
    font-size: 28rpx;
    color: #999999;
  }
}

.stats-card {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: 120rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.15);
  z-index: 100;
  
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    
    .stats-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .stats-close {
      font-size: 32rpx;
      color: #999999;
    }
  }
  
  .stats-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
    
    .stat-item {
      text-align: center;
      
      .stat-label {
        display: block;
        font-size: 26rpx;
        color: #666666;
        margin-bottom: 12rpx;
      }
      
      .stat-value {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #1890ff;
      }
    }
  }
}

.float-btn {
  position: fixed;
  right: 32rpx;
  bottom: 160rpx;
  width: 96rpx;
  height: 96rpx;
  background-color: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
  
  .float-icon {
    font-size: 40rpx;
  }
}
</style>