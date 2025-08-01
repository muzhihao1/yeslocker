import { shallowMount } from '@vue/test-utils'
import UserCard from '@/components/atoms/UserCard.vue'

describe('UserCard.vue', () => {
  let wrapper
  
  const defaultUserData = {
    name: '张三',
    phone: '13800138000',
    avatar: '/static/avatar.png',
    verified: true
  }
  
  beforeEach(() => {
    wrapper = shallowMount(UserCard, {
      propsData: {
        userData: defaultUserData
      }
    })
  })
  
  afterEach(() => {
    wrapper.destroy()
  })
  
  describe('Props', () => {
    it('should render user data correctly', () => {
      expect(wrapper.find('.user-name').text()).toBe('张三')
      expect(wrapper.find('.user-phone').text()).toBe('138****8000')
      expect(wrapper.find('.user-avatar').attributes('src')).toBe('/static/avatar.png')
    })
    
    it('should show verified badge when user is verified', () => {
      expect(wrapper.find('.verified-badge').exists()).toBe(true)
    })
    
    it('should hide verified badge when user is not verified', async () => {
      await wrapper.setProps({
        userData: { ...defaultUserData, verified: false }
      })
      expect(wrapper.find('.verified-badge').exists()).toBe(false)
    })
    
    it('should handle missing phone number', async () => {
      await wrapper.setProps({
        userData: { name: '李四', avatar: '/avatar.png' }
      })
      expect(wrapper.find('.user-phone').exists()).toBe(false)
    })
    
    it('should use default avatar when not provided', async () => {
      await wrapper.setProps({
        userData: { name: '王五' }
      })
      expect(wrapper.find('.user-avatar').attributes('src')).toBe('/static/default-avatar.png')
    })
    
    it('should apply different sizes', async () => {
      await wrapper.setProps({ size: 'small' })
      expect(wrapper.find('.user-card').classes()).toContain('size-small')
      
      await wrapper.setProps({ size: 'large' })
      expect(wrapper.find('.user-card').classes()).toContain('size-large')
    })
    
    it('should hide phone when showPhone is false', async () => {
      await wrapper.setProps({ showPhone: false })
      expect(wrapper.find('.user-phone').exists()).toBe(false)
    })
    
    it('should disable click when clickable is false', async () => {
      await wrapper.setProps({ clickable: false })
      expect(wrapper.find('.user-card').classes()).toContain('not-clickable')
    })
  })
  
  describe('Phone formatting', () => {
    it('should format phone number correctly', () => {
      expect(wrapper.vm.formatPhone('13800138000')).toBe('138****8000')
    })
    
    it('should handle invalid phone numbers', () => {
      expect(wrapper.vm.formatPhone('1234')).toBe('1234')
      expect(wrapper.vm.formatPhone(null)).toBe('')
      expect(wrapper.vm.formatPhone(undefined)).toBe('')
    })
    
    it('should display formatted phone', async () => {
      await wrapper.setProps({
        userData: { ...defaultUserData, phone: '15900009999' }
      })
      expect(wrapper.find('.user-phone').text()).toBe('159****9999')
    })
  })
  
  describe('Events', () => {
    it('should emit click event with user data', async () => {
      await wrapper.find('.user-card').trigger('click')
      
      expect(wrapper.emitted().click).toBeTruthy()
      expect(wrapper.emitted().click[0][0]).toEqual(defaultUserData)
    })
    
    it('should emit avatar-click event', async () => {
      await wrapper.find('.user-avatar').trigger('click')
      
      expect(wrapper.emitted()['avatar-click']).toBeTruthy()
      expect(wrapper.emitted()['avatar-click'][0][0]).toEqual(defaultUserData)
    })
    
    it('should not emit events when not clickable', async () => {
      await wrapper.setProps({ clickable: false })
      await wrapper.find('.user-card').trigger('click')
      
      expect(wrapper.emitted().click).toBeFalsy()
    })
    
    it('should stop propagation on avatar click', async () => {
      const stopPropagation = jest.fn()
      await wrapper.find('.user-avatar').trigger('click', {
        stopPropagation
      })
      
      expect(stopPropagation).toHaveBeenCalled()
    })
  })
  
  describe('Slots', () => {
    it('should render default slot content', () => {
      wrapper = shallowMount(UserCard, {
        propsData: { userData: defaultUserData },
        slots: {
          default: '<div class="custom-content">Custom Content</div>'
        }
      })
      
      expect(wrapper.find('.custom-content').text()).toBe('Custom Content')
    })
    
    it('should render badge slot', () => {
      wrapper = shallowMount(UserCard, {
        propsData: { userData: defaultUserData },
        slots: {
          badge: '<div class="custom-badge">VIP</div>'
        }
      })
      
      expect(wrapper.find('.custom-badge').text()).toBe('VIP')
    })
  })
  
  describe('Computed properties', () => {
    it('should compute display name correctly', () => {
      expect(wrapper.vm.displayName).toBe('张三')
      
      wrapper.setProps({
        userData: { phone: '13800138000' }
      })
      expect(wrapper.vm.displayName).toBe('未知用户')
    })
    
    it('should compute avatar URL with default', () => {
      expect(wrapper.vm.avatarUrl).toBe('/static/avatar.png')
      
      wrapper.setProps({
        userData: { name: '测试' }
      })
      expect(wrapper.vm.avatarUrl).toBe('/static/default-avatar.png')
    })
  })
  
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const card = wrapper.find('.user-card')
      expect(card.attributes('role')).toBe('button')
      expect(card.attributes('aria-label')).toContain('张三')
    })
    
    it('should have alt text for avatar', () => {
      expect(wrapper.find('.user-avatar').attributes('alt')).toBe('张三的头像')
    })
  })
  
  describe('Error handling', () => {
    it('should handle missing userData gracefully', () => {
      wrapper = shallowMount(UserCard, {
        propsData: { userData: null }
      })
      
      expect(wrapper.find('.user-name').text()).toBe('未知用户')
      expect(wrapper.find('.user-avatar').attributes('src')).toBe('/static/default-avatar.png')
    })
    
    it('should handle avatar load error', async () => {
      const errorHandler = jest.fn()
      wrapper.vm.$on('avatar-error', errorHandler)
      
      await wrapper.find('.user-avatar').trigger('error')
      
      expect(wrapper.find('.user-avatar').attributes('src')).toBe('/static/default-avatar.png')
    })
  })
})