import { shallowMount, createLocalVue } from '@vue/test-utils'
import IdentityVerify from '@/components/molecules/IdentityVerify.vue'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('IdentityVerify.vue', () => {
  let wrapper
  let store
  let actions
  let state
  
  beforeEach(() => {
    // Mock Vuex store
    state = {
      user: {
        userInfo: null
      }
    }
    
    actions = {
      'user/updateUserInfo': jest.fn()
    }
    
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state,
          actions
        }
      }
    })
    
    wrapper = shallowMount(IdentityVerify, {
      localVue,
      store,
      propsData: {
        mode: 'full'
      }
    })
  })
  
  afterEach(() => {
    wrapper.destroy()
    jest.clearAllMocks()
  })
  
  describe('Component initialization', () => {
    it('should initialize with correct default data', () => {
      expect(wrapper.vm.currentStep).toBe(1)
      expect(wrapper.vm.phoneNumber).toBe('')
      expect(wrapper.vm.verificationCode).toBe('')
      expect(wrapper.vm.countdown).toBe(0)
      expect(wrapper.vm.canSendCode).toBe(true)
    })
    
    it('should accept different modes', async () => {
      await wrapper.setProps({ mode: 'simple' })
      expect(wrapper.vm.mode).toBe('simple')
      expect(wrapper.vm.totalSteps).toBe(2) // Simple mode has fewer steps
    })
    
    it('should prefill phone number when provided', async () => {
      await wrapper.setProps({ phoneNumber: '13800138000' })
      expect(wrapper.vm.phoneNumber).toBe('13800138000')
    })
  })
  
  describe('Phone number validation', () => {
    it('should validate phone number format', () => {
      expect(wrapper.vm.isValidPhone('13800138000')).toBe(true)
      expect(wrapper.vm.isValidPhone('1380013800')).toBe(false)
      expect(wrapper.vm.isValidPhone('23800138000')).toBe(false)
      expect(wrapper.vm.isValidPhone('abc')).toBe(false)
      expect(wrapper.vm.isValidPhone('')).toBe(false)
    })
    
    it('should enable next button only with valid phone', async () => {
      const nextButton = wrapper.find('.next-button')
      expect(nextButton.attributes('disabled')).toBe('disabled')
      
      await wrapper.setData({ phoneNumber: '13800138000' })
      expect(nextButton.attributes('disabled')).toBeUndefined()
    })
  })
  
  describe('Verification code sending', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      wrapper.setData({ phoneNumber: '13800138000' })
    })
    
    afterEach(() => {
      jest.useRealTimers()
    })
    
    it('should send verification code successfully', async () => {
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: { code: 0, message: 'success' }
      })
      
      await wrapper.vm.sendVerificationCode()
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/auth/send-code'),
        method: 'POST',
        data: { phone: '13800138000' }
      })
      
      expect(wrapper.emitted()['code-sent']).toBeTruthy()
      expect(wrapper.emitted()['code-sent'][0][0]).toBe('13800138000')
      expect(wrapper.vm.canSendCode).toBe(false)
      expect(wrapper.vm.countdown).toBe(60)
    })
    
    it('should handle send code failure', async () => {
      uni.request.mockRejectedValueOnce(new Error('Network error'))
      
      await wrapper.vm.sendVerificationCode()
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '发送失败，请重试',
        icon: 'none'
      })
      expect(wrapper.vm.canSendCode).toBe(true)
    })
    
    it('should countdown after sending code', async () => {
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: { code: 0, message: 'success' }
      })
      
      await wrapper.vm.sendVerificationCode()
      
      expect(wrapper.vm.countdown).toBe(60)
      
      jest.advanceTimersByTime(1000)
      expect(wrapper.vm.countdown).toBe(59)
      
      jest.advanceTimersByTime(59000)
      expect(wrapper.vm.countdown).toBe(0)
      expect(wrapper.vm.canSendCode).toBe(true)
    })
    
    it('should not send code during countdown', async () => {
      wrapper.setData({ countdown: 30, canSendCode: false })
      
      await wrapper.vm.sendVerificationCode()
      
      expect(uni.request).not.toHaveBeenCalled()
    })
  })
  
  describe('Verification code validation', () => {
    it('should validate code format', () => {
      expect(wrapper.vm.isValidCode('123456')).toBe(true)
      expect(wrapper.vm.isValidCode('12345')).toBe(false)
      expect(wrapper.vm.isValidCode('1234567')).toBe(false)
      expect(wrapper.vm.isValidCode('abcdef')).toBe(false)
    })
    
    it('should verify code successfully', async () => {
      wrapper.setData({
        phoneNumber: '13800138000',
        verificationCode: '123456',
        currentStep: 2
      })
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: {
            userId: '12345',
            name: '张三',
            phone: '13800138000',
            verified: true
          }
        }
      })
      
      await wrapper.vm.verifyCode()
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/auth/verify-code'),
        method: 'POST',
        data: {
          phone: '13800138000',
          code: '123456'
        }
      })
      
      expect(wrapper.emitted()['verify-success']).toBeTruthy()
      expect(wrapper.emitted()['verify-success'][0][0]).toMatchObject({
        userId: '12345',
        name: '张三'
      })
    })
    
    it('should handle wrong verification code', async () => {
      wrapper.setData({
        phoneNumber: '13800138000',
        verificationCode: '111111'
      })
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 1001,
          message: '验证码错误'
        }
      })
      
      await wrapper.vm.verifyCode()
      
      expect(wrapper.emitted()['verify-fail']).toBeTruthy()
      expect(wrapper.emitted()['verify-fail'][0][0]).toMatchObject({
        code: 'CODE_ERROR',
        message: '验证码错误'
      })
      
      expect(wrapper.vm.retryCount).toBe(1)
    })
  })
  
  describe('ID card upload', () => {
    it('should handle ID card image selection', async () => {
      wrapper.setData({ currentStep: 3 })
      
      uni.chooseImage.mockResolvedValueOnce({
        tempFilePaths: ['/tmp/idcard-front.jpg']
      })
      
      await wrapper.vm.selectIdCardImage('front')
      
      expect(uni.chooseImage).toHaveBeenCalledWith({
        count: 1,
        sourceType: ['camera', 'album'],
        sizeType: ['compressed']
      })
      
      expect(wrapper.vm.idCardFront).toBe('/tmp/idcard-front.jpg')
    })
    
    it('should upload ID card images', async () => {
      wrapper.setData({
        currentStep: 3,
        idCardFront: '/tmp/front.jpg',
        idCardBack: '/tmp/back.jpg'
      })
      
      uni.uploadFile
        .mockResolvedValueOnce({
          statusCode: 200,
          data: JSON.stringify({ url: 'https://example.com/front.jpg' })
        })
        .mockResolvedValueOnce({
          statusCode: 200,
          data: JSON.stringify({ url: 'https://example.com/back.jpg' })
        })
      
      await wrapper.vm.uploadIdCardImages()
      
      expect(uni.uploadFile).toHaveBeenCalledTimes(2)
      expect(wrapper.vm.uploadedImages).toMatchObject({
        front: 'https://example.com/front.jpg',
        back: 'https://example.com/back.jpg'
      })
    })
    
    it('should skip ID card step when skipIdCard is true', async () => {
      await wrapper.setProps({ skipIdCard: true })
      wrapper.setData({ currentStep: 2 })
      
      await wrapper.vm.nextStep()
      
      // Should complete verification without ID card step
      expect(wrapper.emitted()['verify-success']).toBeTruthy()
    })
  })
  
  describe('Step navigation', () => {
    it('should navigate to next step', async () => {
      wrapper.setData({ phoneNumber: '13800138000' })
      
      await wrapper.vm.nextStep()
      
      expect(wrapper.vm.currentStep).toBe(2)
      expect(wrapper.emitted()['step-change']).toBeTruthy()
      expect(wrapper.emitted()['step-change'][0][0]).toBe(2)
    })
    
    it('should navigate to previous step', async () => {
      wrapper.setData({ currentStep: 2 })
      
      await wrapper.vm.previousStep()
      
      expect(wrapper.vm.currentStep).toBe(1)
      expect(wrapper.emitted()['step-change'][0][0]).toBe(1)
    })
    
    it('should not go below step 1', async () => {
      wrapper.setData({ currentStep: 1 })
      
      await wrapper.vm.previousStep()
      
      expect(wrapper.vm.currentStep).toBe(1)
    })
  })
  
  describe('Retry mechanism', () => {
    it('should track retry attempts', async () => {
      wrapper.setData({
        phoneNumber: '13800138000',
        verificationCode: '111111'
      })
      
      // Mock failed verification
      uni.request.mockResolvedValue({
        statusCode: 200,
        data: { code: 1001, message: '验证码错误' }
      })
      
      // Try 3 times
      await wrapper.vm.verifyCode()
      await wrapper.vm.verifyCode()
      await wrapper.vm.verifyCode()
      
      expect(wrapper.vm.retryCount).toBe(3)
      expect(wrapper.emitted().retry).toHaveLength(3)
      expect(wrapper.emitted().retry[2][0]).toBe(3)
    })
    
    it('should block after max retries', async () => {
      wrapper.setData({ retryCount: 3 })
      await wrapper.setProps({ maxRetry: 3 })
      
      await wrapper.vm.verifyCode()
      
      expect(uni.showModal).toHaveBeenCalledWith({
        title: '验证失败',
        content: '验证失败次数过多，请稍后再试',
        showCancel: false
      })
    })
  })
  
  describe('Error handling', () => {
    it('should emit specific error codes', async () => {
      const testCases = [
        { apiCode: 1001, expectedCode: 'CODE_ERROR' },
        { apiCode: 1002, expectedCode: 'CODE_EXPIRED' },
        { apiCode: 1003, expectedCode: 'PHONE_INVALID' },
        { apiCode: 1004, expectedCode: 'ID_CARD_INVALID' }
      ]
      
      for (const testCase of testCases) {
        wrapper.setData({ phoneNumber: '13800138000', verificationCode: '123456' })
        
        uni.request.mockResolvedValueOnce({
          statusCode: 200,
          data: {
            code: testCase.apiCode,
            message: 'Error'
          }
        })
        
        await wrapper.vm.verifyCode()
        
        const emitted = wrapper.emitted()['verify-fail']
        const lastEmit = emitted[emitted.length - 1][0]
        expect(lastEmit.code).toBe(testCase.expectedCode)
      }
    })
  })
  
  describe('Component reset', () => {
    it('should reset all data', async () => {
      // Set some data
      wrapper.setData({
        currentStep: 3,
        phoneNumber: '13800138000',
        verificationCode: '123456',
        retryCount: 2,
        countdown: 30
      })
      
      await wrapper.vm.reset()
      
      expect(wrapper.vm.currentStep).toBe(1)
      expect(wrapper.vm.phoneNumber).toBe('')
      expect(wrapper.vm.verificationCode).toBe('')
      expect(wrapper.vm.retryCount).toBe(0)
      expect(wrapper.vm.countdown).toBe(0)
    })
  })
  
  describe('Slots', () => {
    it('should render header slot', () => {
      wrapper = shallowMount(IdentityVerify, {
        localVue,
        store,
        slots: {
          header: '<div class="custom-header">Custom Header</div>'
        }
      })
      
      expect(wrapper.find('.custom-header').exists()).toBe(true)
    })
    
    it('should render footer slot', () => {
      wrapper = shallowMount(IdentityVerify, {
        localVue,
        store,
        slots: {
          footer: '<div class="custom-footer">Custom Footer</div>'
        }
      })
      
      expect(wrapper.find('.custom-footer').exists()).toBe(true)
    })
    
    it('should render tips slot', () => {
      wrapper = shallowMount(IdentityVerify, {
        localVue,
        store,
        slots: {
          tips: '<div class="custom-tips">Custom Tips</div>'
        }
      })
      
      expect(wrapper.find('.custom-tips').exists()).toBe(true)
    })
  })
})