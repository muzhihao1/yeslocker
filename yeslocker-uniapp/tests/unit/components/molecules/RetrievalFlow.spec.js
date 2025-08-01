import { shallowMount, createLocalVue } from '@vue/test-utils'
import RetrievalFlow from '@/components/molecules/RetrievalFlow.vue'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('RetrievalFlow.vue', () => {
  let wrapper
  let store
  let actions
  let state
  
  beforeEach(() => {
    // Mock Vuex store
    state = {
      user: {
        userInfo: {
          id: '12345',
          name: '张三',
          phone: '13800138000'
        }
      },
      locker: {
        activeStorage: null
      }
    }
    
    actions = {
      'locker/validateVoucher': jest.fn(),
      'locker/calculateRetrievalFee': jest.fn(),
      'locker/processRetrieval': jest.fn(),
      'locker/clearActiveStorage': jest.fn()
    }
    
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state: state.user
        },
        locker: {
          namespaced: true,
          state: state.locker,
          actions
        }
      }
    })
    
    wrapper = shallowMount(RetrievalFlow, {
      localVue,
      store,
      propsData: {
        initialCode: ''
      }
    })
  })
  
  afterEach(() => {
    wrapper.destroy()
    jest.clearAllMocks()
  })
  
  describe('Component initialization', () => {
    it('should initialize with voucher input step', () => {
      expect(wrapper.vm.currentStep).toBe('voucher-input')
    })
    
    it('should use initial code if provided', async () => {
      await wrapper.setProps({ initialCode: 'YS2024012012345' })
      expect(wrapper.vm.voucherCode).toBe('YS2024012012345')
    })
    
    it('should auto-validate if initial code provided', async () => {
      const mockStorage = {
        id: '123',
        voucherCode: 'YS2024012012345',
        lockerId: 'A01',
        storageTime: '2024-01-20 12:00:00'
      }
      
      actions['locker/validateVoucher'].mockResolvedValueOnce(mockStorage)
      
      wrapper = shallowMount(RetrievalFlow, {
        localVue,
        store,
        propsData: {
          initialCode: 'YS2024012012345'
        }
      })
      
      await wrapper.vm.$nextTick()
      
      expect(actions['locker/validateVoucher']).toHaveBeenCalledWith(
        expect.any(Object),
        'YS2024012012345'
      )
    })
  })
  
  describe('Voucher input step', () => {
    it('should display voucher input form', () => {
      expect(wrapper.find('.voucher-input-form').exists()).toBe(true)
    })
    
    it('should handle manual code input', async () => {
      const input = wrapper.find('.voucher-input')
      await input.setValue('YS2024012012345')
      
      expect(wrapper.vm.voucherCode).toBe('YS2024012012345')
    })
    
    it('should validate voucher format', () => {
      expect(wrapper.vm.isValidVoucherCode('YS2024012012345')).toBe(true)
      expect(wrapper.vm.isValidVoucherCode('123456')).toBe(true) // Digital code
      expect(wrapper.vm.isValidVoucherCode('invalid')).toBe(false)
      expect(wrapper.vm.isValidVoucherCode('')).toBe(false)
    })
    
    it('should scan QR code', async () => {
      uni.scanCode.mockResolvedValueOnce({
        result: 'YS2024012012345'
      })
      
      await wrapper.vm.scanQRCode()
      
      expect(uni.scanCode).toHaveBeenCalledWith({
        onlyFromCamera: false,
        scanType: ['qrCode']
      })
      
      expect(wrapper.vm.voucherCode).toBe('YS2024012012345')
    })
    
    it('should handle scan failure', async () => {
      uni.scanCode.mockRejectedValueOnce(new Error('Scan cancelled'))
      
      await wrapper.vm.scanQRCode()
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '扫描取消',
        icon: 'none'
      })
    })
    
    it('should validate voucher', async () => {
      const mockStorage = {
        id: '123',
        voucherCode: 'YS2024012012345',
        lockerId: 'A01',
        lockerNumber: 'A01',
        storageTime: '2024-01-20 12:00:00',
        userName: '张三',
        userPhone: '13800138000'
      }
      
      actions['locker/validateVoucher'].mockResolvedValueOnce(mockStorage)
      
      wrapper.setData({ voucherCode: 'YS2024012012345' })
      await wrapper.vm.validateVoucher()
      
      expect(actions['locker/validateVoucher']).toHaveBeenCalledWith(
        expect.any(Object),
        'YS2024012012345'
      )
      
      expect(wrapper.vm.storageInfo).toEqual(mockStorage)
      expect(wrapper.vm.currentStep).toBe('fee-calculation')
    })
    
    it('should handle invalid voucher', async () => {
      actions['locker/validateVoucher'].mockRejectedValueOnce(
        new Error('凭证无效或已过期')
      )
      
      wrapper.setData({ voucherCode: 'INVALID123' })
      await wrapper.vm.validateVoucher()
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '凭证无效或已过期',
        icon: 'none'
      })
      
      expect(wrapper.vm.currentStep).toBe('voucher-input')
    })
  })
  
  describe('Fee calculation step', () => {
    beforeEach(() => {
      wrapper.setData({
        currentStep: 'fee-calculation',
        storageInfo: {
          id: '123',
          lockerId: 'A01',
          lockerNumber: 'A01',
          storageTime: '2024-01-20 12:00:00',
          userName: '张三'
        }
      })
    })
    
    it('should display storage information', () => {
      expect(wrapper.find('.storage-info').exists()).toBe(true)
      expect(wrapper.find('.locker-number').text()).toContain('A01')
      expect(wrapper.find('.user-name').text()).toContain('张三')
    })
    
    it('should calculate retrieval fee', async () => {
      const mockFeeInfo = {
        totalFee: 50,
        storageDays: 5,
        dailyRate: 10,
        overtimeFee: 0
      }
      
      actions['locker/calculateRetrievalFee'].mockResolvedValueOnce(mockFeeInfo)
      
      await wrapper.vm.calculateFee()
      
      expect(actions['locker/calculateRetrievalFee']).toHaveBeenCalledWith(
        expect.any(Object),
        '123'
      )
      
      expect(wrapper.vm.feeInfo).toEqual(mockFeeInfo)
      expect(wrapper.find('.total-fee').text()).toContain('50')
    })
    
    it('should display fee breakdown', async () => {
      wrapper.setData({
        feeInfo: {
          totalFee: 80,
          storageDays: 7,
          dailyRate: 10,
          overtimeFee: 10
        }
      })
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.storage-days').text()).toContain('7')
      expect(wrapper.find('.daily-rate').text()).toContain('10')
      expect(wrapper.find('.overtime-fee').text()).toContain('10')
    })
    
    it('should handle free storage period', async () => {
      const mockFeeInfo = {
        totalFee: 0,
        storageDays: 1,
        dailyRate: 10,
        overtimeFee: 0,
        freeStorage: true
      }
      
      actions['locker/calculateRetrievalFee'].mockResolvedValueOnce(mockFeeInfo)
      
      await wrapper.vm.calculateFee()
      
      expect(wrapper.find('.free-storage-notice').exists()).toBe(true)
      expect(wrapper.find('.total-fee').text()).toContain('0')
    })
    
    it('should proceed to payment for non-zero fee', async () => {
      wrapper.setData({
        feeInfo: { totalFee: 50 }
      })
      
      await wrapper.vm.proceedToNext()
      
      expect(wrapper.vm.currentStep).toBe('payment')
    })
    
    it('should skip payment for zero fee', async () => {
      wrapper.setData({
        feeInfo: { totalFee: 0 }
      })
      
      await wrapper.vm.proceedToNext()
      
      expect(wrapper.vm.currentStep).toBe('confirmation')
    })
  })
  
  describe('Payment step', () => {
    beforeEach(() => {
      wrapper.setData({
        currentStep: 'payment',
        feeInfo: { totalFee: 50 },
        storageInfo: { id: '123' }
      })
    })
    
    it('should display payment options', () => {
      expect(wrapper.find('.payment-options').exists()).toBe(true)
      expect(wrapper.findAll('.payment-method').length).toBeGreaterThan(0)
    })
    
    it('should select payment method', async () => {
      await wrapper.vm.selectPaymentMethod('wechat')
      
      expect(wrapper.vm.selectedPaymentMethod).toBe('wechat')
      expect(wrapper.find('.payment-method.selected').exists()).toBe(true)
    })
    
    it('should process WeChat payment', async () => {
      wrapper.setData({ selectedPaymentMethod: 'wechat' })
      
      uni.requestPayment.mockResolvedValueOnce({ errMsg: 'requestPayment:ok' })
      
      await wrapper.vm.processPayment()
      
      expect(uni.requestPayment).toHaveBeenCalledWith({
        provider: 'wxpay',
        timeStamp: expect.any(String),
        nonceStr: expect.any(String),
        package: expect.any(String),
        signType: 'MD5',
        paySign: expect.any(String)
      })
      
      expect(wrapper.vm.paymentStatus).toBe('success')
      expect(wrapper.vm.currentStep).toBe('confirmation')
    })
    
    it('should handle payment failure', async () => {
      wrapper.setData({ selectedPaymentMethod: 'wechat' })
      
      uni.requestPayment.mockRejectedValueOnce({ errMsg: 'requestPayment:fail' })
      
      await wrapper.vm.processPayment()
      
      expect(wrapper.vm.paymentStatus).toBe('failed')
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '支付失败，请重试',
        icon: 'none'
      })
    })
    
    it('should handle payment cancellation', async () => {
      wrapper.setData({ selectedPaymentMethod: 'wechat' })
      
      uni.requestPayment.mockRejectedValueOnce({ errMsg: 'requestPayment:fail cancel' })
      
      await wrapper.vm.processPayment()
      
      expect(wrapper.vm.paymentStatus).toBe('cancelled')
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '支付已取消',
        icon: 'none'
      })
    })
    
    it('should retry payment', async () => {
      wrapper.setData({ paymentStatus: 'failed' })
      
      await wrapper.vm.retryPayment()
      
      expect(wrapper.vm.paymentStatus).toBe('pending')
    })
  })
  
  describe('Confirmation step', () => {
    beforeEach(() => {
      wrapper.setData({
        currentStep: 'confirmation',
        storageInfo: {
          id: '123',
          lockerId: 'A01',
          lockerNumber: 'A01'
        },
        feeInfo: { totalFee: 50 },
        paymentStatus: 'success'
      })
    })
    
    it('should display confirmation message', () => {
      expect(wrapper.find('.confirmation-message').exists()).toBe(true)
      expect(wrapper.find('.locker-unlock-info').exists()).toBe(true)
    })
    
    it('should show unlock instructions', () => {
      expect(wrapper.find('.unlock-instructions').exists()).toBe(true)
      expect(wrapper.find('.locker-number-large').text()).toContain('A01')
    })
    
    it('should confirm retrieval', async () => {
      const mockResult = {
        success: true,
        unlockCode: '8888',
        retrievalTime: '2024-01-25 15:00:00'
      }
      
      actions['locker/processRetrieval'].mockResolvedValueOnce(mockResult)
      
      await wrapper.vm.confirmRetrieval()
      
      expect(actions['locker/processRetrieval']).toHaveBeenCalledWith(
        expect.any(Object),
        {
          storageId: '123',
          paymentInfo: expect.any(Object)
        }
      )
      
      expect(wrapper.vm.retrievalResult).toEqual(mockResult)
      expect(wrapper.vm.currentStep).toBe('complete')
    })
    
    it('should handle retrieval failure', async () => {
      actions['locker/processRetrieval'].mockRejectedValueOnce(
        new Error('柜门故障，请联系工作人员')
      )
      
      await wrapper.vm.confirmRetrieval()
      
      expect(uni.showModal).toHaveBeenCalledWith({
        title: '取出失败',
        content: '柜门故障，请联系工作人员',
        showCancel: false
      })
    })
  })
  
  describe('Complete step', () => {
    beforeEach(() => {
      wrapper.setData({
        currentStep: 'complete',
        retrievalResult: {
          success: true,
          unlockCode: '8888',
          retrievalTime: '2024-01-25 15:00:00'
        }
      })
    })
    
    it('should display success message', () => {
      expect(wrapper.find('.success-container').exists()).toBe(true)
      expect(wrapper.find('.unlock-code').text()).toContain('8888')
    })
    
    it('should show rating component', () => {
      expect(wrapper.find('.rating-component').exists()).toBe(true)
    })
    
    it('should submit rating', async () => {
      await wrapper.vm.submitRating(5, '服务很好')
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/storage/rating'),
        method: 'POST',
        data: {
          storageId: expect.any(String),
          rating: 5,
          comment: '服务很好'
        }
      })
    })
    
    it('should complete flow', async () => {
      await wrapper.vm.completeFlow()
      
      expect(actions['locker/clearActiveStorage']).toHaveBeenCalled()
      expect(wrapper.emitted().complete).toBeTruthy()
      expect(wrapper.emitted().complete[0][0]).toMatchObject({
        storageInfo: expect.any(Object),
        feeInfo: expect.any(Object),
        retrievalResult: expect.any(Object)
      })
    })
  })
  
  describe('Navigation', () => {
    it('should go back to previous step', async () => {
      wrapper.setData({ currentStep: 'fee-calculation' })
      
      await wrapper.vm.goBack()
      
      expect(wrapper.vm.currentStep).toBe('voucher-input')
    })
    
    it('should not go back from voucher input', async () => {
      wrapper.setData({ currentStep: 'voucher-input' })
      
      await wrapper.vm.goBack()
      
      expect(wrapper.emitted().cancel).toBeTruthy()
    })
    
    it('should not allow back navigation during payment', async () => {
      wrapper.setData({ 
        currentStep: 'payment',
        paymentStatus: 'processing'
      })
      
      await wrapper.vm.goBack()
      
      expect(wrapper.vm.currentStep).toBe('payment')
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '支付进行中，请稍候',
        icon: 'none'
      })
    })
  })
  
  describe('Error recovery', () => {
    it('should handle timeout during validation', async () => {
      jest.useFakeTimers()
      
      actions['locker/validateVoucher'].mockImplementationOnce(() => 
        new Promise((resolve) => setTimeout(resolve, 10000))
      )
      
      wrapper.setData({ voucherCode: 'YS123' })
      const validatePromise = wrapper.vm.validateVoucher()
      
      jest.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.loading-text').text()).toContain('验证中')
      
      jest.advanceTimersByTime(6000)
      await validatePromise.catch(() => {})
      
      expect(wrapper.vm.error).toContain('超时')
      
      jest.useRealTimers()
    })
    
    it('should retry failed operations', async () => {
      wrapper.setData({ error: 'Network error' })
      
      await wrapper.vm.retry()
      
      expect(wrapper.vm.error).toBe(null)
    })
  })
  
  describe('Analytics', () => {
    it('should track flow start', () => {
      const trackEvent = jest.spyOn(wrapper.vm, 'trackEvent')
      
      wrapper.vm.startFlow()
      
      expect(trackEvent).toHaveBeenCalledWith('retrieval_flow_start', {
        hasInitialCode: false
      })
    })
    
    it('should track successful completion', async () => {
      const trackEvent = jest.spyOn(wrapper.vm, 'trackEvent')
      
      wrapper.setData({
        storageInfo: { id: '123' },
        feeInfo: { totalFee: 50 }
      })
      
      await wrapper.vm.completeFlow()
      
      expect(trackEvent).toHaveBeenCalledWith('retrieval_flow_complete', {
        storageId: '123',
        totalFee: 50,
        duration: expect.any(Number)
      })
    })
  })
})