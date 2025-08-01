# Advertisement 广告组件

## 组件介绍

Advertisement 是一个多功能的广告展示分子组件，支持多种广告形式（轮播、弹窗、悬浮、内嵌等），并集成了点击统计、曝光追踪等商业化功能。该组件可以灵活配置，满足不同场景的广告投放需求。

## 基础用法

```vue
<template>
  <advertisement 
    :ad-data="adConfig"
    position="home-top"
    @ad-click="handleAdClick"
    @ad-show="handleAdShow"
  />
</template>

<script>
import Advertisement from '@/components/molecules/Advertisement.vue'

export default {
  components: {
    Advertisement
  },
  data() {
    return {
      adConfig: {
        id: 'ad_001',
        type: 'banner',
        imageUrl: '/static/ads/banner1.jpg',
        linkUrl: '/pages/activity/detail?id=1',
        title: '新用户专享优惠'
      }
    }
  },
  methods: {
    handleAdClick(adInfo) {
      console.log('广告被点击:', adInfo)
    },
    handleAdShow(adInfo) {
      console.log('广告曝光:', adInfo)
    }
  }
}
</script>
```

## API 文档

### Props

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| adData | Object/Array | {} | 是 | 广告数据（单个或多个） |
| type | String | banner | 否 | 广告类型：banner/carousel/popup/inline/float |
| position | String | - | 否 | 广告位置标识 |
| autoPlay | Boolean | true | 否 | 是否自动播放（轮播类） |
| interval | Number | 3000 | 否 | 轮播间隔（毫秒） |
| showClose | Boolean | true | 否 | 是否显示关闭按钮 |
| trackExposure | Boolean | true | 否 | 是否追踪曝光 |
| trackClick | Boolean | true | 否 | 是否追踪点击 |
| priority | Number | 0 | 否 | 显示优先级 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| ad-click | adInfo | 广告点击时触发 |
| ad-show | adInfo | 广告展示时触发 |
| ad-close | adInfo | 广告关闭时触发 |
| ad-error | error | 加载失败时触发 |
| slide-change | index | 轮播切换时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义广告内容 |
| close-btn | 自定义关闭按钮 |
| indicator | 自定义轮播指示器 |

### Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| show | - | 显示广告 |
| hide | - | 隐藏广告 |
| reload | - | 重新加载广告 |
| next | - | 下一个广告（轮播） |
| prev | - | 上一个广告（轮播） |

## 广告类型

### 1. Banner 广告
```vue
<advertisement 
  type="banner"
  :ad-data="{
    id: 'banner_001',
    imageUrl: '/static/ads/banner.jpg',
    linkUrl: '/pages/activity/detail',
    width: 750,
    height: 300
  }"
  position="home-banner"
/>
```

### 2. 轮播广告 (Carousel)
```vue
<advertisement 
  type="carousel"
  :ad-data="carouselAds"
  :auto-play="true"
  :interval="5000"
  @slide-change="onSlideChange"
>
  <template #indicator="{ current, total }">
    <view class="custom-indicator">
      <text>{{ current + 1 }} / {{ total }}</text>
    </view>
  </template>
</advertisement>

<script>
export default {
  data() {
    return {
      carouselAds: [
        {
          id: 'carousel_001',
          imageUrl: '/static/ads/slide1.jpg',
          linkUrl: '/pages/product/detail?id=1',
          title: '限时特惠'
        },
        {
          id: 'carousel_002',
          imageUrl: '/static/ads/slide2.jpg',
          linkUrl: '/pages/activity/new-user',
          title: '新人礼包'
        },
        {
          id: 'carousel_003',
          imageUrl: '/static/ads/slide3.jpg',
          linkType: 'miniProgram',
          appId: 'wx1234567890',
          path: 'pages/index/index',
          title: '合作推广'
        }
      ]
    }
  },
  methods: {
    onSlideChange(index) {
      console.log('切换到第', index + 1, '个广告')
    }
  }
}
</script>
```

### 3. 弹窗广告 (Popup)
```vue
<advertisement 
  type="popup"
  :ad-data="popupAd"
  :show-close="true"
  position="home-popup"
  @ad-close="handlePopupClose"
>
  <template #default="{ ad }">
    <view class="popup-content">
      <image :src="ad.imageUrl" mode="widthFix" />
      <view class="popup-info">
        <text class="title">{{ ad.title }}</text>
        <text class="desc">{{ ad.description }}</text>
        <button class="action-btn" @click="handleAction(ad)">
          {{ ad.buttonText || '立即查看' }}
        </button>
      </view>
    </view>
  </template>
</advertisement>

<script>
export default {
  data() {
    return {
      popupAd: {
        id: 'popup_001',
        imageUrl: '/static/ads/popup.jpg',
        title: '会员日特惠',
        description: '全场8折起，仅限今日',
        buttonText: '立即抢购',
        linkUrl: '/pages/activity/member-day',
        showFrequency: 'once_per_day' // 每天只显示一次
      }
    }
  },
  methods: {
    handlePopupClose(ad) {
      // 记录关闭时间，用于频率控制
      uni.setStorageSync(`ad_closed_${ad.id}`, Date.now())
    },
    handleAction(ad) {
      // 处理按钮点击
      this.navigateToAd(ad)
    }
  }
}
</script>
```

### 4. 内嵌广告 (Inline)
```vue
<view class="content-list">
  <view v-for="(item, index) in contentList" :key="item.id">
    <!-- 普通内容 -->
    <view class="content-item" v-if="item.type === 'content'">
      {{ item.content }}
    </view>
    
    <!-- 内嵌广告 -->
    <advertisement 
      v-else-if="item.type === 'ad'"
      type="inline"
      :ad-data="item.adData"
      :position="`list-inline-${index}`"
      class="inline-ad"
    />
  </view>
</view>

<script>
export default {
  data() {
    return {
      contentList: [
        { id: 1, type: 'content', content: '内容1' },
        { id: 2, type: 'content', content: '内容2' },
        { 
          id: 'ad1', 
          type: 'ad', 
          adData: {
            id: 'inline_001',
            imageUrl: '/static/ads/inline.jpg',
            title: '推荐商品',
            linkUrl: '/pages/product/recommend'
          }
        },
        { id: 3, type: 'content', content: '内容3' }
      ]
    }
  }
}
</script>
```

### 5. 悬浮广告 (Float)
```vue
<advertisement 
  type="float"
  :ad-data="floatAd"
  position="global-float"
  :draggable="true"
  @ad-click="handleFloatClick"
>
  <template #default="{ ad }">
    <view class="float-ad-content">
      <image :src="ad.icon" class="float-icon" />
      <text class="float-text">{{ ad.text }}</text>
    </view>
  </template>
</advertisement>

<script>
export default {
  data() {
    return {
      floatAd: {
        id: 'float_001',
        icon: '/static/ads/float-icon.png',
        text: '客服',
        linkType: 'service', // 客服类型
        position: { right: 20, bottom: 100 }, // 初始位置
        animation: 'pulse' // 动画效果
      }
    }
  },
  methods: {
    handleFloatClick(ad) {
      if (ad.linkType === 'service') {
        this.openCustomerService()
      }
    }
  }
}
</script>
```

## 高级用法

### 广告管理与调度

```vue
<template>
  <view class="ad-container">
    <advertisement 
      ref="adManager"
      :ad-data="currentAds"
      :type="currentAdType"
      :position="adPosition"
      :priority="adPriority"
      @ad-show="trackAdExposure"
      @ad-click="trackAdClick"
      @ad-error="handleAdError"
    />
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentAds: [],
      currentAdType: 'banner',
      adPosition: '',
      adPriority: 0,
      adSchedule: [] // 广告排期
    }
  },
  async onLoad(options) {
    this.adPosition = options.position || 'default'
    await this.loadAdSchedule()
    this.updateCurrentAd()
  },
  methods: {
    async loadAdSchedule() {
      try {
        // 从服务器加载广告排期
        const res = await this.$api.ad.getSchedule({
          position: this.adPosition,
          userId: this.userInfo?.id,
          time: new Date().toISOString()
        })
        
        this.adSchedule = res.data
        
        // 根据优先级排序
        this.adSchedule.sort((a, b) => b.priority - a.priority)
        
      } catch (error) {
        console.error('加载广告失败:', error)
      }
    },
    
    updateCurrentAd() {
      const now = Date.now()
      
      // 找到当前时间应该显示的广告
      const validAds = this.adSchedule.filter(ad => {
        // 检查时间范围
        if (ad.startTime && new Date(ad.startTime).getTime() > now) return false
        if (ad.endTime && new Date(ad.endTime).getTime() < now) return false
        
        // 检查展示条件
        if (ad.conditions) {
          return this.checkAdConditions(ad.conditions)
        }
        
        return true
      })
      
      if (validAds.length > 0) {
        // 选择优先级最高的广告
        const selectedAd = validAds[0]
        this.currentAds = selectedAd.items || [selectedAd]
        this.currentAdType = selectedAd.type
        this.adPriority = selectedAd.priority
      }
    },
    
    checkAdConditions(conditions) {
      // 检查用户定向条件
      if (conditions.userType && this.userInfo?.type !== conditions.userType) {
        return false
      }
      
      // 检查会员等级
      if (conditions.vipLevel && this.userInfo?.vipLevel < conditions.vipLevel) {
        return false
      }
      
      // 检查地理位置
      if (conditions.location) {
        // 检查用户位置是否在指定范围内
        return this.checkLocationCondition(conditions.location)
      }
      
      // 检查设备类型
      if (conditions.platform && uni.getSystemInfoSync().platform !== conditions.platform) {
        return false
      }
      
      return true
    },
    
    async trackAdExposure(adInfo) {
      // 曝光统计
      try {
        await this.$api.ad.trackExposure({
          adId: adInfo.id,
          position: this.adPosition,
          userId: this.userInfo?.id,
          timestamp: Date.now(),
          duration: 0 // 曝光时长，后续可以计算
        })
        
        // 本地统计
        this.$analytics.track('ad_exposure', {
          ad_id: adInfo.id,
          ad_type: this.currentAdType,
          position: this.adPosition
        })
        
      } catch (error) {
        console.error('曝光统计失败:', error)
      }
    },
    
    async trackAdClick(adInfo) {
      // 点击统计
      try {
        await this.$api.ad.trackClick({
          adId: adInfo.id,
          position: this.adPosition,
          userId: this.userInfo?.id,
          timestamp: Date.now()
        })
        
        // 本地统计
        this.$analytics.track('ad_click', {
          ad_id: adInfo.id,
          ad_type: this.currentAdType,
          position: this.adPosition,
          link_url: adInfo.linkUrl
        })
        
        // 处理跳转
        this.handleAdNavigation(adInfo)
        
      } catch (error) {
        console.error('点击统计失败:', error)
      }
    },
    
    handleAdNavigation(adInfo) {
      switch (adInfo.linkType) {
        case 'internal':
          // 内部页面跳转
          uni.navigateTo({
            url: adInfo.linkUrl
          })
          break
          
        case 'miniProgram':
          // 跳转其他小程序
          uni.navigateToMiniProgram({
            appId: adInfo.appId,
            path: adInfo.path,
            extraData: adInfo.extraData
          })
          break
          
        case 'webview':
          // 打开网页
          uni.navigateTo({
            url: `/pages/common/webview?url=${encodeURIComponent(adInfo.linkUrl)}`
          })
          break
          
        case 'service':
          // 客服
          this.openCustomerService()
          break
          
        default:
          console.warn('未知的链接类型:', adInfo.linkType)
      }
    },
    
    handleAdError(error) {
      console.error('广告加载错误:', error)
      
      // 上报错误
      this.$api.ad.reportError({
        adId: error.adId,
        errorType: error.type,
        errorMessage: error.message,
        position: this.adPosition
      })
      
      // 尝试加载备用广告
      this.loadFallbackAd()
    },
    
    loadFallbackAd() {
      // 加载备用广告
      const fallbackAd = {
        id: 'fallback_001',
        type: 'banner',
        imageUrl: '/static/ads/default.jpg',
        linkUrl: '/pages/home/index'
      }
      
      this.currentAds = [fallbackAd]
      this.currentAdType = 'banner'
    }
  }
}
</script>
```

### 个性化推荐广告

```vue
<template>
  <view class="personalized-ads">
    <advertisement 
      v-for="ad in personalizedAds" 
      :key="ad.id"
      :ad-data="ad"
      :type="ad.displayType"
      :position="`personalized-${ad.id}`"
      class="personalized-ad-item"
    />
  </view>
</template>

<script>
export default {
  data() {
    return {
      personalizedAds: [],
      userProfile: null
    }
  },
  async mounted() {
    await this.loadUserProfile()
    await this.loadPersonalizedAds()
  },
  methods: {
    async loadUserProfile() {
      // 加载用户画像
      try {
        const res = await this.$api.user.getProfile()
        this.userProfile = res.data
      } catch (error) {
        console.error('加载用户画像失败:', error)
      }
    },
    
    async loadPersonalizedAds() {
      try {
        // 根据用户画像获取个性化广告
        const res = await this.$api.ad.getPersonalized({
          userId: this.userInfo.id,
          interests: this.userProfile?.interests || [],
          behaviors: this.userProfile?.behaviors || [],
          location: await this.getCurrentLocation(),
          deviceInfo: this.getDeviceInfo()
        })
        
        this.personalizedAds = res.data.map(ad => ({
          ...ad,
          displayType: this.determineDisplayType(ad)
        }))
        
      } catch (error) {
        console.error('加载个性化广告失败:', error)
      }
    },
    
    determineDisplayType(ad) {
      // 根据广告内容决定展示类型
      if (ad.mediaType === 'video') {
        return 'video'
      } else if (ad.aspectRatio > 2) {
        return 'banner'
      } else if (ad.isInteractive) {
        return 'interactive'
      } else {
        return 'card'
      }
    },
    
    async getCurrentLocation() {
      try {
        const res = await uni.getLocation({
          type: 'gcj02'
        })
        return {
          latitude: res.latitude,
          longitude: res.longitude
        }
      } catch (error) {
        return null
      }
    },
    
    getDeviceInfo() {
      const systemInfo = uni.getSystemInfoSync()
      return {
        platform: systemInfo.platform,
        model: systemInfo.model,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight
      }
    }
  }
}
</script>
```

### 广告效果分析

```vue
<template>
  <view class="ad-analytics">
    <advertisement 
      ref="trackedAd"
      :ad-data="adData"
      :track-exposure="true"
      :track-click="true"
      @ad-show="onAdShow"
      @ad-click="onAdClick"
      @ad-close="onAdClose"
    />
    
    <!-- 实时统计显示 -->
    <view class="analytics-panel" v-if="showAnalytics">
      <text>曝光次数：{{ analytics.exposureCount }}</text>
      <text>点击次数：{{ analytics.clickCount }}</text>
      <text>点击率：{{ analytics.ctr }}%</text>
      <text>平均停留：{{ analytics.avgDuration }}s</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      adData: {},
      showAnalytics: false,
      analytics: {
        exposureCount: 0,
        clickCount: 0,
        ctr: 0,
        avgDuration: 0
      },
      exposureTimer: null,
      exposureStartTime: null
    }
  },
  methods: {
    onAdShow(adInfo) {
      // 记录曝光开始时间
      this.exposureStartTime = Date.now()
      this.analytics.exposureCount++
      
      // 开始计算停留时间
      this.startExposureTimer()
      
      // 上报曝光事件
      this.reportEvent('exposure', {
        adId: adInfo.id,
        timestamp: this.exposureStartTime
      })
    },
    
    onAdClick(adInfo) {
      this.analytics.clickCount++
      this.updateCTR()
      
      // 计算点击时的停留时间
      const clickDuration = Date.now() - this.exposureStartTime
      
      // 上报点击事件
      this.reportEvent('click', {
        adId: adInfo.id,
        timestamp: Date.now(),
        exposureDuration: clickDuration
      })
    },
    
    onAdClose(adInfo) {
      // 停止计时
      this.stopExposureTimer()
      
      // 计算本次曝光时长
      const duration = Date.now() - this.exposureStartTime
      
      // 更新平均停留时间
      this.updateAvgDuration(duration)
      
      // 上报关闭事件
      this.reportEvent('close', {
        adId: adInfo.id,
        timestamp: Date.now(),
        totalDuration: duration
      })
    },
    
    startExposureTimer() {
      // 每秒更新一次停留时间
      this.exposureTimer = setInterval(() => {
        const currentDuration = (Date.now() - this.exposureStartTime) / 1000
        // 实时更新显示
        if (this.showAnalytics) {
          this.$forceUpdate()
        }
      }, 1000)
    },
    
    stopExposureTimer() {
      if (this.exposureTimer) {
        clearInterval(this.exposureTimer)
        this.exposureTimer = null
      }
    },
    
    updateCTR() {
      if (this.analytics.exposureCount > 0) {
        this.analytics.ctr = (
          (this.analytics.clickCount / this.analytics.exposureCount) * 100
        ).toFixed(2)
      }
    },
    
    updateAvgDuration(newDuration) {
      const totalDuration = this.analytics.avgDuration * (this.analytics.exposureCount - 1) + newDuration / 1000
      this.analytics.avgDuration = (totalDuration / this.analytics.exposureCount).toFixed(1)
    },
    
    async reportEvent(eventType, data) {
      try {
        await this.$api.analytics.report({
          eventType: `ad_${eventType}`,
          eventData: data,
          sessionId: this.getSessionId(),
          userId: this.userInfo?.id
        })
      } catch (error) {
        console.error('事件上报失败:', error)
      }
    },
    
    getSessionId() {
      // 获取或生成会话ID
      let sessionId = uni.getStorageSync('session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        uni.setStorageSync('session_id', sessionId)
      }
      return sessionId
    }
  },
  beforeDestroy() {
    // 清理定时器
    this.stopExposureTimer()
  }
}
</script>
```

## 样式定制

### CSS 变量

```css
.advertisement {
  --ad-bg-color: #ffffff;
  --ad-border-radius: 16rpx;
  --ad-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  --ad-close-size: 48rpx;
  --ad-close-color: #999999;
  --ad-indicator-color: rgba(255, 255, 255, 0.5);
  --ad-indicator-active: #ffffff;
  --ad-animation-duration: 0.3s;
}
```

### 自定义样式示例

```vue
<style lang="scss" scoped>
// Banner 广告样式
.banner-ad {
  width: 100%;
  overflow: hidden;
  
  :deep(.ad-image) {
    width: 100%;
    height: auto;
  }
}

// 轮播广告样式
.carousel-ad {
  height: 400rpx;
  position: relative;
  
  :deep(.swiper) {
    height: 100%;
  }
  
  :deep(.indicator) {
    position: absolute;
    bottom: 20rpx;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12rpx;
    
    .dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background-color: var(--ad-indicator-color);
      transition: all 0.3s;
      
      &.active {
        width: 32rpx;
        border-radius: 8rpx;
        background-color: var(--ad-indicator-active);
      }
    }
  }
}

// 弹窗广告样式
.popup-ad {
  :deep(.popup-mask) {
    background-color: rgba(0, 0, 0, 0.6);
  }
  
  :deep(.popup-content) {
    background-color: transparent;
    padding: 32rpx;
    
    .close-btn {
      position: absolute;
      top: -80rpx;
      right: 0;
      width: 60rpx;
      height: 60rpx;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &::before,
      &::after {
        content: '';
        position: absolute;
        width: 30rpx;
        height: 2rpx;
        background-color: #ffffff;
      }
      
      &::before {
        transform: rotate(45deg);
      }
      
      &::after {
        transform: rotate(-45deg);
      }
    }
  }
}

// 悬浮广告样式
.float-ad {
  :deep(.float-container) {
    position: fixed;
    z-index: 999;
    
    &.draggable {
      touch-action: none;
    }
    
    .float-content {
      display: flex;
      align-items: center;
      padding: 16rpx 24rpx;
      background-color: #ffffff;
      border-radius: 40rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
      
      .float-icon {
        width: 48rpx;
        height: 48rpx;
        margin-right: 8rpx;
      }
      
      .float-text {
        font-size: 28rpx;
        color: #333333;
      }
    }
    
    // 脉冲动画
    &.pulse {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }
  }
}

// 内嵌广告样式
.inline-ad {
  margin: 24rpx 0;
  
  :deep(.inline-content) {
    background-color: #f8f8f8;
    border-radius: 12rpx;
    overflow: hidden;
    
    .ad-tag {
      position: absolute;
      top: 16rpx;
      left: 16rpx;
      padding: 4rpx 12rpx;
      background-color: rgba(0, 0, 0, 0.5);
      color: #ffffff;
      font-size: 20rpx;
      border-radius: 4rpx;
    }
  }
}
</style>
```

## 注意事项

1. **性能优化**：大图片广告需要懒加载，避免影响页面性能
2. **用户体验**：广告不应过度干扰用户操作，提供明显的关闭按钮
3. **频率控制**：避免同一广告过度展示，实现合理的频次控制
4. **隐私合规**：广告追踪需要遵守隐私政策，获得用户同意
5. **容错处理**：广告加载失败时显示占位图或隐藏广告位
6. **统计准确性**：确保曝光和点击统计的准确性，避免重复计算

## 更新日志

- 2025-07-23：创建组件文档
- 2025-07-23：添加5种广告类型支持
- 2025-07-23：集成统计分析功能
- 2025-07-23：添加个性化推荐支持