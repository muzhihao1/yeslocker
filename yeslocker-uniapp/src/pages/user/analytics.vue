<template>
  <view class="analytics-page">
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">广告统计分析</text>
      <text class="page-desc">查看广告效果和数据分析</text>
    </view>
    
    <!-- Summary Cards -->
    <view class="summary-cards">
      <view class="summary-card">
        <text class="card-label">总曝光量</text>
        <text class="card-value">{{ analytics.totalExposures }}</text>
        <text class="card-desc">累计广告展示次数</text>
      </view>
      <view class="summary-card">
        <text class="card-label">总点击量</text>
        <text class="card-value">{{ analytics.totalClicks }}</text>
        <text class="card-desc">累计广告点击次数</text>
      </view>
      <view class="summary-card">
        <text class="card-label">平均点击率</text>
        <text class="card-value">{{ overallCTR }}%</text>
        <text class="card-desc">点击量/曝光量</text>
      </view>
    </view>
    
    <!-- Date Range Selector -->
    <view class="date-range">
      <text class="section-title">时间范围</text>
      <view class="date-tabs">
        <view 
          v-for="range in dateRanges" 
          :key="range.value"
          class="date-tab"
          :class="{ active: currentRange === range.value }"
          @click="selectDateRange(range.value)"
        >
          {{ range.label }}
        </view>
      </view>
    </view>
    
    <!-- Ad Performance List -->
    <view class="ad-list" v-if="Object.keys(analytics.adStats).length > 0">
      <text class="section-title">广告效果排行</text>
      <view 
        v-for="(stats, adId) in sortedAdStats" 
        :key="adId"
        class="ad-item"
        @click="viewAdDetail(adId, stats)"
      >
        <view class="ad-info">
          <text class="ad-title">{{ stats.title || `广告 ${adId}` }}</text>
          <view class="ad-metrics">
            <text class="metric">曝光: {{ stats.exposures }}</text>
            <text class="metric">点击: {{ stats.clicks }}</text>
            <text class="metric highlight">CTR: {{ stats.ctr }}%</text>
          </view>
        </view>
        <text class="ad-arrow">›</text>
      </view>
    </view>
    
    <!-- Position Stats -->
    <view class="position-stats" v-if="Object.keys(analytics.positionStats).length > 0">
      <text class="section-title">广告位效果</text>
      <view class="position-grid">
        <view 
          v-for="(stats, position) in analytics.positionStats" 
          :key="position"
          class="position-item"
        >
          <text class="position-name">{{ getPositionName(position) }}</text>
          <view class="position-data">
            <text class="data-value">{{ stats.clicks }}/{{ stats.exposures }}</text>
            <text class="data-label">点击/曝光</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Recent Events -->
    <view class="recent-events">
      <view class="section-header">
        <text class="section-title">最近事件</text>
        <text class="view-all" @click="viewAllEvents">查看全部</text>
      </view>
      <view class="event-list">
        <view 
          v-for="event in recentEvents" 
          :key="event.id"
          class="event-item"
        >
          <view class="event-icon" :class="'icon-' + event.eventType">
            {{ getEventIcon(event.eventType) }}
          </view>
          <view class="event-info">
            <text class="event-title">{{ event.adTitle }}</text>
            <text class="event-time">{{ formatEventTime(event.timestamp) }}</text>
          </view>
          <text class="event-type">{{ getEventTypeName(event.eventType) }}</text>
        </view>
      </view>
    </view>
    
    <!-- Empty State -->
    <view class="empty-state" v-if="Object.keys(analytics.adStats).length === 0">
      <image src="/static/empty-chart.png" mode="aspectFit" class="empty-image" />
      <text class="empty-text">暂无统计数据</text>
      <text class="empty-desc">广告数据将在用户交互后生成</text>
    </view>
    
    <!-- Action Buttons -->
    <view class="action-buttons">
      <button class="action-btn export" @click="exportData">
        <text class="btn-icon">📊</text>
        <text class="btn-text">导出数据</text>
      </button>
      <button class="action-btn clear" @click="confirmClearData">
        <text class="btn-icon">🗑️</text>
        <text class="btn-text">清空数据</text>
      </button>
    </view>
  </view>
</template>

<script>
import { 
  getAnalytics, 
  getEvents, 
  getDateRangeStats,
  exportAnalytics,
  clearAnalytics 
} from '@/utils/analytics'

export default {
  name: 'AnalyticsPage',
  data() {
    return {
      analytics: {
        totalClicks: 0,
        totalExposures: 0,
        adStats: {},
        positionStats: {},
        dailyStats: {}
      },
      recentEvents: [],
      currentRange: '7days',
      dateRanges: [
        { label: '今天', value: 'today' },
        { label: '7天', value: '7days' },
        { label: '30天', value: '30days' },
        { label: '全部', value: 'all' }
      ],
      refreshTimer: null
    }
  },
  computed: {
    overallCTR() {
      if (this.analytics.totalExposures === 0) return '0.00'
      return ((this.analytics.totalClicks / this.analytics.totalExposures) * 100).toFixed(2)
    },
    sortedAdStats() {
      // 按点击率排序
      const sorted = Object.entries(this.analytics.adStats)
        .sort((a, b) => parseFloat(b[1].ctr) - parseFloat(a[1].ctr))
        .reduce((obj, [key, value]) => {
          obj[key] = value
          return obj
        }, {})
      return sorted
    }
  },
  onLoad() {
    this.loadAnalytics()
    this.loadRecentEvents()
    
    // 定时刷新数据
    this.refreshTimer = setInterval(() => {
      this.loadAnalytics()
      this.loadRecentEvents()
    }, 5000) // 每5秒刷新一次
  },
  onUnload() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    loadAnalytics() {
      this.analytics = getAnalytics()
    },
    
    loadRecentEvents() {
      this.recentEvents = getEvents({ limit: 10 })
    },
    
    selectDateRange(range) {
      this.currentRange = range
      
      if (range === 'all') {
        this.loadAnalytics()
      } else {
        // 计算日期范围
        const endDate = new Date()
        const startDate = new Date()
        
        if (range === 'today') {
          startDate.setHours(0, 0, 0, 0)
        } else if (range === '7days') {
          startDate.setDate(startDate.getDate() - 7)
        } else if (range === '30days') {
          startDate.setDate(startDate.getDate() - 30)
        }
        
        const rangeStats = getDateRangeStats(startDate, endDate)
        
        // 更新显示的数据
        this.analytics.totalClicks = rangeStats.clicks
        this.analytics.totalExposures = rangeStats.exposures
        
        // TODO: 根据日期范围过滤广告统计
      }
    },
    
    viewAdDetail(adId, stats) {
      // TODO: 跳转到广告详情页
      uni.navigateTo({
        url: `/pages/user/ad-detail?adId=${adId}&title=${encodeURIComponent(stats.title)}`
      })
    },
    
    viewAllEvents() {
      // TODO: 跳转到事件列表页
      uni.navigateTo({
        url: '/pages/user/analytics-events'
      })
    },
    
    async exportData() {
      uni.showLoading({
        title: '导出中...'
      })
      
      try {
        const data = exportAnalytics()
        
        // 将数据转换为 JSON 字符串
        const jsonStr = JSON.stringify(data, null, 2)
        
        // 复制到剪贴板
        await uni.setClipboardData({
          data: jsonStr,
          success: () => {
            uni.hideLoading()
            uni.showToast({
              title: '数据已复制到剪贴板',
              icon: 'success'
            })
          }
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    },
    
    confirmClearData() {
      uni.showModal({
        title: '确认清空',
        content: '清空后所有统计数据将无法恢复，确定要清空吗？',
        success: (res) => {
          if (res.confirm) {
            this.clearData()
          }
        }
      })
    },
    
    clearData() {
      const success = clearAnalytics()
      
      if (success) {
        this.loadAnalytics()
        this.loadRecentEvents()
        
        uni.showToast({
          title: '数据已清空',
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: '清空失败',
          icon: 'none'
        })
      }
    },
    
    getPositionName(position) {
      const positionMap = {
        'home_banner': '首页轮播',
        'home_popup': '首页弹窗',
        'history_inline': '历史列表',
        'storage_bottom': '存储页底部',
        'profile_float': '个人中心浮动'
      }
      return positionMap[position] || position
    },
    
    getEventIcon(eventType) {
      const iconMap = {
        'exposure': '👁️',
        'click': '👆',
        'close': '❌'
      }
      return iconMap[eventType] || '📌'
    },
    
    getEventTypeName(eventType) {
      const typeMap = {
        'exposure': '曝光',
        'click': '点击',
        'close': '关闭'
      }
      return typeMap[eventType] || eventType
    },
    
    formatEventTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      if (date.toDateString() === now.toDateString()) {
        return `今天 ${hours}:${minutes}`
      }
      
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return `昨天 ${hours}:${minutes}`
      }
      
      return `${date.getMonth() + 1}/${date.getDate()} ${hours}:${minutes}`
    }
  }
}
</script>

<style lang="scss" scoped>
.analytics-page {
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  padding: 24rpx 32rpx;
  
  .summary-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx 24rpx;
    text-align: center;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .card-label {
      display: block;
      font-size: 26rpx;
      color: #666666;
      margin-bottom: 16rpx;
    }
    
    .card-value {
      display: block;
      font-size: 48rpx;
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 8rpx;
    }
    
    .card-desc {
      display: block;
      font-size: 22rpx;
      color: #999999;
    }
  }
}

.date-range {
  margin: 24rpx 32rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 16rpx;
  }
  
  .date-tabs {
    display: flex;
    background-color: #f0f0f0;
    border-radius: 12rpx;
    padding: 4rpx;
    
    .date-tab {
      flex: 1;
      text-align: center;
      padding: 16rpx 0;
      font-size: 28rpx;
      color: #666666;
      border-radius: 8rpx;
      transition: all 0.3s;
      
      &.active {
        background-color: #ffffff;
        color: #1890ff;
        font-weight: 500;
      }
    }
  }
}

.ad-list {
  margin: 24rpx 32rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 16rpx;
  }
  
  .ad-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    
    .ad-info {
      flex: 1;
      
      .ad-title {
        display: block;
        font-size: 30rpx;
        color: #333333;
        margin-bottom: 12rpx;
      }
      
      .ad-metrics {
        display: flex;
        gap: 24rpx;
        
        .metric {
          font-size: 26rpx;
          color: #666666;
          
          &.highlight {
            color: #1890ff;
            font-weight: 500;
          }
        }
      }
    }
    
    .ad-arrow {
      font-size: 32rpx;
      color: #999999;
    }
  }
}

.position-stats {
  margin: 24rpx 32rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 16rpx;
  }
  
  .position-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
    
    .position-item {
      background-color: #ffffff;
      border-radius: 12rpx;
      padding: 24rpx;
      text-align: center;
      
      .position-name {
        display: block;
        font-size: 28rpx;
        color: #666666;
        margin-bottom: 12rpx;
      }
      
      .position-data {
        .data-value {
          display: block;
          font-size: 32rpx;
          font-weight: 500;
          color: #333333;
          margin-bottom: 4rpx;
        }
        
        .data-label {
          display: block;
          font-size: 24rpx;
          color: #999999;
        }
      }
    }
  }
}

.recent-events {
  margin: 24rpx 32rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .view-all {
      font-size: 28rpx;
      color: #1890ff;
    }
  }
  
  .event-list {
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 16rpx;
    
    .event-item {
      display: flex;
      align-items: center;
      padding: 16rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .event-icon {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        margin-right: 16rpx;
        
        &.icon-exposure {
          background-color: #e6f7ff;
        }
        
        &.icon-click {
          background-color: #f6ffed;
        }
        
        &.icon-close {
          background-color: #fff1f0;
        }
      }
      
      .event-info {
        flex: 1;
        
        .event-title {
          display: block;
          font-size: 28rpx;
          color: #333333;
          margin-bottom: 4rpx;
        }
        
        .event-time {
          display: block;
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .event-type {
        font-size: 26rpx;
        color: #666666;
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
    font-size: 32rpx;
    color: #666666;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: #999999;
  }
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  margin-top: 48rpx;
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
    
    .btn-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }
    
    .btn-text {
      font-weight: 500;
    }
    
    &.export {
      background-color: #1890ff;
      color: #ffffff;
    }
    
    &.clear {
      background-color: #ffffff;
      color: #ff4d4f;
      border: 2rpx solid #ff4d4f;
    }
  }
}
</style>