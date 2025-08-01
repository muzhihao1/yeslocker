import { shallowMount } from '@vue/test-utils'
import Advertisement from '@/components/molecules/Advertisement.vue'

describe('Advertisement.vue', () => {
  let wrapper
  
  const defaultAdData = {
    id: 'ad_001',
    type: 'banner',
    imageUrl: '/static/ads/banner1.jpg',
    targetUrl: 'https://example.com/promo',
    title: 'Special Offer',
    description: 'Get 20% off on all services',
    duration: 5000,
    priority: 1
  }
  
  beforeEach(() => {
    wrapper = shallowMount(Advertisement, {
      propsData: {
        adData: defaultAdData,
        position: 'home-top'
      }
    })
  })
  
  afterEach(() => {
    wrapper.destroy()
    jest.clearAllMocks()
  })
  
  describe('Props and initialization', () => {
    it('should render ad with correct data', () => {
      expect(wrapper.find('.ad-image').attributes('src')).toBe('/static/ads/banner1.jpg')
      expect(wrapper.find('.ad-container').classes()).toContain('type-banner')
      expect(wrapper.find('.ad-container').classes()).toContain('position-home-top')
    })
    
    it('should handle different ad types', async () => {
      const adTypes = ['banner', 'carousel', 'popup', 'inline', 'float']
      
      for (const type of adTypes) {
        await wrapper.setProps({
          adData: { ...defaultAdData, type }
        })
        expect(wrapper.find('.ad-container').classes()).toContain(`type-${type}`)
      }
    })
    
    it('should apply custom styles', async () => {
      await wrapper.setProps({
        customStyle: {
          width: '300px',
          height: '250px',
          borderRadius: '10px'
        }
      })
      
      const container = wrapper.find('.ad-container')
      expect(container.attributes('style')).toContain('width: 300px')
      expect(container.attributes('style')).toContain('height: 250px')
      expect(container.attributes('style')).toContain('border-radius: 10px')
    })
    
    it('should handle loading state', () => {
      expect(wrapper.find('.ad-loading').exists()).toBe(true)
      expect(wrapper.find('.ad-content').attributes('style')).toContain('display: none')
    })
  })
  
  describe('Banner ad type', () => {
    it('should display banner correctly', () => {
      expect(wrapper.find('.ad-banner').exists()).toBe(true)
      expect(wrapper.find('.ad-image').exists()).toBe(true)
    })
    
    it('should handle image load success', async () => {
      await wrapper.find('.ad-image').trigger('load')
      
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.find('.ad-loading').exists()).toBe(false)
      expect(wrapper.find('.ad-content').attributes('style')).not.toContain('display: none')
    })
    
    it('should handle image load error', async () => {
      await wrapper.find('.ad-image').trigger('error')
      
      expect(wrapper.vm.loadError).toBe(true)
      expect(wrapper.find('.ad-error').exists()).toBe(true)
      expect(wrapper.emitted()['load-error']).toBeTruthy()
    })
    
    it('should auto hide after duration', async () => {
      jest.useFakeTimers()
      
      await wrapper.setProps({
        adData: { ...defaultAdData, duration: 3000 },
        autoHide: true
      })
      
      jest.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isVisible).toBe(false)
      expect(wrapper.emitted().hide).toBeTruthy()
      
      jest.useRealTimers()
    })
  })
  
  describe('Carousel ad type', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        adData: {
          ...defaultAdData,
          type: 'carousel',
          items: [
            { imageUrl: '/ad1.jpg', targetUrl: '/promo1' },
            { imageUrl: '/ad2.jpg', targetUrl: '/promo2' },
            { imageUrl: '/ad3.jpg', targetUrl: '/promo3' }
          ]
        }
      })
    })
    
    it('should display carousel with multiple items', () => {
      expect(wrapper.find('.ad-carousel').exists()).toBe(true)
      expect(wrapper.findAll('.carousel-item')).toHaveLength(3)
    })
    
    it('should show indicators', () => {
      const indicators = wrapper.findAll('.carousel-indicator')
      expect(indicators).toHaveLength(3)
      expect(indicators.at(0).classes()).toContain('active')
    })
    
    it('should auto rotate carousel', async () => {
      jest.useFakeTimers()
      
      expect(wrapper.vm.currentCarouselIndex).toBe(0)
      
      jest.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.currentCarouselIndex).toBe(1)
      
      jest.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.currentCarouselIndex).toBe(2)
      
      jest.useRealTimers()
    })
    
    it('should handle manual navigation', async () => {
      await wrapper.find('.carousel-next').trigger('click')
      expect(wrapper.vm.currentCarouselIndex).toBe(1)
      
      await wrapper.find('.carousel-prev').trigger('click')
      expect(wrapper.vm.currentCarouselIndex).toBe(0)
    })
    
    it('should handle indicator click', async () => {
      await wrapper.findAll('.carousel-indicator').at(2).trigger('click')
      expect(wrapper.vm.currentCarouselIndex).toBe(2)
    })
  })
  
  describe('Popup ad type', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        adData: {
          ...defaultAdData,
          type: 'popup',
          showDelay: 1000
        }
      })
    })
    
    it('should show popup after delay', async () => {
      jest.useFakeTimers()
      
      expect(wrapper.find('.ad-popup').exists()).toBe(false)
      
      jest.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.ad-popup').exists()).toBe(true)
      expect(wrapper.find('.popup-overlay').exists()).toBe(true)
      
      jest.useRealTimers()
    })
    
    it('should close popup on close button click', async () => {
      wrapper.setData({ isVisible: true })
      
      await wrapper.find('.popup-close').trigger('click')
      
      expect(wrapper.vm.isVisible).toBe(false)
      expect(wrapper.emitted().close).toBeTruthy()
    })
    
    it('should close popup on overlay click if allowed', async () => {
      await wrapper.setProps({ closeOnOverlay: true })
      wrapper.setData({ isVisible: true })
      
      await wrapper.find('.popup-overlay').trigger('click')
      
      expect(wrapper.vm.isVisible).toBe(false)
    })
    
    it('should not close popup on overlay click if not allowed', async () => {
      await wrapper.setProps({ closeOnOverlay: false })
      wrapper.setData({ isVisible: true })
      
      await wrapper.find('.popup-overlay').trigger('click')
      
      expect(wrapper.vm.isVisible).toBe(true)
    })
  })
  
  describe('Float ad type', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        adData: {
          ...defaultAdData,
          type: 'float',
          position: { bottom: 20, right: 20 }
        }
      })
    })
    
    it('should display floating ad with position', () => {
      const floatAd = wrapper.find('.ad-float')
      expect(floatAd.exists()).toBe(true)
      expect(floatAd.attributes('style')).toContain('bottom: 20px')
      expect(floatAd.attributes('style')).toContain('right: 20px')
    })
    
    it('should be draggable', async () => {
      const floatAd = wrapper.find('.ad-float')
      
      await floatAd.trigger('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      await floatAd.trigger('touchmove', {
        touches: [{ clientX: 150, clientY: 120 }]
      })
      
      await floatAd.trigger('touchend')
      
      expect(wrapper.vm.floatPosition).toMatchObject({
        x: expect.any(Number),
        y: expect.any(Number)
      })
    })
    
    it('should minimize float ad', async () => {
      await wrapper.find('.float-minimize').trigger('click')
      
      expect(wrapper.vm.isMinimized).toBe(true)
      expect(wrapper.find('.ad-float').classes()).toContain('minimized')
    })
  })
  
  describe('Click handling and analytics', () => {
    it('should handle ad click', async () => {
      await wrapper.find('.ad-content').trigger('click')
      
      expect(wrapper.emitted()['ad-click']).toBeTruthy()
      expect(wrapper.emitted()['ad-click'][0][0]).toMatchObject({
        adId: 'ad_001',
        targetUrl: 'https://example.com/promo',
        position: 'home-top'
      })
    })
    
    it('should track ad exposure', async () => {
      await wrapper.find('.ad-image').trigger('load')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted()['ad-show']).toBeTruthy()
      expect(wrapper.emitted()['ad-show'][0][0]).toMatchObject({
        adId: 'ad_001',
        type: 'banner',
        position: 'home-top'
      })
    })
    
    it('should navigate to target URL', async () => {
      await wrapper.vm.handleAdClick()
      
      expect(uni.navigateTo).toHaveBeenCalledWith({
        url: '/pages/webview/index?url=' + encodeURIComponent('https://example.com/promo')
      })
    })
    
    it('should handle mini program navigation', async () => {
      await wrapper.setProps({
        adData: {
          ...defaultAdData,
          targetType: 'miniprogram',
          appId: 'wx1234567890',
          path: 'pages/promo/index'
        }
      })
      
      await wrapper.vm.handleAdClick()
      
      expect(uni.navigateToMiniProgram).toHaveBeenCalledWith({
        appId: 'wx1234567890',
        path: 'pages/promo/index'
      })
    })
    
    it('should handle internal navigation', async () => {
      await wrapper.setProps({
        adData: {
          ...defaultAdData,
          targetType: 'internal',
          targetUrl: '/pages/shop/index'
        }
      })
      
      await wrapper.vm.handleAdClick()
      
      expect(uni.navigateTo).toHaveBeenCalledWith({
        url: '/pages/shop/index'
      })
    })
  })
  
  describe('Lazy loading', () => {
    it('should lazy load images when enabled', async () => {
      await wrapper.setProps({
        lazyLoad: true,
        adData: { ...defaultAdData, imageUrl: null }
      })
      
      expect(wrapper.find('.ad-placeholder').exists()).toBe(true)
      
      // Simulate intersection observer
      await wrapper.vm.onIntersect(true)
      
      expect(wrapper.vm.shouldLoadImage).toBe(true)
    })
  })
  
  describe('Error handling', () => {
    it('should show error state on load failure', async () => {
      await wrapper.find('.ad-image').trigger('error')
      
      expect(wrapper.find('.ad-error').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toContain('加载失败')
    })
    
    it('should retry loading on error', async () => {
      await wrapper.find('.ad-image').trigger('error')
      await wrapper.find('.retry-button').trigger('click')
      
      expect(wrapper.vm.loadError).toBe(false)
      expect(wrapper.vm.isLoading).toBe(true)
    })
    
    it('should handle missing ad data', () => {
      wrapper = shallowMount(Advertisement, {
        propsData: {
          adData: null,
          position: 'home-top'
        }
      })
      
      expect(wrapper.find('.ad-container').exists()).toBe(false)
      expect(wrapper.find('.ad-empty').exists()).toBe(true)
    })
  })
  
  describe('Responsive behavior', () => {
    it('should adapt to different screen sizes', async () => {
      // Mock different screen widths
      uni.getSystemInfoSync.mockReturnValue({
        windowWidth: 320
      })
      
      await wrapper.vm.updateResponsiveSize()
      
      expect(wrapper.vm.responsiveClass).toBe('size-small')
      
      uni.getSystemInfoSync.mockReturnValue({
        windowWidth: 768
      })
      
      await wrapper.vm.updateResponsiveSize()
      
      expect(wrapper.vm.responsiveClass).toBe('size-large')
    })
  })
  
  describe('Animation and transitions', () => {
    it('should apply entrance animation', async () => {
      await wrapper.setProps({
        animation: 'fade-in'
      })
      
      expect(wrapper.find('.ad-container').classes()).toContain('animation-fade-in')
    })
    
    it('should handle swipe gestures for carousel', async () => {
      await wrapper.setProps({
        adData: {
          ...defaultAdData,
          type: 'carousel',
          items: [{ imageUrl: '/ad1.jpg' }, { imageUrl: '/ad2.jpg' }]
        }
      })
      
      const carousel = wrapper.find('.ad-carousel')
      
      await carousel.trigger('touchstart', {
        touches: [{ clientX: 200, clientY: 100 }]
      })
      
      await carousel.trigger('touchmove', {
        touches: [{ clientX: 50, clientY: 100 }]
      })
      
      await carousel.trigger('touchend')
      
      expect(wrapper.vm.currentCarouselIndex).toBe(1)
    })
  })
  
  describe('Lifecycle hooks', () => {
    it('should clean up timers on destroy', async () => {
      jest.useFakeTimers()
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      
      await wrapper.setProps({
        adData: {
          ...defaultAdData,
          type: 'carousel',
          items: [{}, {}, {}]
        }
      })
      
      wrapper.destroy()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
      expect(clearIntervalSpy).toHaveBeenCalled()
      
      jest.useRealTimers()
    })
  })
})