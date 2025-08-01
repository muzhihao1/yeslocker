<template>
  <view class="advertisement" v-if="visible && (adData || (type === 'carousel' && adList && adList.length > 0))">
    <!-- Banner 横幅广告 -->
    <view v-if="type === 'banner'" class="ad-banner" @click="handleAdClick">
      <lazy-image 
        :src="adData.imageUrl" 
        mode="aspectFill"
        custom-class="ad-image"
        :force-load="false"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      <view v-if="showCloseBtn" class="ad-close" @click.stop="handleClose">
        <text class="close-icon">×</text>
      </view>
    </view>
    
    <!-- Carousel 轮播广告 -->
    <swiper 
      v-else-if="type === 'carousel' && adList.length > 0"
      class="ad-carousel"
      :autoplay="autoplay"
      :interval="interval"
      :duration="duration"
      :circular="circular"
      :indicator-dots="indicatorDots"
      :indicator-color="indicatorColor"
      :indicator-active-color="indicatorActiveColor"
      @change="handleCarouselChange"
    >
      <swiper-item 
        v-for="(item, index) in adList" 
        :key="item.id ? item.id : index"
        @click="handleAdClick(item)"
      >
        <view class="carousel-item">
          <lazy-image 
            :src="item.imageUrl" 
            mode="aspectFill"
            custom-class="ad-image"
            :force-load="false"
          />
          <view v-if="item.title" class="ad-title">
            <text class="title-text">{{ item.title }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>
    
    <!-- Popup 弹窗广告 -->
    <view v-else-if="type === 'popup'" class="ad-popup-mask" @click="handleMaskClick">
      <view class="ad-popup" @click.stop>
        <lazy-image 
          :src="adData.imageUrl" 
          mode="aspectFit"
          custom-class="popup-image"
          :force-load="true"
          @click="handleAdClick"
        />
        <view class="popup-close" @click="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>
    </view>
    
    <!-- Inline 内嵌广告 -->
    <view v-else-if="type === 'inline'" class="ad-inline" @click="handleAdClick">
      <view class="inline-content">
        <lazy-image 
          v-if="adData.iconUrl"
          :src="adData.iconUrl" 
          mode="aspectFill"
          custom-class="inline-icon"
          :width="60"
          :height="60"
        />
        <view class="inline-info">
          <text class="inline-title">{{ adData.title }}</text>
          <text class="inline-desc">{{ adData.description }}</text>
        </view>
        <view class="inline-action">
          <text class="action-text">{{ adData.actionText || '查看详情' }}</text>
          <text class="action-arrow">›</text>
        </view>
      </view>
    </view>
    
    <!-- Float 浮动广告 -->
    <view 
      v-else-if="type === 'float'" 
      class="ad-float"
      :style="floatStyle"
      @click="handleAdClick"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <lazy-image 
        :src="adData.imageUrl" 
        mode="aspectFill"
        custom-class="float-image"
        :force-load="true"
      />
      <view v-if="showCloseBtn" class="float-close" @click.stop="handleClose">
        <text class="close-icon">×</text>
      </view>
    </view>
  </view>
</template>

<script>
import { trackAdEvent } from '@/utils/analytics'

export default {
  name: 'Advertisement',
  props: {
    // 广告类型：banner|carousel|popup|inline|float
    type: {
      type: String,
      default: 'banner',
      validator: value => ['banner', 'carousel', 'popup', 'inline', 'float'].includes(value)
    },
    // 单个广告数据
    adData: {
      type: Object,
      default: null
    },
    // 轮播广告列表
    adList: {
      type: Array,
      default: () => []
    },
    // 是否显示关闭按钮
    showCloseBtn: {
      type: Boolean,
      default: true
    },
    // 是否自动播放（轮播）
    autoplay: {
      type: Boolean,
      default: true
    },
    // 轮播间隔时间（毫秒）
    interval: {
      type: Number,
      default: 5000
    },
    // 滑动动画时长（毫秒）
    duration: {
      type: Number,
      default: 500
    },
    // 是否循环播放
    circular: {
      type: Boolean,
      default: true
    },
    // 是否显示指示点
    indicatorDots: {
      type: Boolean,
      default: true
    },
    // 指示点颜色
    indicatorColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.5)'
    },
    // 当前选中的指示点颜色
    indicatorActiveColor: {
      type: String,
      default: '#ffffff'
    },
    // 浮动广告位置
    floatPosition: {
      type: Object,
      default: () => ({ right: 32, bottom: 120 })
    },
    // 广告位置标识（用于统计）
    position: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: true,
      currentIndex: 0,
      touchStartX: 0,
      touchStartY: 0,
      floatX: 0,
      floatY: 0,
      isDragging: false
    }
  },
  computed: {
    floatStyle() {
      if (this.type !== 'float') return {}
      
      const style = {
        right: `${this.floatPosition.right}rpx`,
        bottom: `${this.floatPosition.bottom}rpx`
      }
      
      if (this.isDragging) {
        style.transform = `translate(${this.floatX}px, ${this.floatY}px)`
        style.transition = 'none'
      }
      
      return style
    }
  },
  mounted() {
    this.reportAdExposure()
  },
  methods: {
    // 处理广告点击
    handleAdClick(adItem) {
      const ad = adItem && adItem.id ? adItem : this.adData
      
      if (!ad) return
      
      // 上报点击事件
      this.reportAdClick(ad)
      
      // 处理跳转
      if (ad.linkType === 'miniprogram') {
        // 跳转到其他小程序
        uni.navigateToMiniProgram({
          appId: ad.appId,
          path: ad.path || '',
          success: () => {
            console.log('跳转小程序成功')
          },
          fail: (err) => {
            console.error('跳转小程序失败:', err)
          }
        })
      } else if (ad.linkType === 'webview') {
        // 跳转到 H5 页面
        uni.navigateTo({
          url: `/pages/common/webview?url=${encodeURIComponent(ad.linkUrl)}`
        })
      } else if (ad.linkType === 'page') {
        // 跳转到内部页面
        uni.navigateTo({
          url: ad.linkUrl
        })
      } else if (ad.linkType === 'external') {
        // 复制链接
        uni.setClipboardData({
          data: ad.linkUrl,
          success: () => {
            uni.showToast({
              title: '链接已复制',
              icon: 'success'
            })
          }
        })
      }
      
      this.$emit('click', ad)
    },
    
    // 处理关闭
    handleClose() {
      const ad = this.adData || (this.adList && this.adList[this.currentIndex])
      if (ad) {
        // 上报关闭事件
        trackAdEvent('close', ad, this.position)
      }
      
      this.visible = false
      this.$emit('close')
    },
    
    // 处理遮罩点击（弹窗广告）
    handleMaskClick() {
      if (this.type === 'popup') {
        this.handleClose()
      }
    },
    
    // 处理轮播切换
    handleCarouselChange(e) {
      this.currentIndex = e.detail.current
      
      // 上报新广告曝光
      if (this.adList && this.adList[this.currentIndex]) {
        const currentAd = this.adList[this.currentIndex]
        trackAdEvent('exposure', currentAd, this.position)
        this.$emit('exposure', currentAd)
      }
      
      this.$emit('change', e.detail.current)
    },
    
    // 处理图片加载完成
    handleImageLoad() {
      this.$emit('load')
    },
    
    // 处理图片加载失败
    handleImageError() {
      console.error('广告图片加载失败')
      this.$emit('error')
    },
    
    // 浮动广告拖动相关
    handleTouchStart(e) {
      if (this.type !== 'float') return
      
      this.isDragging = true
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
    },
    
    handleTouchMove(e) {
      if (this.type !== 'float' || !this.isDragging) return
      
      const deltaX = e.touches[0].clientX - this.touchStartX
      const deltaY = e.touches[0].clientY - this.touchStartY
      
      this.floatX = deltaX
      this.floatY = deltaY
    },
    
    handleTouchEnd() {
      if (this.type !== 'float') return
      
      this.isDragging = false
      
      // 判断是点击还是拖动
      if (Math.abs(this.floatX) < 10 && Math.abs(this.floatY) < 10) {
        // 是点击
        this.floatX = 0
        this.floatY = 0
      } else {
        // 是拖动，更新位置
        // TODO: 保存新位置
      }
    },
    
    // 上报广告曝光
    reportAdExposure() {
      const ad = this.adData || (this.adList && this.adList[0])
      if (!ad) return
      
      // 调用统计API上报曝光
      const event = trackAdEvent('exposure', ad, this.position)
      
      console.log('广告曝光上报:', {
        adId: ad.id,
        position: this.position,
        type: this.type,
        timestamp: new Date().getTime()
      })
      
      this.$emit('exposure', ad)
    },
    
    // 上报广告点击
    reportAdClick(ad) {
      // 调用统计API上报点击
      const event = trackAdEvent('click', ad, this.position)
      
      console.log('广告点击上报:', {
        adId: ad.id,
        position: this.position,
        type: this.type,
        timestamp: new Date().getTime()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.advertisement {
  position: relative;
  
  // Banner 广告样式
  .ad-banner {
    position: relative;
    width: 100%;
    overflow: hidden;
    
    .ad-image {
      width: 100%;
      height: 200rpx;
      display: block;
    }
    
    .ad-close {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      width: 48rpx;
      height: 48rpx;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .close-icon {
        color: #ffffff;
        font-size: 32rpx;
        line-height: 1;
      }
    }
  }
  
  // Carousel 轮播广告样式
  .ad-carousel {
    width: 100%;
    height: 280rpx;
    
    .carousel-item {
      position: relative;
      width: 100%;
      height: 100%;
      
      .ad-image {
        width: 100%;
        height: 100%;
        border-radius: 16rpx;
      }
      
      .ad-title {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 24rpx 32rpx;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        
        .title-text {
          color: #ffffff;
          font-size: 32rpx;
          font-weight: 500;
        }
      }
    }
  }
  
  // Popup 弹窗广告样式
  .ad-popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    
    .ad-popup {
      position: relative;
      width: 600rpx;
      max-height: 80vh;
      
      .popup-image {
        width: 100%;
        border-radius: 16rpx;
      }
      
      .popup-close {
        position: absolute;
        top: -60rpx;
        right: 0;
        width: 60rpx;
        height: 60rpx;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .close-icon {
          color: #333333;
          font-size: 40rpx;
          line-height: 1;
        }
      }
    }
  }
  
  // Inline 内嵌广告样式
  .ad-inline {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin: 24rpx 0;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .inline-content {
      display: flex;
      align-items: center;
      
      .inline-icon {
        width: 100rpx;
        height: 100rpx;
        border-radius: 12rpx;
        margin-right: 24rpx;
        flex-shrink: 0;
      }
      
      .inline-info {
        flex: 1;
        
        .inline-title {
          display: block;
          font-size: 32rpx;
          color: #333333;
          font-weight: 500;
          margin-bottom: 8rpx;
        }
        
        .inline-desc {
          display: block;
          font-size: 26rpx;
          color: #666666;
          line-height: 1.4;
        }
      }
      
      .inline-action {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        
        .action-text {
          font-size: 28rpx;
          color: #1890ff;
          margin-right: 8rpx;
        }
        
        .action-arrow {
          font-size: 32rpx;
          color: #999999;
        }
      }
    }
  }
  
  // Float 浮动广告样式
  .ad-float {
    position: fixed;
    width: 120rpx;
    height: 120rpx;
    z-index: 998;
    transition: transform 0.3s;
    
    .float-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
    }
    
    .float-close {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      width: 36rpx;
      height: 36rpx;
      background-color: #ff4d4f;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .close-icon {
        color: #ffffff;
        font-size: 24rpx;
        line-height: 1;
      }
    }
  }
}
</style>