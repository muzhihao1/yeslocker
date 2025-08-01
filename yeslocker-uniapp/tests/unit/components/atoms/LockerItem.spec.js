import { shallowMount } from '@vue/test-utils'
import LockerItem from '@/components/atoms/LockerItem.vue'

describe('LockerItem.vue', () => {
  let wrapper
  
  const defaultLocker = {
    id: 'A01',
    number: 'A01',
    status: 'available',
    size: 'medium',
    location: 'Zone A'
  }
  
  beforeEach(() => {
    wrapper = shallowMount(LockerItem, {
      propsData: {
        locker: defaultLocker
      }
    })
  })
  
  afterEach(() => {
    wrapper.destroy()
  })
  
  describe('Props', () => {
    it('should render locker data correctly', () => {
      expect(wrapper.find('.locker-number').text()).toBe('A01')
      expect(wrapper.find('.locker-status').text()).toBe('空闲')
      expect(wrapper.find('.locker-size').text()).toBe('中型')
    })
    
    it('should display different status labels', async () => {
      const statusMap = {
        available: '空闲',
        occupied: '已占用',
        maintenance: '维护中',
        reserved: '已预约'
      }
      
      for (const [status, label] of Object.entries(statusMap)) {
        await wrapper.setProps({
          locker: { ...defaultLocker, status }
        })
        expect(wrapper.find('.locker-status').text()).toBe(label)
      }
    })
    
    it('should apply status classes', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'available' }
      })
      expect(wrapper.find('.locker-item').classes()).toContain('status-available')
      
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'occupied' }
      })
      expect(wrapper.find('.locker-item').classes()).toContain('status-occupied')
    })
    
    it('should display different size labels', async () => {
      const sizeMap = {
        small: '小型',
        medium: '中型',
        large: '大型',
        xlarge: '超大型'
      }
      
      for (const [size, label] of Object.entries(sizeMap)) {
        await wrapper.setProps({
          locker: { ...defaultLocker, size }
        })
        expect(wrapper.find('.locker-size').text()).toBe(label)
      }
    })
    
    it('should show location if provided', () => {
      expect(wrapper.find('.locker-location').text()).toBe('Zone A')
    })
    
    it('should hide location if not provided', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, location: null }
      })
      expect(wrapper.find('.locker-location').exists()).toBe(false)
    })
    
    it('should disable selection when not available', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'occupied' }
      })
      expect(wrapper.find('.locker-item').classes()).toContain('disabled')
      
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'maintenance' }
      })
      expect(wrapper.find('.locker-item').classes()).toContain('disabled')
    })
    
    it('should show selected state', async () => {
      await wrapper.setProps({ selected: true })
      expect(wrapper.find('.locker-item').classes()).toContain('selected')
    })
    
    it('should show highlighted state', async () => {
      await wrapper.setProps({ highlighted: true })
      expect(wrapper.find('.locker-item').classes()).toContain('highlighted')
    })
  })
  
  describe('Events', () => {
    it('should emit select event when available locker is clicked', async () => {
      await wrapper.find('.locker-item').trigger('click')
      
      expect(wrapper.emitted().select).toBeTruthy()
      expect(wrapper.emitted().select[0][0]).toEqual(defaultLocker)
    })
    
    it('should not emit select event when occupied locker is clicked', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'occupied' }
      })
      
      await wrapper.find('.locker-item').trigger('click')
      
      expect(wrapper.emitted().select).toBeFalsy()
    })
    
    it('should not emit select event when maintenance locker is clicked', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'maintenance' }
      })
      
      await wrapper.find('.locker-item').trigger('click')
      
      expect(wrapper.emitted().select).toBeFalsy()
    })
    
    it('should emit select event when reserved locker is clicked if allowed', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'reserved' },
        allowReserved: true
      })
      
      await wrapper.find('.locker-item').trigger('click')
      
      expect(wrapper.emitted().select).toBeTruthy()
    })
    
    it('should not emit select event when reserved locker is clicked if not allowed', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'reserved' },
        allowReserved: false
      })
      
      await wrapper.find('.locker-item').trigger('click')
      
      expect(wrapper.emitted().select).toBeFalsy()
    })
  })
  
  describe('Display modes', () => {
    it('should render in compact mode', async () => {
      await wrapper.setProps({ compact: true })
      expect(wrapper.find('.locker-item').classes()).toContain('compact')
      expect(wrapper.find('.locker-size').exists()).toBe(false)
      expect(wrapper.find('.locker-location').exists()).toBe(false)
    })
    
    it('should render in grid mode', async () => {
      await wrapper.setProps({ mode: 'grid' })
      expect(wrapper.find('.locker-item').classes()).toContain('mode-grid')
    })
    
    it('should render in list mode', async () => {
      await wrapper.setProps({ mode: 'list' })
      expect(wrapper.find('.locker-item').classes()).toContain('mode-list')
    })
    
    it('should show details in list mode', async () => {
      await wrapper.setProps({
        mode: 'list',
        locker: {
          ...defaultLocker,
          lastUsed: '2024-01-20 14:30:00',
          userName: '张三'
        }
      })
      
      expect(wrapper.find('.last-used').exists()).toBe(true)
      expect(wrapper.find('.user-name').text()).toBe('张三')
    })
  })
  
  describe('Additional information', () => {
    it('should display price if provided', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, price: 10 }
      })
      expect(wrapper.find('.locker-price').text()).toBe('¥10/天')
    })
    
    it('should display custom price unit', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, price: 5, priceUnit: '小时' }
      })
      expect(wrapper.find('.locker-price').text()).toBe('¥5/小时')
    })
    
    it('should display features if provided', async () => {
      await wrapper.setProps({
        locker: {
          ...defaultLocker,
          features: ['温控', '防潮', '24小时监控']
        }
      })
      
      const features = wrapper.findAll('.feature-tag')
      expect(features).toHaveLength(3)
      expect(features.at(0).text()).toBe('温控')
      expect(features.at(1).text()).toBe('防潮')
      expect(features.at(2).text()).toBe('24小时监控')
    })
    
    it('should show reservation info for reserved lockers', async () => {
      await wrapper.setProps({
        locker: {
          ...defaultLocker,
          status: 'reserved',
          reservedUntil: '2024-01-20 18:00:00',
          reservedBy: '李四'
        }
      })
      
      expect(wrapper.find('.reservation-info').exists()).toBe(true)
      expect(wrapper.find('.reserved-until').text()).toContain('18:00')
    })
  })
  
  describe('Computed properties', () => {
    it('should compute status text correctly', () => {
      expect(wrapper.vm.statusText).toBe('空闲')
    })
    
    it('should compute size text correctly', () => {
      expect(wrapper.vm.sizeText).toBe('中型')
    })
    
    it('should determine if selectable', () => {
      expect(wrapper.vm.isSelectable).toBe(true)
      
      wrapper.setProps({
        locker: { ...defaultLocker, status: 'occupied' }
      })
      expect(wrapper.vm.isSelectable).toBe(false)
    })
    
    it('should compute status color', () => {
      const colorMap = {
        available: '#52c41a',
        occupied: '#f5222d',
        maintenance: '#faad14',
        reserved: '#1890ff'
      }
      
      for (const [status, color] of Object.entries(colorMap)) {
        wrapper.setProps({
          locker: { ...defaultLocker, status }
        })
        expect(wrapper.vm.statusColor).toBe(color)
      }
    })
  })
  
  describe('Slots', () => {
    it('should render custom content slot', () => {
      wrapper = shallowMount(LockerItem, {
        propsData: { locker: defaultLocker },
        slots: {
          default: '<div class="custom-content">Custom Content</div>'
        }
      })
      
      expect(wrapper.find('.custom-content').text()).toBe('Custom Content')
    })
    
    it('should render badge slot', () => {
      wrapper = shallowMount(LockerItem, {
        propsData: { locker: defaultLocker },
        slots: {
          badge: '<div class="custom-badge">HOT</div>'
        }
      })
      
      expect(wrapper.find('.custom-badge').text()).toBe('HOT')
    })
  })
  
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const item = wrapper.find('.locker-item')
      expect(item.attributes('role')).toBe('button')
      expect(item.attributes('aria-label')).toContain('A01')
      expect(item.attributes('aria-pressed')).toBe('false')
    })
    
    it('should update aria-pressed when selected', async () => {
      await wrapper.setProps({ selected: true })
      expect(wrapper.find('.locker-item').attributes('aria-pressed')).toBe('true')
    })
    
    it('should have aria-disabled for unavailable lockers', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'occupied' }
      })
      expect(wrapper.find('.locker-item').attributes('aria-disabled')).toBe('true')
    })
  })
  
  describe('Error handling', () => {
    it('should handle missing locker data', () => {
      wrapper = shallowMount(LockerItem, {
        propsData: { locker: null }
      })
      
      expect(wrapper.find('.locker-number').text()).toBe('--')
      expect(wrapper.find('.locker-status').text()).toBe('未知')
    })
    
    it('should handle invalid status', async () => {
      await wrapper.setProps({
        locker: { ...defaultLocker, status: 'invalid' }
      })
      
      expect(wrapper.find('.locker-status').text()).toBe('未知')
    })
  })
  
  describe('Touch interactions', () => {
    it('should handle long press', async () => {
      jest.useFakeTimers()
      
      await wrapper.find('.locker-item').trigger('touchstart')
      
      jest.advanceTimersByTime(500)
      
      await wrapper.find('.locker-item').trigger('touchend')
      
      expect(wrapper.emitted()['long-press']).toBeTruthy()
      expect(wrapper.emitted()['long-press'][0][0]).toEqual(defaultLocker)
      
      jest.useRealTimers()
    })
    
    it('should cancel long press on move', async () => {
      jest.useFakeTimers()
      
      await wrapper.find('.locker-item').trigger('touchstart')
      await wrapper.find('.locker-item').trigger('touchmove')
      
      jest.advanceTimersByTime(500)
      
      await wrapper.find('.locker-item').trigger('touchend')
      
      expect(wrapper.emitted()['long-press']).toBeFalsy()
      
      jest.useRealTimers()
    })
  })
})