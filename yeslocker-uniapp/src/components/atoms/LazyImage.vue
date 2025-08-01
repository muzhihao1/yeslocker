<template>
  <view class="lazy-image-container" :style="containerStyle">
    <image
      v-if="shouldLoad || forceLoad"
      :class="['lazy-image', customClass, { 'lazy-image--loading': isLoading, 'lazy-image--error': hasError }]"
      :id="imageId"
      :src="currentSrc"
      :mode="mode"
      :lazy-load="false"
      :show-menu-by-longpress="showMenuByLongpress"
      @load="handleLoad"
      @error="handleError"
      @click="handleClick"
    />
    <image
      v-else
      :class="['lazy-image', 'lazy-image--placeholder', customClass]"
      :id="imageId"
      :src="placeholder"
      :mode="mode"
    />
    
    <!-- Loading indicator -->
    <view v-if="showLoading && isLoading && shouldLoad" class="lazy-image-loading">
      <view class="loading-spinner"></view>
    </view>
    
    <!-- Error state -->
    <view v-if="showError && hasError" class="lazy-image-error" @click="retry">
      <text class="error-icon">🔄</text>
      <text class="error-text">点击重试</text>
    </view>
  </view>
</template>

<script>
/**
 * LazyImage Component
 * 
 * A drop-in replacement for UniApp's image component with lazy loading support.
 * Automatically loads images when they enter the viewport.
 * 
 * @component
 * @example
 * <lazy-image
 *   src="/static/example.jpg"
 *   mode="aspectFill"
 *   :width="200"
 *   :height="200"
 * />
 */
export default {
  name: 'LazyImage',
  props: {
    // Image source URL
    src: {
      type: String,
      required: true
    },
    // Placeholder image while loading
    placeholder: {
      type: String,
      default: '/static/image-loading.svg'
    },
    // Error placeholder image
    errorImage: {
      type: String,
      default: '/static/image-error.svg'
    },
    // Image mode (same as uni image component)
    mode: {
      type: String,
      default: 'aspectFill'
    },
    // Custom class names
    customClass: {
      type: String,
      default: ''
    },
    // Width in rpx
    width: {
      type: [Number, String],
      default: '100%'
    },
    // Height in rpx
    height: {
      type: [Number, String],
      default: 'auto'
    },
    // Whether to show loading indicator
    showLoading: {
      type: Boolean,
      default: true
    },
    // Whether to show error state
    showError: {
      type: Boolean,
      default: true
    },
    // Force load immediately without lazy loading
    forceLoad: {
      type: Boolean,
      default: false
    },
    // Threshold for intersection observer (0-1)
    threshold: {
      type: Number,
      default: 0.1
    },
    // Root margin for intersection observer
    rootMargin: {
      type: String,
      default: '50px'
    },
    // Show menu by long press
    showMenuByLongpress: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageId: `lazy-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shouldLoad: false,
      isLoading: false,
      hasError: false,
      currentSrc: '',
      observer: null
    }
  },
  computed: {
    containerStyle() {
      const style = {}
      
      // Handle width
      if (typeof this.width === 'number') {
        style.width = `${this.width}rpx`
      } else if (this.width.includes('%') || this.width.includes('px') || this.width.includes('rpx')) {
        style.width = this.width
      } else {
        style.width = `${this.width}rpx`
      }
      
      // Handle height
      if (typeof this.height === 'number') {
        style.height = `${this.height}rpx`
      } else if (this.height === 'auto' || this.height.includes('%') || this.height.includes('px') || this.height.includes('rpx')) {
        style.height = this.height
      } else {
        style.height = `${this.height}rpx`
      }
      
      return style
    }
  },
  watch: {
    src(newSrc) {
      if (this.shouldLoad || this.forceLoad) {
        this.loadImage()
      }
    }
  },
  mounted() {
    if (this.forceLoad) {
      this.loadImage()
    } else {
      this.setupObserver()
    }
  },
  beforeDestroy() {
    this.cleanupObserver()
  },
  methods: {
    /**
     * Setup intersection observer
     */
    setupObserver() {
      // Use nextTick to ensure DOM is ready
      this.$nextTick(() => {
        // Create intersection observer for current platform
        if (typeof IntersectionObserver !== 'undefined') {
          // H5 platform
          this.setupH5Observer()
        } else {
          // Mini program platform
          this.setupMiniProgramObserver()
        }
      })
    },
    
    /**
     * Setup observer for H5 platform
     */
    setupH5Observer() {
      const options = {
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.shouldLoad) {
            this.shouldLoad = true
            this.loadImage()
            this.cleanupObserver()
          }
        })
      }, options)
      
      // Find the image element
      const element = document.getElementById(this.imageId)
      if (element) {
        this.observer.observe(element.parentElement || element)
      }
    },
    
    /**
     * Setup observer for mini program platform
     */
    setupMiniProgramObserver() {
      this.observer = uni.createIntersectionObserver(this, {
        thresholds: [this.threshold],
        observeAll: false
      })
      
      this.observer
        .relativeToViewport({ bottom: parseInt(this.rootMargin) })
        .observe(`#${this.imageId}`, (res) => {
          if (res.intersectionRatio > 0 && !this.shouldLoad) {
            this.shouldLoad = true
            this.loadImage()
            this.cleanupObserver()
          }
        })
    },
    
    /**
     * Clean up observer
     */
    cleanupObserver() {
      if (this.observer) {
        if (typeof this.observer.disconnect === 'function') {
          this.observer.disconnect()
        }
        this.observer = null
      }
    },
    
    /**
     * Load the image
     */
    loadImage() {
      this.isLoading = true
      this.hasError = false
      this.currentSrc = this.src
    },
    
    /**
     * Handle image load success
     */
    handleLoad(e) {
      this.isLoading = false
      this.hasError = false
      this.$emit('load', e)
    },
    
    /**
     * Handle image load error
     */
    handleError(e) {
      this.isLoading = false
      this.hasError = true
      this.currentSrc = this.errorImage
      this.$emit('error', e)
    },
    
    /**
     * Handle image click
     */
    handleClick(e) {
      this.$emit('click', e)
    },
    
    /**
     * Retry loading the image
     */
    retry() {
      this.loadImage()
    }
  }
}
</script>

<style lang="scss" scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background-color: #f8f8f8;
  
  .lazy-image {
    width: 100%;
    height: 100%;
    display: block;
    
    &--placeholder {
      opacity: 0.5;
    }
    
    &--loading {
      opacity: 0.8;
    }
    
    &--error {
      opacity: 0.5;
    }
  }
  
  .lazy-image-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    
    .loading-spinner {
      width: 40rpx;
      height: 40rpx;
      border: 3rpx solid #f0f0f0;
      border-top-color: #007aff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
  
  .lazy-image-error {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    
    .error-icon {
      font-size: 48rpx;
      margin-bottom: 16rpx;
    }
    
    .error-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>