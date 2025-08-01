/**
 * 广告统计分析工具
 * 用于收集和分析广告点击、曝光等数据
 */

const ANALYTICS_KEY = 'yeslocker_ad_analytics'
const ANALYTICS_EVENTS_KEY = 'yeslocker_ad_events'
const MAX_EVENTS = 1000 // 最多保存1000条事件

/**
 * 记录广告事件
 * @param {String} eventType - 事件类型 (click|exposure|close)
 * @param {Object} adData - 广告数据
 * @param {String} position - 广告位置
 */
export function trackAdEvent(eventType, adData, position = '') {
  try {
    const event = {
      id: Date.now().toString(),
      eventType,
      adId: adData.id || '',
      adTitle: adData.title || '',
      position,
      timestamp: new Date().getTime(),
      date: formatDate(new Date()),
      userId: uni.getStorageSync('userInfo')?.userId || 'anonymous'
    }
    
    // 获取现有事件
    let events = uni.getStorageSync(ANALYTICS_EVENTS_KEY) || []
    
    // 添加新事件
    events.unshift(event)
    
    // 限制事件数量
    if (events.length > MAX_EVENTS) {
      events = events.slice(0, MAX_EVENTS)
    }
    
    // 保存事件
    uni.setStorageSync(ANALYTICS_EVENTS_KEY, events)
    
    // 更新统计数据
    updateAnalytics(eventType, adData, position)
    
    // 如果是生产环境，可以在这里发送到服务器
    if (process.env.NODE_ENV === 'production') {
      sendToServer(event)
    }
    
    return event
  } catch (error) {
    console.error('记录广告事件失败:', error)
    return null
  }
}

/**
 * 更新统计数据
 */
function updateAnalytics(eventType, adData, position) {
  try {
    let analytics = uni.getStorageSync(ANALYTICS_KEY) || {
      totalClicks: 0,
      totalExposures: 0,
      adStats: {},
      positionStats: {},
      dailyStats: {}
    }
    
    // 更新总计数
    if (eventType === 'click') {
      analytics.totalClicks++
    } else if (eventType === 'exposure') {
      analytics.totalExposures++
    }
    
    // 更新广告统计
    const adId = adData.id || 'unknown'
    if (!analytics.adStats[adId]) {
      analytics.adStats[adId] = {
        title: adData.title || '',
        clicks: 0,
        exposures: 0,
        ctr: 0 // 点击率
      }
    }
    
    if (eventType === 'click') {
      analytics.adStats[adId].clicks++
    } else if (eventType === 'exposure') {
      analytics.adStats[adId].exposures++
    }
    
    // 计算点击率
    if (analytics.adStats[adId].exposures > 0) {
      analytics.adStats[adId].ctr = (
        (analytics.adStats[adId].clicks / analytics.adStats[adId].exposures) * 100
      ).toFixed(2)
    }
    
    // 更新位置统计
    if (position) {
      if (!analytics.positionStats[position]) {
        analytics.positionStats[position] = {
          clicks: 0,
          exposures: 0
        }
      }
      
      if (eventType === 'click') {
        analytics.positionStats[position].clicks++
      } else if (eventType === 'exposure') {
        analytics.positionStats[position].exposures++
      }
    }
    
    // 更新每日统计
    const today = formatDate(new Date())
    if (!analytics.dailyStats[today]) {
      analytics.dailyStats[today] = {
        clicks: 0,
        exposures: 0
      }
    }
    
    if (eventType === 'click') {
      analytics.dailyStats[today].clicks++
    } else if (eventType === 'exposure') {
      analytics.dailyStats[today].exposures++
    }
    
    // 保存统计数据
    uni.setStorageSync(ANALYTICS_KEY, analytics)
  } catch (error) {
    console.error('更新统计数据失败:', error)
  }
}

/**
 * 获取统计数据
 */
export function getAnalytics() {
  try {
    return uni.getStorageSync(ANALYTICS_KEY) || {
      totalClicks: 0,
      totalExposures: 0,
      adStats: {},
      positionStats: {},
      dailyStats: {}
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return {
      totalClicks: 0,
      totalExposures: 0,
      adStats: {},
      positionStats: {},
      dailyStats: {}
    }
  }
}

/**
 * 获取事件列表
 * @param {Object} options - 查询选项
 * @param {String} options.eventType - 事件类型筛选
 * @param {String} options.adId - 广告ID筛选
 * @param {Number} options.limit - 返回数量限制
 */
export function getEvents(options = {}) {
  try {
    let events = uni.getStorageSync(ANALYTICS_EVENTS_KEY) || []
    
    // 筛选事件类型
    if (options.eventType) {
      events = events.filter(e => e.eventType === options.eventType)
    }
    
    // 筛选广告ID
    if (options.adId) {
      events = events.filter(e => e.adId === options.adId)
    }
    
    // 限制返回数量
    if (options.limit && options.limit > 0) {
      events = events.slice(0, options.limit)
    }
    
    return events
  } catch (error) {
    console.error('获取事件列表失败:', error)
    return []
  }
}

/**
 * 获取广告详细统计
 * @param {String} adId - 广告ID
 */
export function getAdStats(adId) {
  try {
    const analytics = getAnalytics()
    const adStats = analytics.adStats[adId] || {
      title: '',
      clicks: 0,
      exposures: 0,
      ctr: 0
    }
    
    // 获取该广告的最近事件
    const recentEvents = getEvents({
      adId,
      limit: 50
    })
    
    return {
      ...adStats,
      recentEvents
    }
  } catch (error) {
    console.error('获取广告统计失败:', error)
    return {
      title: '',
      clicks: 0,
      exposures: 0,
      ctr: 0,
      recentEvents: []
    }
  }
}

/**
 * 获取位置统计
 * @param {String} position - 广告位置
 */
export function getPositionStats(position) {
  try {
    const analytics = getAnalytics()
    return analytics.positionStats[position] || {
      clicks: 0,
      exposures: 0
    }
  } catch (error) {
    console.error('获取位置统计失败:', error)
    return {
      clicks: 0,
      exposures: 0
    }
  }
}

/**
 * 获取日期范围内的统计
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 */
export function getDateRangeStats(startDate, endDate) {
  try {
    const analytics = getAnalytics()
    const stats = {
      clicks: 0,
      exposures: 0,
      dates: []
    }
    
    const current = new Date(startDate)
    while (current <= endDate) {
      const dateStr = formatDate(current)
      const dayStats = analytics.dailyStats[dateStr] || {
        clicks: 0,
        exposures: 0
      }
      
      stats.clicks += dayStats.clicks
      stats.exposures += dayStats.exposures
      stats.dates.push({
        date: dateStr,
        ...dayStats
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return stats
  } catch (error) {
    console.error('获取日期范围统计失败:', error)
    return {
      clicks: 0,
      exposures: 0,
      dates: []
    }
  }
}

/**
 * 清空统计数据
 */
export function clearAnalytics() {
  try {
    uni.removeStorageSync(ANALYTICS_KEY)
    uni.removeStorageSync(ANALYTICS_EVENTS_KEY)
    return true
  } catch (error) {
    console.error('清空统计数据失败:', error)
    return false
  }
}

/**
 * 导出统计数据
 */
export function exportAnalytics() {
  try {
    const analytics = getAnalytics()
    const events = getEvents()
    
    return {
      summary: {
        totalClicks: analytics.totalClicks,
        totalExposures: analytics.totalExposures,
        overallCTR: analytics.totalExposures > 0 
          ? ((analytics.totalClicks / analytics.totalExposures) * 100).toFixed(2)
          : 0,
        exportTime: new Date().toISOString()
      },
      adStats: analytics.adStats,
      positionStats: analytics.positionStats,
      dailyStats: analytics.dailyStats,
      recentEvents: events.slice(0, 100) // 最近100条事件
    }
  } catch (error) {
    console.error('导出统计数据失败:', error)
    return null
  }
}

/**
 * 发送数据到服务器
 * @param {Object} event - 事件数据
 */
async function sendToServer(event) {
  try {
    // TODO: 实现发送到服务器的逻辑
    // await request.post('/api/analytics/track', event)
    console.log('发送事件到服务器:', event)
  } catch (error) {
    console.error('发送事件到服务器失败:', error)
  }
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 初始化统计系统
 */
export function initAnalytics() {
  try {
    // 检查是否有统计数据
    const analytics = uni.getStorageSync(ANALYTICS_KEY)
    if (!analytics) {
      // 初始化统计数据结构
      uni.setStorageSync(ANALYTICS_KEY, {
        totalClicks: 0,
        totalExposures: 0,
        adStats: {},
        positionStats: {},
        dailyStats: {}
      })
    }
    
    // 清理过期事件（保留最近30天的事件）
    cleanupOldEvents()
    
    console.log('广告统计系统初始化成功')
  } catch (error) {
    console.error('初始化统计系统失败:', error)
  }
}

/**
 * 清理过期事件
 */
function cleanupOldEvents() {
  try {
    const events = uni.getStorageSync(ANALYTICS_EVENTS_KEY) || []
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const filteredEvents = events.filter(event => {
      return new Date(event.timestamp) > thirtyDaysAgo
    })
    
    if (filteredEvents.length < events.length) {
      uni.setStorageSync(ANALYTICS_EVENTS_KEY, filteredEvents)
      console.log(`清理了 ${events.length - filteredEvents.length} 条过期事件`)
    }
  } catch (error) {
    console.error('清理过期事件失败:', error)
  }
}

// 导出所有函数
export default {
  trackAdEvent,
  getAnalytics,
  getEvents,
  getAdStats,
  getPositionStats,
  getDateRangeStats,
  clearAnalytics,
  exportAnalytics,
  initAnalytics
}