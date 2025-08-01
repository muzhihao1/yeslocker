<template>
  <view class="statistics-page">
    <!-- Header -->
    <view class="header">
      <text class="title">数据统计</text>
      <view class="date-selector" @click="showDatePicker">
        <text>{{ dateRange }}</text>
        <text class="arrow">▼</text>
      </view>
    </view>
    
    <!-- Summary Cards -->
    <view class="summary-cards">
      <view class="summary-card">
        <view class="card-icon storage">📦</view>
        <view class="card-info">
          <text class="card-value">{{ summary.totalStorage }}</text>
          <text class="card-label">总存储次数</text>
        </view>
      </view>
      
      <view class="summary-card">
        <view class="card-icon days">📅</view>
        <view class="card-info">
          <text class="card-value">{{ summary.totalDays }}</text>
          <text class="card-label">累计天数</text>
        </view>
      </view>
      
      <view class="summary-card">
        <view class="card-icon fee">💰</view>
        <view class="card-info">
          <text class="card-value">¥{{ summary.totalFee }}</text>
          <text class="card-label">总费用</text>
        </view>
      </view>
      
      <view class="summary-card">
        <view class="card-icon saved">🎯</view>
        <view class="card-info">
          <text class="card-value">¥{{ summary.savedAmount }}</text>
          <text class="card-label">节省金额</text>
        </view>
      </view>
    </view>
    
    <!-- Storage Duration Chart -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">存储时长分布</text>
        <picker mode="selector" :range="chartTypes" @change="onChartTypeChange">
          <view class="chart-type-selector">
            <text>{{ currentChartType }}</text>
            <text class="arrow">▼</text>
          </view>
        </picker>
      </view>
      <canvas 
        canvas-id="durationChart" 
        class="chart-canvas"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      ></canvas>
    </view>
    
    <!-- Fee Analysis -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">费用分析</text>
        <view class="legend">
          <view class="legend-item">
            <view class="legend-color base"></view>
            <text>基础费用</text>
          </view>
          <view class="legend-item">
            <view class="legend-color overdue"></view>
            <text>超期费用</text>
          </view>
          <view class="legend-item">
            <view class="legend-color discount"></view>
            <text>优惠金额</text>
          </view>
        </view>
      </view>
      <canvas canvas-id="feeChart" class="chart-canvas"></canvas>
    </view>
    
    <!-- Locker Usage Heatmap -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">储物柜使用热力图</text>
        <text class="section-desc">颜色越深表示使用频率越高</text>
      </view>
      <view class="heatmap-container">
        <view class="heatmap-grid">
          <view 
            v-for="(locker, index) in lockerHeatmap" 
            :key="index"
            class="heatmap-cell"
            :style="{ backgroundColor: getHeatColor(locker.usage) }"
            @click="showLockerDetail(locker)"
          >
            <text class="locker-number">{{ locker.number }}</text>
            <text class="usage-count">{{ locker.usage }}</text>
          </view>
        </view>
        <view class="heatmap-scale">
          <view class="scale-bar"></view>
          <view class="scale-labels">
            <text>低</text>
            <text>中</text>
            <text>高</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Usage Trends -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">使用趋势</text>
        <view class="trend-tabs">
          <text 
            v-for="tab in trendTabs" 
            :key="tab.value"
            class="trend-tab"
            :class="{ active: currentTrendTab === tab.value }"
            @click="switchTrendTab(tab.value)"
          >
            {{ tab.label }}
          </text>
        </view>
      </view>
      <canvas canvas-id="trendChart" class="chart-canvas"></canvas>
    </view>
    
    <!-- Peak Hours Analysis -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">高峰时段分析</text>
      </view>
      <view class="peak-hours">
        <view 
          v-for="hour in peakHours" 
          :key="hour.hour"
          class="hour-bar"
        >
          <view 
            class="bar"
            :style="{ height: (hour.percentage * 2) + 'rpx' }"
          ></view>
          <text class="hour-label">{{ hour.hour }}时</text>
          <text class="hour-value">{{ hour.count }}</text>
        </view>
      </view>
    </view>
    
    <!-- Export Options -->
    <view class="export-section">
      <button class="export-btn" @click="exportData">
        <text class="icon">📊</text>
        <text>导出数据</text>
      </button>
      <button class="share-btn" @click="shareReport">
        <text class="icon">📤</text>
        <text>分享报告</text>
      </button>
    </view>
  </view>
</template>

<script>
// 引入图表库（这里使用轻量级的 wx-charts）
import wxCharts from '@/utils/wx-charts.js'

export default {
  name: 'Statistics',
  data() {
    return {
      // 日期范围
      dateRange: '最近30天',
      startDate: '',
      endDate: '',
      
      // 汇总数据
      summary: {
        totalStorage: 0,
        totalDays: 0,
        totalFee: 0,
        savedAmount: 0
      },
      
      // 图表类型
      chartTypes: ['柱状图', '饼图', '折线图'],
      currentChartType: '柱状图',
      
      // 图表实例
      durationChart: null,
      feeChart: null,
      trendChart: null,
      
      // 热力图数据
      lockerHeatmap: [],
      
      // 趋势标签
      trendTabs: [
        { label: '日', value: 'day' },
        { label: '周', value: 'week' },
        { label: '月', value: 'month' }
      ],
      currentTrendTab: 'day',
      
      // 高峰时段数据
      peakHours: [],
      
      // 原始数据
      rawData: []
    }
  },
  onLoad() {
    this.initDateRange()
    this.loadStatisticsData()
  },
  onReady() {
    // 页面渲染完成后初始化图表
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  methods: {
    initDateRange() {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      
      this.startDate = this.formatDate(start)
      this.endDate = this.formatDate(end)
    },
    
    async loadStatisticsData() {
      uni.showLoading({
        title: '加载中...'
      })
      
      try {
        // 加载统计数据
        const [summaryRes, detailRes, heatmapRes, peakRes] = await Promise.all([
          this.$api.statistics.getSummary({
            startDate: this.startDate,
            endDate: this.endDate
          }),
          this.$api.statistics.getDetails({
            startDate: this.startDate,
            endDate: this.endDate
          }),
          this.$api.statistics.getLockerHeatmap({
            startDate: this.startDate,
            endDate: this.endDate
          }),
          this.$api.statistics.getPeakHours({
            startDate: this.startDate,
            endDate: this.endDate
          })
        ])
        
        this.summary = summaryRes.data
        this.rawData = detailRes.data
        this.lockerHeatmap = heatmapRes.data
        this.peakHours = peakRes.data
        
        // 更新图表
        this.updateCharts()
        
      } catch (error) {
        console.error('加载统计数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    initCharts() {
      // 初始化存储时长图表
      this.initDurationChart()
      
      // 初始化费用分析图表
      this.initFeeChart()
      
      // 初始化趋势图表
      this.initTrendChart()
    },
    
    initDurationChart() {
      const ctx = uni.createCanvasContext('durationChart', this)
      
      // 处理数据
      const durationData = this.processDurationData()
      
      this.durationChart = new wxCharts({
        canvasId: 'durationChart',
        type: 'column',
        categories: durationData.categories,
        series: [{
          name: '存储次数',
          data: durationData.data,
          color: '#1890ff'
        }],
        yAxis: {
          title: '次数',
          min: 0
        },
        xAxis: {
          disableGrid: true
        },
        width: 350,
        height: 200,
        dataLabel: true,
        extra: {
          column: {
            width: 30
          }
        }
      })
    },
    
    initFeeChart() {
      const ctx = uni.createCanvasContext('feeChart', this)
      
      // 处理费用数据
      const feeData = this.processFeeData()
      
      this.feeChart = new wxCharts({
        canvasId: 'feeChart',
        type: 'column',
        categories: feeData.categories,
        series: [
          {
            name: '基础费用',
            data: feeData.baseFee,
            color: '#1890ff'
          },
          {
            name: '超期费用',
            data: feeData.overdueFee,
            color: '#ff4d4f'
          },
          {
            name: '优惠金额',
            data: feeData.discount,
            color: '#52c41a'
          }
        ],
        yAxis: {
          title: '金额(元)',
          min: 0
        },
        width: 350,
        height: 200,
        dataLabel: false
      })
    },
    
    initTrendChart() {
      const ctx = uni.createCanvasContext('trendChart', this)
      
      // 处理趋势数据
      const trendData = this.processTrendData()
      
      this.trendChart = new wxCharts({
        canvasId: 'trendChart',
        type: 'line',
        categories: trendData.categories,
        series: [{
          name: '使用次数',
          data: trendData.data,
          color: '#1890ff'
        }],
        yAxis: {
          title: '次数',
          min: 0
        },
        width: 350,
        height: 200,
        dataPointShape: true,
        dataLabel: false,
        extra: {
          lineStyle: 'curve'
        }
      })
    },
    
    processDurationData() {
      // 按存储时长分组统计
      const durationGroups = {
        '1天内': 0,
        '2-3天': 0,
        '4-7天': 0,
        '8-15天': 0,
        '16-30天': 0,
        '30天以上': 0
      }
      
      this.rawData.forEach(record => {
        const days = record.storageDays
        if (days <= 1) durationGroups['1天内']++
        else if (days <= 3) durationGroups['2-3天']++
        else if (days <= 7) durationGroups['4-7天']++
        else if (days <= 15) durationGroups['8-15天']++
        else if (days <= 30) durationGroups['16-30天']++
        else durationGroups['30天以上']++
      })
      
      return {
        categories: Object.keys(durationGroups),
        data: Object.values(durationGroups)
      }
    },
    
    processFeeData() {
      // 按月份分组统计费用
      const monthlyFee = {}
      
      this.rawData.forEach(record => {
        const month = new Date(record.storeTime).getMonth() + 1 + '月'
        if (!monthlyFee[month]) {
          monthlyFee[month] = {
            baseFee: 0,
            overdueFee: 0,
            discount: 0
          }
        }
        
        monthlyFee[month].baseFee += record.baseFee || 0
        monthlyFee[month].overdueFee += record.overdueFee || 0
        monthlyFee[month].discount += record.discount || 0
      })
      
      const categories = Object.keys(monthlyFee)
      
      return {
        categories,
        baseFee: categories.map(month => monthlyFee[month].baseFee),
        overdueFee: categories.map(month => monthlyFee[month].overdueFee),
        discount: categories.map(month => monthlyFee[month].discount)
      }
    },
    
    processTrendData() {
      // 根据当前选择的时间维度处理数据
      const trendMap = {}
      const dateFormat = this.getDateFormat()
      
      this.rawData.forEach(record => {
        const date = this.formatDateByTab(record.storeTime)
        trendMap[date] = (trendMap[date] || 0) + 1
      })
      
      // 补齐缺失的日期
      const filledData = this.fillMissingDates(trendMap)
      
      return {
        categories: Object.keys(filledData),
        data: Object.values(filledData)
      }
    },
    
    getDateFormat() {
      const formats = {
        day: 'MM-dd',
        week: '第W周',
        month: 'MM月'
      }
      return formats[this.currentTrendTab]
    },
    
    formatDateByTab(dateStr) {
      const date = new Date(dateStr)
      
      switch (this.currentTrendTab) {
        case 'day':
          return `${date.getMonth() + 1}-${date.getDate()}`
        case 'week':
          return `第${this.getWeekNumber(date)}周`
        case 'month':
          return `${date.getMonth() + 1}月`
        default:
          return dateStr
      }
    },
    
    getWeekNumber(date) {
      const firstDay = new Date(date.getFullYear(), 0, 1)
      const diff = date - firstDay
      return Math.ceil((diff / 86400000 + firstDay.getDay() + 1) / 7)
    },
    
    fillMissingDates(dataMap) {
      // 根据日期范围补齐缺失的数据点
      const filled = {}
      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = this.formatDateByTab(d)
        filled[dateKey] = dataMap[dateKey] || 0
      }
      
      return filled
    },
    
    getHeatColor(usage) {
      // 根据使用次数返回对应的颜色
      const maxUsage = Math.max(...this.lockerHeatmap.map(l => l.usage))
      const ratio = usage / maxUsage
      
      if (ratio === 0) return '#f0f0f0'
      else if (ratio < 0.2) return '#e6f7ff'
      else if (ratio < 0.4) return '#bae7ff'
      else if (ratio < 0.6) return '#91d5ff'
      else if (ratio < 0.8) return '#69c0ff'
      else return '#1890ff'
    },
    
    showDatePicker() {
      // 显示日期选择器
      const itemList = ['最近7天', '最近30天', '最近90天', '自定义范围']
      
      uni.showActionSheet({
        itemList,
        success: (res) => {
          const index = res.tapIndex
          if (index < 3) {
            const days = [7, 30, 90][index]
            this.setDateRange(days)
          } else {
            this.showCustomDatePicker()
          }
        }
      })
    },
    
    setDateRange(days) {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days)
      
      this.startDate = this.formatDate(start)
      this.endDate = this.formatDate(end)
      this.dateRange = `最近${days}天`
      
      // 重新加载数据
      this.loadStatisticsData()
    },
    
    showCustomDatePicker() {
      // 自定义日期范围选择
      uni.navigateTo({
        url: '/pages/common/date-range-picker'
      })
    },
    
    onChartTypeChange(e) {
      this.currentChartType = this.chartTypes[e.detail.value]
      // 重新绘制图表
      this.updateDurationChart()
    },
    
    switchTrendTab(tab) {
      this.currentTrendTab = tab
      // 更新趋势图表
      this.updateTrendChart()
    },
    
    updateCharts() {
      this.updateDurationChart()
      this.updateFeeChart()
      this.updateTrendChart()
    },
    
    updateDurationChart() {
      if (!this.durationChart) return
      
      const durationData = this.processDurationData()
      this.durationChart.updateData({
        categories: durationData.categories,
        series: [{
          name: '存储次数',
          data: durationData.data
        }]
      })
    },
    
    updateFeeChart() {
      if (!this.feeChart) return
      
      const feeData = this.processFeeData()
      this.feeChart.updateData({
        categories: feeData.categories,
        series: [
          {
            name: '基础费用',
            data: feeData.baseFee
          },
          {
            name: '超期费用',
            data: feeData.overdueFee
          },
          {
            name: '优惠金额',
            data: feeData.discount
          }
        ]
      })
    },
    
    updateTrendChart() {
      if (!this.trendChart) return
      
      const trendData = this.processTrendData()
      this.trendChart.updateData({
        categories: trendData.categories,
        series: [{
          name: '使用次数',
          data: trendData.data
        }]
      })
    },
    
    showLockerDetail(locker) {
      // 显示储物柜详细使用情况
      uni.navigateTo({
        url: `/pages/statistics/locker-detail?lockerId=${locker.id}&number=${locker.number}`
      })
    },
    
    async exportData() {
      const itemList = ['导出Excel', '导出PDF', '导出图片']
      
      uni.showActionSheet({
        itemList,
        success: async (res) => {
          const exportType = ['excel', 'pdf', 'image'][res.tapIndex]
          await this.performExport(exportType)
        }
      })
    },
    
    async performExport(type) {
      uni.showLoading({
        title: '导出中...'
      })
      
      try {
        // 准备导出数据
        const exportData = {
          summary: this.summary,
          dateRange: {
            start: this.startDate,
            end: this.endDate
          },
          details: this.rawData,
          charts: {
            duration: this.processDurationData(),
            fee: this.processFeeData(),
            trend: this.processTrendData(),
            heatmap: this.lockerHeatmap,
            peakHours: this.peakHours
          }
        }
        
        // 调用导出API
        const res = await this.$api.statistics.export({
          type,
          data: exportData
        })
        
        // 下载文件
        if (res.data.url) {
          uni.downloadFile({
            url: res.data.url,
            success: (downloadRes) => {
              if (downloadRes.statusCode === 200) {
                // 保存到本地
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
            }
          })
        }
        
      } catch (error) {
        console.error('导出失败:', error)
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    async shareReport() {
      // 生成分享图片
      uni.showLoading({
        title: '生成中...'
      })
      
      try {
        // 截取当前页面
        const res = await this.captureScreen()
        
        // 显示分享选项
        uni.showShareImageMenu({
          path: res.tempFilePath,
          success: () => {
            console.log('分享成功')
          }
        })
        
      } catch (error) {
        console.error('生成分享图片失败:', error)
        uni.showToast({
          title: '生成失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    captureScreen() {
      return new Promise((resolve, reject) => {
        // 使用 canvas 截屏
        uni.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          success: resolve,
          fail: reject
        }, this)
      })
    },
    
    formatDate(date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 图表交互
    touchStart(e) {
      if (this.durationChart) {
        this.durationChart.showToolTip(e, {
          background: '#7cb5ec'
        })
      }
    },
    
    touchMove(e) {
      if (this.durationChart) {
        this.durationChart.showToolTip(e, {
          background: '#7cb5ec'
        })
      }
    },
    
    touchEnd(e) {
      if (this.durationChart) {
        this.durationChart.showToolTip(e, {
          background: '#7cb5ec'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 32rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background-color: #ffffff;
  
  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
  }
  
  .date-selector {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background-color: #f0f0f0;
    border-radius: 24rpx;
    
    text {
      font-size: 28rpx;
      color: #666666;
    }
    
    .arrow {
      margin-left: 8rpx;
      font-size: 20rpx;
    }
  }
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding: 24rpx 32rpx;
  
  .summary-card {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background-color: #ffffff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .card-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      margin-right: 20rpx;
      
      &.storage {
        background-color: #e6f7ff;
      }
      
      &.days {
        background-color: #f6ffed;
      }
      
      &.fee {
        background-color: #fff7e6;
      }
      
      &.saved {
        background-color: #f9f0ff;
      }
    }
    
    .card-info {
      flex: 1;
      
      .card-value {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 4rpx;
      }
      
      .card-label {
        display: block;
        font-size: 24rpx;
        color: #999999;
      }
    }
  }
}

.chart-section {
  margin: 24rpx 32rpx;
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
    
    .section-desc {
      font-size: 24rpx;
      color: #999999;
    }
    
    .chart-type-selector {
      display: flex;
      align-items: center;
      padding: 8rpx 16rpx;
      background-color: #f0f0f0;
      border-radius: 16rpx;
      
      text {
        font-size: 24rpx;
        color: #666666;
      }
      
      .arrow {
        margin-left: 8rpx;
        font-size: 16rpx;
      }
    }
    
    .legend {
      display: flex;
      gap: 24rpx;
      
      .legend-item {
        display: flex;
        align-items: center;
        
        .legend-color {
          width: 24rpx;
          height: 24rpx;
          border-radius: 4rpx;
          margin-right: 8rpx;
          
          &.base {
            background-color: #1890ff;
          }
          
          &.overdue {
            background-color: #ff4d4f;
          }
          
          &.discount {
            background-color: #52c41a;
          }
        }
        
        text {
          font-size: 24rpx;
          color: #666666;
        }
      }
    }
    
    .trend-tabs {
      display: flex;
      gap: 24rpx;
      
      .trend-tab {
        padding: 8rpx 24rpx;
        font-size: 28rpx;
        color: #666666;
        background-color: #f0f0f0;
        border-radius: 16rpx;
        transition: all 0.3s;
        
        &.active {
          color: #ffffff;
          background-color: #1890ff;
        }
      }
    }
  }
  
  .chart-canvas {
    width: 100%;
    height: 400rpx;
  }
  
  .heatmap-container {
    .heatmap-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12rpx;
      margin-bottom: 24rpx;
      
      .heatmap-cell {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 8rpx;
        transition: all 0.3s;
        
        .locker-number {
          font-size: 24rpx;
          color: #333333;
          font-weight: 500;
        }
        
        .usage-count {
          font-size: 20rpx;
          color: #666666;
          margin-top: 4rpx;
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
    
    .heatmap-scale {
      margin-top: 24rpx;
      
      .scale-bar {
        height: 16rpx;
        background: linear-gradient(to right, #f0f0f0, #e6f7ff, #bae7ff, #91d5ff, #69c0ff, #1890ff);
        border-radius: 8rpx;
        margin-bottom: 8rpx;
      }
      
      .scale-labels {
        display: flex;
        justify-content: space-between;
        
        text {
          font-size: 24rpx;
          color: #999999;
        }
      }
    }
  }
  
  .peak-hours {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 300rpx;
    padding: 0 16rpx;
    
    .hour-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .bar {
        width: 24rpx;
        background-color: #1890ff;
        border-radius: 12rpx 12rpx 0 0;
        transition: height 0.3s;
        margin-bottom: 8rpx;
      }
      
      .hour-label {
        font-size: 20rpx;
        color: #999999;
        margin-bottom: 4rpx;
      }
      
      .hour-value {
        font-size: 20rpx;
        color: #666666;
        font-weight: 500;
      }
    }
  }
}

.export-section {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  
  button {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 44rpx;
    font-size: 30rpx;
    
    .icon {
      margin-right: 8rpx;
      font-size: 32rpx;
    }
  }
  
  .export-btn {
    background-color: #1890ff;
    color: #ffffff;
  }
  
  .share-btn {
    background-color: #52c41a;
    color: #ffffff;
  }
}
</style>