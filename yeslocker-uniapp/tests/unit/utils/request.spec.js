import request from '@/utils/request'

describe('Request Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Reset storage
    uni.getStorageSync.mockImplementation((key) => {
      if (key === 'token') return 'test-token-123'
      return null
    })
  })
  
  describe('request function', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: { id: 1, name: 'Test' }
        }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      const result = await request({
        url: '/api/test',
        method: 'GET'
      })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/test'),
        method: 'GET',
        header: expect.objectContaining({
          'Authorization': 'Bearer test-token-123'
        })
      })
      
      expect(result).toEqual(mockResponse.data.data)
    })
    
    it('should make a successful POST request with data', async () => {
      const postData = { name: 'Test Item', value: 123 }
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: { id: 1, ...postData }
        }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      const result = await request({
        url: '/api/items',
        method: 'POST',
        data: postData
      })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/items'),
        method: 'POST',
        data: postData,
        header: expect.objectContaining({
          'Authorization': 'Bearer test-token-123',
          'Content-Type': 'application/json'
        })
      })
      
      expect(result).toEqual(mockResponse.data.data)
    })
    
    it('should handle business error codes', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 1001,
          message: '参数错误',
          data: null
        }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await expect(request({
        url: '/api/test',
        method: 'GET'
      })).rejects.toThrow('参数错误')
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '参数错误',
        icon: 'none'
      })
    })
    
    it('should handle HTTP errors', async () => {
      const mockResponse = {
        statusCode: 500,
        errMsg: 'request:fail'
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await expect(request({
        url: '/api/test',
        method: 'GET'
      })).rejects.toThrow('服务器错误')
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '服务器错误',
        icon: 'none'
      })
    })
    
    it('should handle network errors', async () => {
      uni.request.mockRejectedValueOnce(new Error('Network Error'))
      
      await expect(request({
        url: '/api/test',
        method: 'GET'
      })).rejects.toThrow('网络连接失败')
      
      expect(uni.showToast).toHaveBeenCalledWith({
        title: '网络连接失败',
        icon: 'none'
      })
    })
    
    it('should handle token expiry (401)', async () => {
      const mockResponse = {
        statusCode: 401,
        data: {
          code: 401,
          message: 'Unauthorized'
        }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await expect(request({
        url: '/api/test',
        method: 'GET'
      })).rejects.toThrow('请重新登录')
      
      expect(uni.removeStorageSync).toHaveBeenCalledWith('token')
      expect(uni.removeStorageSync).toHaveBeenCalledWith('userInfo')
      expect(uni.reLaunch).toHaveBeenCalledWith({
        url: '/pages/home/index'
      })
    })
    
    it('should not add token header for auth endpoints', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: { token: 'new-token' }
        }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await request({
        url: '/api/auth/login',
        method: 'POST',
        data: { username: 'test', password: 'test' }
      })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/auth/login'),
        method: 'POST',
        data: { username: 'test', password: 'test' },
        header: expect.not.objectContaining({
          'Authorization': expect.any(String)
        })
      })
    })
    
    it('should support custom headers', async () => {
      const mockResponse = {
        statusCode: 200,
        data: { code: 0, message: 'success', data: {} }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await request({
        url: '/api/test',
        method: 'GET',
        header: {
          'X-Custom-Header': 'custom-value'
        }
      })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.any(String),
        method: 'GET',
        header: expect.objectContaining({
          'X-Custom-Header': 'custom-value'
        })
      })
    })
    
    it('should handle timeout', async () => {
      uni.request.mockImplementationOnce(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('timeout')), 100)
        })
      })
      
      await expect(request({
        url: '/api/test',
        method: 'GET',
        timeout: 50
      })).rejects.toThrow('请求超时')
    })
  })
  
  describe('request interceptors', () => {
    it('should show loading when specified', async () => {
      const mockResponse = {
        statusCode: 200,
        data: { code: 0, message: 'success', data: {} }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await request({
        url: '/api/test',
        method: 'GET',
        loading: true,
        loadingText: '加载中...'
      })
      
      expect(uni.showLoading).toHaveBeenCalledWith({
        title: '加载中...',
        mask: true
      })
      expect(uni.hideLoading).toHaveBeenCalled()
    })
    
    it('should not show default error toast when silent', async () => {
      const mockResponse = {
        statusCode: 500,
        data: { code: 500, message: 'Server Error' }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await expect(request({
        url: '/api/test',
        method: 'GET',
        silent: true
      })).rejects.toThrow()
      
      expect(uni.showToast).not.toHaveBeenCalled()
    })
  })
  
  describe('URL handling', () => {
    it('should handle absolute URLs', async () => {
      const mockResponse = {
        statusCode: 200,
        data: { code: 0, message: 'success', data: {} }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await request({
        url: 'https://api.example.com/test',
        method: 'GET'
      })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: 'https://api.example.com/test',
        method: 'GET',
        header: expect.any(Object)
      })
    })
    
    it('should append query parameters correctly', async () => {
      const mockResponse = {
        statusCode: 200,
        data: { code: 0, message: 'success', data: {} }
      }
      
      uni.request.mockResolvedValueOnce(mockResponse)
      
      await request({
        url: '/api/test',
        method: 'GET',
        data: { page: 1, size: 10 }
      })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringMatching(/\/api\/test\?page=1&size=10$/),
        method: 'GET',
        header: expect.any(Object)
      })
    })
  })
})