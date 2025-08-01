import { shallowMount } from '@vue/test-utils'
import VoucherCode from '@/components/atoms/VoucherCode.vue'

describe('VoucherCode.vue', () => {
  let wrapper
  
  const defaultVoucherData = {
    code: 'YS2024012012345',
    digitalCode: '123456',
    qrCodeUrl: '/static/qr-code.png',
    status: 'active',
    expiryDate: '2024-02-20 12:00:00',
    lockerNumber: 'A01',
    storageTime: '2024-01-20 12:00:00'
  }
  
  beforeEach(() => {
    wrapper = shallowMount(VoucherCode, {
      propsData: {
        voucherData: defaultVoucherData
      }
    })
  })
  
  afterEach(() => {
    wrapper.destroy()
  })
  
  describe('Props', () => {
    it('should render voucher data correctly', () => {
      expect(wrapper.find('.voucher-code').text()).toBe('YS2024012012345')
      expect(wrapper.find('.digital-code').text()).toBe('123456')
      expect(wrapper.find('.qr-code img').attributes('src')).toBe('/static/qr-code.png')
    })
    
    it('should display status correctly', () => {
      expect(wrapper.find('.voucher-status').text()).toBe('有效')
      expect(wrapper.find('.voucher-status').classes()).toContain('status-active')
    })
    
    it('should display different status types', async () => {
      const statusMap = {
        active: { text: '有效', class: 'status-active' },
        used: { text: '已使用', class: 'status-used' },
        expired: { text: '已过期', class: 'status-expired' },
        cancelled: { text: '已取消', class: 'status-cancelled' }
      }
      
      for (const [status, expected] of Object.entries(statusMap)) {
        await wrapper.setProps({
          voucherData: { ...defaultVoucherData, status }
        })
        expect(wrapper.find('.voucher-status').text()).toBe(expected.text)
        expect(wrapper.find('.voucher-status').classes()).toContain(expected.class)
      }
    })
    
    it('should display expiry information', () => {
      expect(wrapper.find('.expiry-date').text()).toContain('2024-02-20')
    })
    
    it('should show warning for soon-to-expire vouchers', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      await wrapper.setProps({
        voucherData: {
          ...defaultVoucherData,
          expiryDate: tomorrow.toISOString()
        }
      })
      
      expect(wrapper.find('.expiry-warning').exists()).toBe(true)
      expect(wrapper.find('.expiry-warning').text()).toContain('即将过期')
    })
    
    it('should display locker information', () => {
      expect(wrapper.find('.locker-info').text()).toContain('A01')
    })
    
    it('should hide details in compact mode', async () => {
      await wrapper.setProps({ compact: true })
      
      expect(wrapper.find('.voucher-details').exists()).toBe(false)
      expect(wrapper.find('.qr-code').classes()).toContain('compact')
    })
    
    it('should show/hide QR code based on prop', async () => {
      await wrapper.setProps({ showQrCode: false })
      expect(wrapper.find('.qr-code').exists()).toBe(false)
    })
    
    it('should show/hide digital code based on prop', async () => {
      await wrapper.setProps({ showDigitalCode: false })
      expect(wrapper.find('.digital-code-section').exists()).toBe(false)
    })
  })
  
  describe('QR Code handling', () => {
    it('should emit qr-click event when QR code is clicked', async () => {
      await wrapper.find('.qr-code').trigger('click')
      
      expect(wrapper.emitted()['qr-click']).toBeTruthy()
      expect(wrapper.emitted()['qr-click'][0][0]).toEqual(defaultVoucherData)
    })
    
    it('should show enlarged QR code on click', async () => {
      await wrapper.find('.qr-code').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.qr-overlay').exists()).toBe(true)
      expect(wrapper.find('.qr-overlay img').attributes('src')).toBe('/static/qr-code.png')
    })
    
    it('should close enlarged QR code on overlay click', async () => {
      await wrapper.find('.qr-code').trigger('click')
      await wrapper.vm.$nextTick()
      
      await wrapper.find('.qr-overlay').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.qr-overlay').exists()).toBe(false)
    })
    
    it('should generate QR code if not provided', () => {
      wrapper = shallowMount(VoucherCode, {
        propsData: {
          voucherData: {
            ...defaultVoucherData,
            qrCodeUrl: null
          }
        }
      })
      
      expect(wrapper.vm.qrCodeSource).toContain('data:image/png;base64')
    })
  })
  
  describe('Digital code display', () => {
    it('should format digital code with spaces', () => {
      expect(wrapper.vm.formattedDigitalCode).toBe('123 456')
    })
    
    it('should handle different code lengths', async () => {
      await wrapper.setProps({
        voucherData: { ...defaultVoucherData, digitalCode: '12345678' }
      })
      expect(wrapper.vm.formattedDigitalCode).toBe('1234 5678')
      
      await wrapper.setProps({
        voucherData: { ...defaultVoucherData, digitalCode: '123' }
      })
      expect(wrapper.vm.formattedDigitalCode).toBe('123')
    })
    
    it('should copy digital code to clipboard', async () => {
      uni.setClipboardData.mockImplementationOnce((options) => {
        options.success()
      })
      
      await wrapper.find('.copy-button').trigger('click')
      
      expect(uni.setClipboardData).toHaveBeenCalledWith({
        data: '123456',
        success: expect.any(Function),
        fail: expect.any(Function)
      })
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '复制成功',
        icon: 'success'
      })
    })
    
    it('should handle copy failure', async () => {
      uni.setClipboardData.mockImplementationOnce((options) => {
        options.fail()
      })
      
      await wrapper.find('.copy-button').trigger('click')
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '复制失败',
        icon: 'none'
      })
    })
  })
  
  describe('Events', () => {
    it('should emit voucher-click event', async () => {
      await wrapper.find('.voucher-container').trigger('click')
      
      expect(wrapper.emitted()['voucher-click']).toBeTruthy()
      expect(wrapper.emitted()['voucher-click'][0][0]).toEqual(defaultVoucherData)
    })
    
    it('should emit action event with action type', async () => {
      await wrapper.find('.action-button').trigger('click')
      
      expect(wrapper.emitted().action).toBeTruthy()
      expect(wrapper.emitted().action[0][0]).toEqual({
        action: 'use',
        voucher: defaultVoucherData
      })
    })
    
    it('should prevent event bubbling on specific actions', async () => {
      const stopPropagation = jest.fn()
      
      await wrapper.find('.copy-button').trigger('click', {
        stopPropagation
      })
      
      expect(stopPropagation).toHaveBeenCalled()
    })
  })
  
  describe('Countdown timer', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })
    
    afterEach(() => {
      jest.useRealTimers()
    })
    
    it('should show countdown for expiring vouchers', async () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 2)
      
      await wrapper.setProps({
        voucherData: {
          ...defaultVoucherData,
          expiryDate: futureDate.toISOString()
        },
        showCountdown: true
      })
      
      expect(wrapper.find('.countdown-timer').exists()).toBe(true)
      expect(wrapper.find('.countdown-timer').text()).toMatch(/\d{1,2}:\d{2}:\d{2}/)
    })
    
    it('should update countdown every second', async () => {
      const futureDate = new Date()
      futureDate.setMinutes(futureDate.getMinutes() + 10)
      
      await wrapper.setProps({
        voucherData: {
          ...defaultVoucherData,
          expiryDate: futureDate.toISOString()
        },
        showCountdown: true
      })
      
      const initialCountdown = wrapper.find('.countdown-timer').text()
      
      jest.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()
      
      const updatedCountdown = wrapper.find('.countdown-timer').text()
      expect(initialCountdown).not.toBe(updatedCountdown)
    })
    
    it('should emit expired event when countdown reaches zero', async () => {
      const futureDate = new Date()
      futureDate.setSeconds(futureDate.getSeconds() + 2)
      
      await wrapper.setProps({
        voucherData: {
          ...defaultVoucherData,
          expiryDate: futureDate.toISOString()
        },
        showCountdown: true
      })
      
      jest.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted().expired).toBeTruthy()
      expect(wrapper.emitted().expired[0][0]).toEqual(defaultVoucherData)
    })
  })
  
  describe('Computed properties', () => {
    it('should compute remaining time correctly', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      
      wrapper.setProps({
        voucherData: {
          ...defaultVoucherData,
          expiryDate: futureDate.toISOString()
        }
      })
      
      expect(wrapper.vm.remainingDays).toBe(5)
    })
    
    it('should determine if voucher is valid', () => {
      expect(wrapper.vm.isValid).toBe(true)
      
      wrapper.setProps({
        voucherData: { ...defaultVoucherData, status: 'expired' }
      })
      expect(wrapper.vm.isValid).toBe(false)
      
      wrapper.setProps({
        voucherData: { ...defaultVoucherData, status: 'used' }
      })
      expect(wrapper.vm.isValid).toBe(false)
    })
    
    it('should format dates correctly', () => {
      expect(wrapper.vm.formattedStorageTime).toMatch(/2024-01-20/)
      expect(wrapper.vm.formattedExpiryDate).toMatch(/2024-02-20/)
    })
  })
  
  describe('Slots', () => {
    it('should render header slot', () => {
      wrapper = shallowMount(VoucherCode, {
        propsData: { voucherData: defaultVoucherData },
        slots: {
          header: '<div class="custom-header">Custom Header</div>'
        }
      })
      
      expect(wrapper.find('.custom-header').text()).toBe('Custom Header')
    })
    
    it('should render footer slot', () => {
      wrapper = shallowMount(VoucherCode, {
        propsData: { voucherData: defaultVoucherData },
        slots: {
          footer: '<div class="custom-footer">Custom Footer</div>'
        }
      })
      
      expect(wrapper.find('.custom-footer').text()).toBe('Custom Footer')
    })
    
    it('should render actions slot', () => {
      wrapper = shallowMount(VoucherCode, {
        propsData: { voucherData: defaultVoucherData },
        slots: {
          actions: '<button class="custom-action">Custom Action</button>'
        }
      })
      
      expect(wrapper.find('.custom-action').text()).toBe('Custom Action')
    })
  })
  
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      expect(wrapper.find('.voucher-container').attributes('role')).toBe('article')
      expect(wrapper.find('.voucher-container').attributes('aria-label')).toContain('凭证')
    })
    
    it('should have accessible QR code', () => {
      expect(wrapper.find('.qr-code img').attributes('alt')).toContain('二维码')
    })
    
    it('should announce copy success to screen readers', async () => {
      uni.setClipboardData.mockImplementationOnce((options) => {
        options.success()
      })
      
      await wrapper.find('.copy-button').trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.sr-only').text()).toContain('已复制到剪贴板')
    })
  })
  
  describe('Error handling', () => {
    it('should handle missing voucher data', () => {
      wrapper = shallowMount(VoucherCode, {
        propsData: { voucherData: null }
      })
      
      expect(wrapper.find('.voucher-code').text()).toBe('--')
      expect(wrapper.find('.voucher-status').text()).toBe('未知')
    })
    
    it('should handle QR code load error', async () => {
      await wrapper.find('.qr-code img').trigger('error')
      
      expect(wrapper.find('.qr-code img').attributes('src')).toContain('placeholder')
      expect(wrapper.find('.qr-error').exists()).toBe(true)
    })
    
    it('should handle invalid dates gracefully', async () => {
      await wrapper.setProps({
        voucherData: {
          ...defaultVoucherData,
          expiryDate: 'invalid-date'
        }
      })
      
      expect(wrapper.find('.expiry-date').text()).toContain('--')
    })
  })
  
  describe('Animation and transitions', () => {
    it('should apply entrance animation', () => {
      expect(wrapper.find('.voucher-container').classes()).toContain('fade-in')
    })
    
    it('should animate status changes', async () => {
      await wrapper.setProps({
        voucherData: { ...defaultVoucherData, status: 'used' }
      })
      
      expect(wrapper.find('.voucher-status').classes()).toContain('status-transition')
    })
  })
})