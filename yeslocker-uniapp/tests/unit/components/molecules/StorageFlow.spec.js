import { shallowMount, createLocalVue } from '@vue/test-utils'
import StorageFlow from '@/components/molecules/StorageFlow.vue'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('StorageFlow.vue', () => {
  let wrapper
  let store
  let actions
  let state
  let getters
  
  beforeEach(() => {
    // Mock Vuex store
    state = {
      user: {
        userInfo: {
          id: '12345',
          name: '张三',
          phone: '13800138000',
          verified: true
        }
      },
      locker: {
        availableLockers: [
          { id: 'A01', number: 'A01', status: 'available', size: 'medium' },
          { id: 'A02', number: 'A02', status: 'available', size: 'large' },
          { id: 'B01', number: 'B01', status: 'occupied', size: 'medium' }
        ],
        selectedLocker: null
      }
    }
    
    getters = {
      'locker/availableCount': () => 2,
      'user/isVerified': () => true
    }
    
    actions = {
      'locker/fetchAvailableLockers': jest.fn(),
      'locker/selectLocker': jest.fn(),
      'locker/createStorageRecord': jest.fn()
    }
    
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state: state.user,
          getters: {
            isVerified: () => state.user.userInfo?.verified || false
          }
        },
        locker: {
          namespaced: true,
          state: state.locker,
          actions,
          getters: {
            availableCount: () => state.locker.availableLockers.filter(l => l.status === 'available').length
          }
        }
      }
    })
    
    wrapper = shallowMount(StorageFlow, {
      localVue,
      store,
      propsData: {
        userInfo: state.user.userInfo
      }
    })
  })
  
  afterEach(() => {
    wrapper.destroy()
    jest.clearAllMocks()
  })
  
  describe('Component initialization', () => {
    it('should initialize with correct default step', () => {
      expect(wrapper.vm.currentStep).toBe('verification')
    })
    
    it('should skip verification if user is verified', async () => {
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStep).toBe('locker-selection')
    })
    
    it('should fetch available lockers on mount', () => {
      expect(actions['locker/fetchAvailableLockers']).toHaveBeenCalled()
    })
    
    it('should show loading state while fetching', async () => {
      wrapper.setData({ loading: true })
      expect(wrapper.find('.loading-container').exists()).toBe(true)
    })
  })
  
  describe('Step navigation', () => {
    it('should progress through steps correctly', async () => {
      // Start at locker selection (skipped verification)
      expect(wrapper.vm.currentStep).toBe('locker-selection')
      
      // Select a locker
      const locker = { id: 'A01', number: 'A01' }
      await wrapper.vm.selectLocker(locker)
      expect(wrapper.vm.currentStep).toBe('confirmation')
      
      // Confirm storage
      await wrapper.vm.confirmStorage()
      expect(wrapper.vm.currentStep).toBe('voucher')
    })
    
    it('should allow going back to previous step', async () => {
      wrapper.setData({ currentStep: 'confirmation' })
      
      await wrapper.vm.goBack()
      expect(wrapper.vm.currentStep).toBe('locker-selection')
    })
    
    it('should not go back from first step', async () => {
      wrapper.setData({ currentStep: 'verification' })
      
      await wrapper.vm.goBack()
      expect(wrapper.vm.currentStep).toBe('verification')
      expect(wrapper.emitted().cancel).toBeTruthy()
    })
  })
  
  describe('Identity verification step', () => {
    beforeEach(() => {
      wrapper.setData({ 
        currentStep: 'verification',
        userInfo: { ...state.user.userInfo, verified: false }
      })
    })
    
    it('should show identity verification component', () => {
      expect(wrapper.find('.identity-verify').exists()).toBe(true)
    })
    
    it('should handle verification success', async () => {
      const verifyData = {
        userId: '12345',
        name: '张三',
        phone: '13800138000',
        verified: true
      }
      
      await wrapper.vm.handleVerifySuccess(verifyData)
      
      expect(wrapper.vm.userInfo.verified).toBe(true)
      expect(wrapper.vm.currentStep).toBe('locker-selection')
    })
    
    it('should handle verification failure', async () => {
      const error = { code: 'ID_INVALID', message: '身份验证失败' }
      
      await wrapper.vm.handleVerifyFail(error)
      
      expect(wrapper.emitted()['verify-fail']).toBeTruthy()
      expect(wrapper.emitted()['verify-fail'][0][0]).toEqual(error)
    })
  })
  
  describe('Locker selection step', () => {
    beforeEach(() => {
      wrapper.setData({ currentStep: 'locker-selection' })
    })
    
    it('should display available lockers', () => {
      const lockerItems = wrapper.findAll('.locker-item')
      expect(lockerItems).toHaveLength(2) // Only available ones
    })
    
    it('should filter lockers by size', async () => {
      await wrapper.vm.filterBySize('large')
      
      const filteredLockers = wrapper.vm.filteredLockers
      expect(filteredLockers).toHaveLength(1)
      expect(filteredLockers[0].size).toBe('large')
    })
    
    it('should sort lockers', async () => {
      await wrapper.vm.sortLockers('number')
      
      const sortedLockers = wrapper.vm.filteredLockers
      expect(sortedLockers[0].number).toBe('A01')
      expect(sortedLockers[1].number).toBe('A02')
    })
    
    it('should select a locker', async () => {
      const locker = { id: 'A01', number: 'A01' }
      
      await wrapper.vm.selectLocker(locker)
      
      expect(wrapper.vm.selectedLocker).toEqual(locker)
      expect(actions['locker/selectLocker']).toHaveBeenCalledWith(
        expect.any(Object),
        locker
      )
      expect(wrapper.vm.currentStep).toBe('confirmation')
    })
    
    it('should show no lockers message when none available', async () => {
      store.state.locker.availableLockers = []
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.no-lockers-message').exists()).toBe(true)
    })
  })
  
  describe('Confirmation step', () => {
    beforeEach(() => {
      wrapper.setData({
        currentStep: 'confirmation',
        selectedLocker: { id: 'A01', number: 'A01', size: 'medium' }
      })
    })
    
    it('should display storage details', () => {
      expect(wrapper.find('.storage-details').exists()).toBe(true)
      expect(wrapper.find('.locker-number').text()).toContain('A01')
      expect(wrapper.find('.user-name').text()).toContain('张三')
    })
    
    it('should calculate and display fee', async () => {
      await wrapper.vm.calculateFee()
      
      expect(wrapper.vm.estimatedFee).toBeGreaterThan(0)
      expect(wrapper.find('.fee-amount').text()).toMatch(/¥\d+/)
    })
    
    it('should show terms and conditions', () => {
      expect(wrapper.find('.terms-conditions').exists()).toBe(true)
    })
    
    it('should require agreement before confirming', async () => {
      wrapper.setData({ agreedToTerms: false })
      
      const confirmButton = wrapper.find('.confirm-button')
      expect(confirmButton.attributes('disabled')).toBe('disabled')
      
      await wrapper.setData({ agreedToTerms: true })
      expect(confirmButton.attributes('disabled')).toBeUndefined()
    })
    
    it('should confirm storage', async () => {
      wrapper.setData({ agreedToTerms: true })
      
      const mockVoucher = {
        code: 'YS2024012012345',
        digitalCode: '123456',
        qrCodeUrl: '/qr/12345.png'
      }
      
      actions['locker/createStorageRecord'].mockResolvedValueOnce(mockVoucher)
      
      await wrapper.vm.confirmStorage()
      
      expect(actions['locker/createStorageRecord']).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          lockerId: 'A01',
          userId: '12345'
        })
      )
      
      expect(wrapper.vm.voucher).toEqual(mockVoucher)
      expect(wrapper.vm.currentStep).toBe('voucher')
    })
    
    it('should handle storage confirmation error', async () => {
      wrapper.setData({ agreedToTerms: true })
      
      actions['locker/createStorageRecord'].mockRejectedValueOnce(
        new Error('Storage failed')
      )
      
      await wrapper.vm.confirmStorage()
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '存储失败，请重试',
        icon: 'none'
      })
      
      expect(wrapper.vm.currentStep).toBe('confirmation') // Stay on same step
    })
  })
  
  describe('Voucher step', () => {
    beforeEach(() => {
      wrapper.setData({
        currentStep: 'voucher',
        voucher: {
          code: 'YS2024012012345',
          digitalCode: '123456',
          qrCodeUrl: '/qr/12345.png',
          expiryDate: '2024-02-20 12:00:00'
        }
      })
    })
    
    it('should display voucher information', () => {
      expect(wrapper.find('.voucher-code').exists()).toBe(true)
      expect(wrapper.find('.success-message').exists()).toBe(true)
    })
    
    it('should save voucher to device', async () => {
      uni.saveImageToPhotosAlbum.mockResolvedValueOnce({ errMsg: 'success' })
      
      await wrapper.vm.saveVoucher()
      
      expect(uni.saveImageToPhotosAlbum).toHaveBeenCalled()
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '保存成功',
        icon: 'success'
      })
    })
    
    it('should handle save failure', async () => {
      uni.saveImageToPhotosAlbum.mockRejectedValueOnce(new Error('Save failed'))
      
      await wrapper.vm.saveVoucher()
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '保存失败',
        icon: 'none'
      })
    })
    
    it('should complete the flow', async () => {
      await wrapper.vm.completeFlow()
      
      expect(wrapper.emitted().complete).toBeTruthy()
      expect(wrapper.emitted().complete[0][0]).toMatchObject({
        locker: expect.any(Object),
        voucher: expect.any(Object),
        user: expect.any(Object)
      })
    })
  })
  
  describe('Error handling and recovery', () => {
    it('should handle network errors', async () => {
      actions['locker/fetchAvailableLockers'].mockRejectedValueOnce(
        new Error('Network error')
      )
      
      wrapper = shallowMount(StorageFlow, {
        localVue,
        store,
        propsData: { userInfo: state.user.userInfo }
      })
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.retry-button').exists()).toBe(true)
    })
    
    it('should retry failed operations', async () => {
      wrapper.setData({ error: 'Network error' })
      
      actions['locker/fetchAvailableLockers'].mockResolvedValueOnce([])
      
      await wrapper.vm.retry()
      
      expect(actions['locker/fetchAvailableLockers']).toHaveBeenCalledTimes(2)
      expect(wrapper.vm.error).toBe(null)
    })
  })
  
  describe('Progress indicator', () => {
    it('should show correct progress', () => {
      const steps = ['verification', 'locker-selection', 'confirmation', 'voucher']
      
      steps.forEach((step, index) => {
        wrapper.setData({ currentStep: step })
        expect(wrapper.vm.progressPercentage).toBe((index + 1) * 25)
      })
    })
    
    it('should update step indicator', () => {
      wrapper.setData({ currentStep: 'confirmation' })
      
      const indicators = wrapper.findAll('.step-indicator')
      expect(indicators.at(0).classes()).toContain('completed')
      expect(indicators.at(1).classes()).toContain('completed')
      expect(indicators.at(2).classes()).toContain('active')
      expect(indicators.at(3).classes()).not.toContain('active')
    })
  })
  
  describe('Cancellation', () => {
    it('should show confirmation dialog on cancel', async () => {
      uni.showModal.mockResolvedValueOnce({ confirm: true })
      
      await wrapper.vm.cancelFlow()
      
      expect(uni.showModal).toHaveBeenCalledWith({
        title: '确认取消',
        content: '确定要取消存储流程吗？',
        confirmText: '确定',
        cancelText: '继续'
      })
    })
    
    it('should emit cancel event when confirmed', async () => {
      uni.showModal.mockResolvedValueOnce({ confirm: true })
      
      await wrapper.vm.cancelFlow()
      
      expect(wrapper.emitted().cancel).toBeTruthy()
      expect(wrapper.emitted().cancel[0][0]).toMatchObject({
        step: wrapper.vm.currentStep,
        reason: 'user_cancelled'
      })
    })
    
    it('should not cancel when user chooses to continue', async () => {
      uni.showModal.mockResolvedValueOnce({ confirm: false })
      
      await wrapper.vm.cancelFlow()
      
      expect(wrapper.emitted().cancel).toBeFalsy()
    })
  })
  
  describe('Analytics tracking', () => {
    it('should track step changes', async () => {
      const trackEvent = jest.spyOn(wrapper.vm, 'trackEvent')
      
      await wrapper.vm.nextStep()
      
      expect(trackEvent).toHaveBeenCalledWith('storage_flow_step', {
        step: wrapper.vm.currentStep,
        direction: 'forward'
      })
    })
    
    it('should track completion', async () => {
      const trackEvent = jest.spyOn(wrapper.vm, 'trackEvent')
      
      wrapper.setData({
        currentStep: 'voucher',
        voucher: { code: 'YS123' }
      })
      
      await wrapper.vm.completeFlow()
      
      expect(trackEvent).toHaveBeenCalledWith('storage_flow_complete', {
        duration: expect.any(Number),
        lockerId: expect.any(String)
      })
    })
  })
})