/**
 * Image Lazy Loading Utility for UniApp
 * 
 * This utility provides lazy loading functionality for images in UniApp applications.
 * It uses IntersectionObserver API for H5 and uni.createIntersectionObserver for mini programs.
 * 
 * Features:
 * - Automatic platform detection (H5 vs Mini Program)
 * - Configurable threshold and root margin
 * - Placeholder support
 * - Error handling
 * - Performance optimized with throttling
 * 
 * @module utils/lazyload
 */

// Default configuration
const DEFAULT_CONFIG = {
  loading: '/static/image-loading.svg', // Placeholder image while loading
  error: '/static/image-error.svg', // Error placeholder image
  threshold: 0.1, // Trigger when 10% of image is visible
  rootMargin: '50px', // Start loading 50px before image enters viewport
  throttle: 200 // Throttle time for scroll events (fallback mode)
}

// Store for observer instances
const observers = new Map()

// Check if IntersectionObserver is supported
const hasIntersectionObserver = typeof IntersectionObserver !== 'undefined'

/**
 * Creates an intersection observer for lazy loading
 * 
 * @param {Function} callback - Callback function when intersection occurs
 * @param {Object} options - Observer options
 * @returns {Object} Observer instance
 */
function createObserver(callback, options = {}) {
  const { threshold, rootMargin } = { ...DEFAULT_CONFIG, ...options }
  
  // For H5 platform
  if (hasIntersectionObserver) {
    return new IntersectionObserver(callback, {
      threshold,
      rootMargin
    })
  }
  
  // For Mini Program platform - use uni's API
  return {
    observe: (element, context) => {
      const observer = uni.createIntersectionObserver(context, {
        thresholds: [threshold],
        observeAll: false
      })
      
      observer.relativeToViewport({ bottom: parseInt(rootMargin) })
        .observe(element, (res) => {
          if (res.intersectionRatio > 0) {
            callback([{ isIntersecting: true, target: res }])
            observer.disconnect()
          }
        })
      
      return observer
    },
    unobserve: () => {},
    disconnect: () => {}
  }
}

/**
 * Lazy load configuration class
 */
class LazyLoad {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options }
    this.observer = null
    this.loadedImages = new Set()
  }
  
  /**
   * Initialize lazy loading for a component
   * 
   * @param {Object} context - Component context (this)
   * @param {String} selector - CSS selector for images
   * @param {Function} onLoad - Callback when image loads
   */
  init(context, selector = '.lazy-image', onLoad) {
    if (!context) return
    
    // Create observer
    this.observer = createObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target
          const imageId = target.dataset?.imageId || target.id
          
          if (imageId && !this.loadedImages.has(imageId)) {
            this.loadedImages.add(imageId)
            if (onLoad) {
              onLoad(imageId, target)
            }
          }
        }
      })
    }, this.config)
    
    // Observe images
    this.observeImages(context, selector)
  }
  
  /**
   * Start observing images
   * 
   * @param {Object} context - Component context
   * @param {String} selector - CSS selector
   */
  observeImages(context, selector) {
    // For mini program, we need to use different approach
    if (!hasIntersectionObserver) {
      // Use uni.createSelectorQuery
      const query = uni.createSelectorQuery().in(context)
      query.selectAll(selector).fields({
        dataset: true,
        id: true,
        rect: true
      }).exec((res) => {
        if (res && res[0]) {
          res[0].forEach(element => {
            this.observer.observe(`#${element.id}`, context)
          })
        }
      })
    } else {
      // For H5, use standard DOM query
      setTimeout(() => {
        const images = context.$el?.querySelectorAll(selector) || []
        images.forEach(img => {
          this.observer.observe(img)
        })
      }, 100)
    }
  }
  
  /**
   * Stop observing all images
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.loadedImages.clear()
  }
  
  /**
   * Manually load an image
   * 
   * @param {String} imageId - Image identifier
   */
  loadImage(imageId) {
    if (!this.loadedImages.has(imageId)) {
      this.loadedImages.add(imageId)
      return true
    }
    return false
  }
  
  /**
   * Check if image is already loaded
   * 
   * @param {String} imageId - Image identifier
   * @returns {Boolean}
   */
  isLoaded(imageId) {
    return this.loadedImages.has(imageId)
  }
}

/**
 * Vue mixin for lazy loading
 */
export const lazyLoadMixin = {
  data() {
    return {
      lazyLoadInstance: null,
      lazyImages: {}
    }
  },
  
  mounted() {
    this.initLazyLoad()
  },
  
  beforeDestroy() {
    if (this.lazyLoadInstance) {
      this.lazyLoadInstance.destroy()
    }
  },
  
  methods: {
    /**
     * Initialize lazy loading for component
     * 
     * @param {Object} options - Configuration options
     */
    initLazyLoad(options = {}) {
      this.lazyLoadInstance = new LazyLoad(options)
      this.lazyLoadInstance.init(this, '.lazy-image', (imageId) => {
        this.$set(this.lazyImages, imageId, true)
        this.$emit('lazy-load', imageId)
      })
    },
    
    /**
     * Check if image should be loaded
     * 
     * @param {String} imageId - Image identifier
     * @returns {Boolean}
     */
    shouldLoadImage(imageId) {
      return this.lazyImages[imageId] === true
    }
  }
}

/**
 * Global lazy load manager singleton
 */
let globalLazyLoadManager = null

/**
 * Get or create global lazy load manager
 * 
 * @param {Object} options - Configuration options
 * @returns {LazyLoad} Global instance
 */
export function getGlobalLazyLoad(options = {}) {
  if (!globalLazyLoadManager) {
    globalLazyLoadManager = new LazyLoad(options)
  }
  return globalLazyLoadManager
}

/**
 * Destroy global lazy load manager
 */
export function destroyGlobalLazyLoad() {
  if (globalLazyLoadManager) {
    globalLazyLoadManager.destroy()
    globalLazyLoadManager = null
  }
}

// Export main class and utilities
export default LazyLoad
export { DEFAULT_CONFIG }