<template>
  <view class="locker-detail-page">
    <!-- Header -->
    <view class="header">
      <view class="header-info">
        <text class="locker-number">{{ lockerNumber }}</text>
        <view class="locker-status" :class="currentStatus">
          <text>{{ statusText }}</text>
        </view>
      </view>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-value">{{ stats.usageRate }}%</text>
          <text class="stat-label">使用率</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.avgDuration }}天</text>
          <text class="stat-label">平均时长</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.totalRevenue }}</text>
          <text class="stat-label">总收入</text>
        </view>
      </view>
    </view>
    
    <!-- Usage Calendar -->
    <view class="calendar-section">
      <view class="section-header">
        <text class="section-title">使用日历</text>
        <view class="month-selector" @click="showMonthPicker">
          <text>{{ currentMonth }}</text>
          <text class="arrow">▼</text>
        </view>
      </view>
      <view class="calendar-grid">
        <view class="weekday-header">
          <text v-for="day in weekdays" :key="day">{{ day }}</text>
        </view>
        <view class="days-grid">
          <view 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="day-cell"
            :class="getDayClass(day)"
            @click="selectDay(day)"
          >
            <text class="day-number">{{ day.date }}</text>
            <view v-if="day.hasData" class="day-indicator"></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Usage Timeline -->
    <view class="timeline-section">
      <view class="section-header">
        <text class="section-title">使用时间线</text>
        <text class="section-desc">最近10次使用记录</text>
      </view>
      <scroll-view scroll-y class="timeline-scroll">
        <view class="timeline">
          <view 
            v-for="(record, index) in usageRecords" 
            :key="record.id"
            class="timeline-item"
          >
            <view class="timeline-dot" :class="record.type"></view>
            <view class="timeline-content">
              <view class="record-header">
                <text class="record-user">{{ record.userName }}</text>
                <text class="record-time">{{ formatDateTime(record.time) }}</text>
              </view>
              <view class="record-info">
                <text class="record-type">{{ getRecordTypeText(record.type) }}</text>
                <text class="record-duration" v-if="record.duration">
                  存储{{ record.duration }}天
                </text>
              </view>
              <view class="record-fee" v-if="record.fee">
                <text>费用：¥{{ record.fee }}</text>
                <text class="fee-type" v-if="record.overdueFee">
                  (含超期费 ¥{{ record.overdueFee }})
                </text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- Usage Statistics Charts -->
    <view class="charts-section">
      <view class="section-header">
        <text class="section-title">使用分析</text>
      </view>
      
      <!-- Daily Usage Pattern -->
      <view class="chart-card">
        <text class="chart-title">每日使用模式</text>
        <view class="hour-chart">
          <view 
            v-for="(hour, index) in hourlyPattern" 
            :key="index"
            class="hour-item"
          >
            <view 
              class="hour-bar"
              :style="{ height: hour.percentage + '%' }"
            ></view>
            <text class="hour-label" v-if="index % 3 === 0">{{ index }}h</text>
          </view>
        </view>
      </view>
      
      <!-- User Type Distribution -->
      <view class="chart-card">
        <text class="chart-title">用户类型分布</text>
        <canvas canvas-id="userTypeChart" class="pie-chart"></canvas>
        <view class="chart-legend">
          <view class="legend-item" v-for="type in userTypes" :key="type.name">
            <view class="legend-dot" :style="{ backgroundColor: type.color }"></view>
            <text>{{ type.name }} ({{ type.percentage }}%)</text>
          </view>
        </view>
      </view>
      
      <!-- Revenue Trend -->
      <view class="chart-card">
        <text class="chart-title">收入趋势</text>
        <canvas canvas-id="revenueTrendChart" class="line-chart"></canvas>
      </view>
    </view>
    
    <!-- Maintenance Records -->
    <view class="maintenance-section">
      <view class="section-header">
        <text class="section-title">维护记录</text>
        <button class="add-btn" @click="addMaintenance">添加</button>
      </view>
      <view class="maintenance-list">
        <view 
          v-for="record in maintenanceRecords" 
          :key="record.id"
          class="maintenance-item"
        >
          <view class="maintenance-icon">🔧</view>
          <view class="maintenance-content">
            <text class="maintenance-type">{{ record.type }}</text>
            <text class="maintenance-date">{{ formatDate(record.date) }}</text>
            <text class="maintenance-note" v-if="record.note">{{ record.note }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Action Buttons -->
    <view class="action-buttons">
      <button class="btn-secondary" @click="exportLockerData">
        导出数据
      </button>
      <button class="btn-primary" @click="toggleStatus">
        {{ currentStatus === 'available' ? '设为维护' : '设为可用' }}
      </button>
    </view>
  </view>
</template>

<script>
import wxCharts from '@/utils/wx-charts.js'

export default {
  name: 'LockerDetail',
  data() {
    return {
      lockerId: '',
      lockerNumber: '',
      currentStatus: 'available',
      statusText: '可用',
      
      // 统计数据
      stats: {
        usageRate: 0,
        avgDuration: 0,
        totalRevenue: 0
      },
      
      // 日历数据
      currentMonth: '',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      calendarDays: [],
      selectedDay: null,
      
      // 使用记录
      usageRecords: [],
      
      // 图表数据
      hourlyPattern: [],
      userTypes: [],
      userTypeChart: null,
      revenueTrendChart: null,
      
      // 维护记录
      maintenanceRecords: []
    }
  },
  onLoad(options) {
    this.lockerId = options.lockerId
    this.lockerNumber = options.number
    
    // 设置当前月份
    const now = new Date()
    this.currentMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`
    
    // 加载数据
    this.loadLockerDetail()
    this.generateCalendar()
  },
  onReady() {
    // 初始化图表
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  methods: {
    async loadLockerDetail() {
      uni.showLoading({
        title: '加载中...'
      })
      
      try {
        // 并行加载所有数据
        const [detailRes, recordsRes, statsRes, maintenanceRes] = await Promise.all([
          this.$api.locker.getDetail(this.lockerId),
          this.$api.locker.getUsageRecords(this.lockerId, { limit: 10 }),
          this.$api.locker.getStatistics(this.lockerId),
          this.$api.locker.getMaintenanceRecords(this.lockerId)
        ])
        
        // 更新数据
        const detail = detailRes.data
        this.currentStatus = detail.status
        this.statusText = this.getStatusText(detail.status)
        
        this.usageRecords = recordsRes.data
        this.stats = statsRes.data
        this.maintenanceRecords = maintenanceRes.data
        
        // 处理图表数据
        this.processChartData(statsRes.data)
        
      } catch (error) {
        console.error('加载储物柜详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        available: '可用',
        occupied: '使用中',
        maintenance: '维护中',
        vip: 'VIP专属'
      }
      return statusMap[status] || '未知'
    },
    
    generateCalendar() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      
      // 获取月份第一天和最后一天
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // 获取第一天是星期几
      const firstWeekday = firstDay.getDay()
      
      // 生成日历数组
      const days = []
      
      // 填充上月的日期
      for (let i = firstWeekday - 1; i >= 0; i--) {
        days.push({
          date: '',
          isCurrentMonth: false,
          hasData: false
        })
      }
      
      // 填充当月日期
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
          date: i,
          isCurrentMonth: true,
          hasData: Math.random() > 0.5, // TODO: 替换为真实数据
          isToday: i === now.getDate() && month === now.getMonth()
        })
      }
      
      // 填充下月日期
      const remainingDays = 42 - days.length // 6行7列
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: '',
          isCurrentMonth: false,
          hasData: false
        })
      }
      
      this.calendarDays = days
    },
    
    getDayClass(day) {
      const classes = []
      if (!day.isCurrentMonth) classes.push('other-month')
      if (day.isToday) classes.push('today')
      if (day.hasData) classes.push('has-data')
      if (day === this.selectedDay) classes.push('selected')
      return classes.join(' ')
    },
    
    selectDay(day) {
      if (!day.isCurrentMonth || !day.hasData) return
      
      this.selectedDay = day
      // 加载该日期的详细数据
      this.loadDayDetail(day.date)
    },
    
    async loadDayDetail(date) {
      // 加载指定日期的使用详情
      try {
        const res = await this.$api.locker.getDayUsage(this.lockerId, {
          date: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`
        })
        
        // 显示详情
        this.showDayDetail(res.data)
        
      } catch (error) {
        console.error('加载日期详情失败:', error)
      }
    },
    
    showDayDetail(data) {
      // 显示日期详细信息
      uni.showModal({
        title: `${this.selectedDay.date}日使用详情`,
        content: `使用次数：${data.count}\n总时长：${data.totalHours}小时\n收入：¥${data.revenue}`,
        showCancel: false
      })
    },
    
    showMonthPicker() {
      // 显示月份选择器
      const currentYear = new Date().getFullYear()
      const months = []
      
      for (let i = 0; i < 12; i++) {
        months.push(`${currentYear}年${i + 1}月`)
      }
      
      uni.showActionSheet({
        itemList: months,
        success: (res) => {
          this.currentMonth = months[res.tapIndex]
          this.generateCalendar()
        }
      })
    },
    
    formatDateTime(time) {
      const date = new Date(time)
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    
    formatDate(date) {
      const d = new Date(date)
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    },
    
    getRecordTypeText(type) {
      const typeMap = {
        store: '存入',
        retrieve: '取出',
        overdue: '超期取出',
        maintenance: '维护'
      }
      return typeMap[type] || type
    },
    
    processChartData(stats) {
      // 处理每小时使用模式
      this.hourlyPattern = stats.hourlyPattern || Array(24).fill({ percentage: 0 })
      
      // 处理用户类型分布
      this.userTypes = [
        { name: '普通用户', percentage: 65, count: stats.regularUsers || 0, color: '#1890ff' },
        { name: 'VIP用户', percentage: 25, count: stats.vipUsers || 0, color: '#52c41a' },
        { name: '员工', percentage: 10, count: stats.staffUsers || 0, color: '#faad14' }
      ]
      
      // 更新图表
      if (this.userTypeChart) {
        this.updateUserTypeChart()
      }
    },
    
    initCharts() {
      // 初始化用户类型饼图
      this.initUserTypeChart()
      
      // 初始化收入趋势图
      this.initRevenueTrendChart()
    },
    
    initUserTypeChart() {
      this.userTypeChart = new wxCharts({
        canvasId: 'userTypeChart',
        type: 'pie',
        series: [{
          data: this.userTypes.map(type => type.count || type.percentage)
        }],
        categories: this.userTypes.map(type => type.name),
        width: 200,
        height: 200,
        dataLabel: true
      })
    },
    
    initRevenueTrendChart() {
      // 获取最近7天的收入数据
      const dates = []
      const revenues = []
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(`${date.getMonth() + 1}-${date.getDate()}`)
        revenues.push(Math.floor(Math.random() * 500) + 100) // TODO: 替换为真实数据
      }
      
      this.revenueTrendChart = new wxCharts({
        canvasId: 'revenueTrendChart',
        type: 'line',
        categories: dates,
        series: [{
          name: '收入',
          data: revenues,
          color: '#1890ff'
        }],
        yAxis: {
          title: '金额(元)',
          min: 0
        },
        width: 320,
        height: 180,
        dataLabel: false,
        dataPointShape: true,
        extra: {
          lineStyle: 'curve'
        }
      })
    },
    
    async toggleStatus() {
      const newStatus = this.currentStatus === 'available' ? 'maintenance' : 'available'
      const action = newStatus === 'maintenance' ? '设为维护' : '设为可用'
      
      uni.showModal({
        title: '确认操作',
        content: `确定要将储物柜${this.lockerNumber}${action}吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.$api.locker.updateStatus(this.lockerId, {
                status: newStatus
              })
              
              this.currentStatus = newStatus
              this.statusText = this.getStatusText(newStatus)
              
              uni.showToast({
                title: '状态更新成功',
                icon: 'success'
              })
              
            } catch (error) {
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    addMaintenance() {
      // 添加维护记录
      uni.navigateTo({
        url: `/pages/locker/add-maintenance?lockerId=${this.lockerId}&number=${this.lockerNumber}`
      })
    },
    
    async exportLockerData() {
      const itemList = ['导出使用记录', '导出收入报表', '导出完整数据']
      
      uni.showActionSheet({
        itemList,
        success: async (res) => {
          const exportType = ['usage', 'revenue', 'all'][res.tapIndex]
          
          uni.showLoading({
            title: '导出中...'
          })
          
          try {
            const response = await this.$api.locker.exportData(this.lockerId, {
              type: exportType,
              format: 'excel'
            })
            
            // 下载文件
            uni.downloadFile({
              url: response.data.url,
              success: (downloadRes) => {
                uni.saveFile({
                  tempFilePath: downloadRes.tempFilePath,
                  success: (saveRes) => {
                    uni.showToast({
                      title: '导出成功',
                      icon: 'success'
                    })
                    
                    // 打开文件
                    uni.openDocument({
                      filePath: saveRes.savedFilePath
                    })
                  }
                })
              }
            })
            
          } catch (error) {
            uni.showToast({
              title: '导出失败',
              icon: 'none'
            })
          } finally {
            uni.hideLoading()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.locker-detail-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 120rpx;
}

.header {
  background-color: #ffffff;
  padding: 32rpx;
  
  .header-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32rpx;
    
    .locker-number {
      font-size: 48rpx;
      font-weight: 600;
      color: #333333;
    }
    
    .locker-status {
      padding: 8rpx 24rpx;
      border-radius: 20rpx;
      font-size: 26rpx;
      
      &.available {
        background-color: #f6ffed;
        color: #52c41a;
      }
      
      &.occupied {
        background-color: #e6f7ff;
        color: #1890ff;
      }
      
      &.maintenance {
        background-color: #fff1f0;
        color: #ff4d4f;
      }
      
      &.vip {
        background-color: #fff7e6;
        color: #fa8c16;
      }
    }
  }
  
  .header-stats {
    display: flex;
    justify-content: space-around;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #1890ff;
        margin-bottom: 8rpx;
      }
      
      .stat-label {
        display: block;
        font-size: 24rpx;
        color: #999999;
      }
    }
  }
}

.calendar-section {
  margin: 24rpx;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .month-selector {
      display: flex;
      align-items: center;
      padding: 8rpx 16rpx;
      background-color: #f0f0f0;
      border-radius: 16rpx;
      
      text {
        font-size: 26rpx;
        color: #666666;
      }
      
      .arrow {
        margin-left: 8rpx;
        font-size: 20rpx;
      }
    }
  }
  
  .calendar-grid {
    .weekday-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 16rpx;
      
      text {
        text-align: center;
        font-size: 24rpx;
        color: #999999;
      }
    }
    
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8rpx;
      
      .day-cell {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 8rpx;
        position: relative;
        transition: all 0.3s;
        
        .day-number {
          font-size: 28rpx;
          color: #333333;
        }
        
        .day-indicator {
          position: absolute;
          bottom: 8rpx;
          width: 8rpx;
          height: 8rpx;
          border-radius: 50%;
          background-color: #1890ff;
        }
        
        &.other-month {
          .day-number {
            color: #e8e8e8;
          }
        }
        
        &.today {
          background-color: #e6f7ff;
          
          .day-number {
            color: #1890ff;
            font-weight: 600;
          }
        }
        
        &.has-data {
          &:active {
            background-color: #f0f0f0;
          }
        }
        
        &.selected {
          background-color: #1890ff;
          
          .day-number {
            color: #ffffff;
          }
        }
      }
    }
  }
}

.timeline-section {
  margin: 24rpx;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-desc {
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .timeline-scroll {
    height: 600rpx;
  }
  
  .timeline {
    position: relative;
    padding-left: 60rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 20rpx;
      top: 0;
      bottom: 0;
      width: 2rpx;
      background-color: #e8e8e8;
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 48rpx;
      
      .timeline-dot {
        position: absolute;
        left: -46rpx;
        top: 8rpx;
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background-color: #1890ff;
        border: 4rpx solid #ffffff;
        box-shadow: 0 0 0 2rpx #e8e8e8;
        
        &.store {
          background-color: #52c41a;
        }
        
        &.retrieve {
          background-color: #1890ff;
        }
        
        &.overdue {
          background-color: #ff4d4f;
        }
        
        &.maintenance {
          background-color: #faad14;
        }
      }
      
      .timeline-content {
        padding: 20rpx;
        background-color: #f5f6f7;
        border-radius: 12rpx;
        
        .record-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12rpx;
          
          .record-user {
            font-size: 30rpx;
            font-weight: 500;
            color: #333333;
          }
          
          .record-time {
            font-size: 24rpx;
            color: #999999;
          }
        }
        
        .record-info {
          display: flex;
          gap: 16rpx;
          margin-bottom: 8rpx;
          
          text {
            font-size: 26rpx;
            color: #666666;
          }
          
          .record-type {
            padding: 4rpx 12rpx;
            background-color: #e6f7ff;
            color: #1890ff;
            border-radius: 4rpx;
            font-size: 24rpx;
          }
        }
        
        .record-fee {
          font-size: 26rpx;
          color: #ff4d4f;
          
          .fee-type {
            margin-left: 8rpx;
            font-size: 24rpx;
            color: #999999;
          }
        }
      }
    }
  }
}

.charts-section {
  margin: 24rpx;
  
  .section-header {
    margin-bottom: 24rpx;
  }
  
  .chart-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    
    .chart-title {
      display: block;
      font-size: 30rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 24rpx;
    }
    
    .hour-chart {
      display: flex;
      align-items: flex-end;
      height: 200rpx;
      padding: 0 16rpx;
      
      .hour-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .hour-bar {
          width: 100%;
          background-color: #1890ff;
          border-radius: 4rpx 4rpx 0 0;
          transition: height 0.3s;
        }
        
        .hour-label {
          font-size: 20rpx;
          color: #999999;
          margin-top: 8rpx;
        }
      }
    }
    
    .pie-chart {
      width: 400rpx;
      height: 400rpx;
      margin: 0 auto;
    }
    
    .line-chart {
      width: 640rpx;
      height: 360rpx;
      margin: 0 auto;
    }
    
    .chart-legend {
      margin-top: 24rpx;
      
      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        .legend-dot {
          width: 24rpx;
          height: 24rpx;
          border-radius: 4rpx;
          margin-right: 12rpx;
        }
        
        text {
          font-size: 26rpx;
          color: #666666;
        }
      }
    }
  }
}

.maintenance-section {
  margin: 24rpx;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .add-btn {
      padding: 8rpx 24rpx;
      background-color: #1890ff;
      color: #ffffff;
      border-radius: 20rpx;
      font-size: 26rpx;
      border: none;
    }
  }
  
  .maintenance-list {
    .maintenance-item {
      display: flex;
      align-items: flex-start;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .maintenance-icon {
        font-size: 32rpx;
        margin-right: 16rpx;
      }
      
      .maintenance-content {
        flex: 1;
        
        .maintenance-type {
          display: block;
          font-size: 28rpx;
          color: #333333;
          margin-bottom: 8rpx;
        }
        
        .maintenance-date {
          display: block;
          font-size: 24rpx;
          color: #999999;
          margin-bottom: 8rpx;
        }
        
        .maintenance-note {
          display: block;
          font-size: 26rpx;
          color: #666666;
        }
      }
    }
  }
}

.action-buttons {
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
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    
    &.btn-secondary {
      background-color: #f0f0f0;
      color: #333333;
    }
    
    &.btn-primary {
      background-color: #1890ff;
      color: #ffffff;
    }
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}
</style>