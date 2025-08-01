import Analytics from '@/utils/analytics'

describe('Analytics Utility', () => {
  let analytics
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
    
    // Clear localStorage simulation
    uni.getStorageSync.mockReturnValue(null)
    
    // Create new analytics instance
    analytics = new Analytics()
  })
  
  describe('trackEvent', () => {
    it('should track a basic event', () => {
      analytics.trackEvent('button_click', {
        buttonId: 'submit',
        page: 'home'
      })
      
      const events = analytics.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({
        eventName: 'button_click',
        eventData: {
          buttonId: 'submit',
          page: 'home'
        },
        timestamp: expect.any(Number),
        sessionId: expect.any(String)
      })
    })
    
    it('should generate session ID if not exists', () => {
      analytics.trackEvent('test_event', {})
      
      const events = analytics.getEvents()
      expect(events[0].sessionId).toBeTruthy()
      expect(uni.setStorageSync).toHaveBeenCalledWith(
        'analytics_session_id',
        expect.any(String)
      )
    })
    
    it('should use existing session ID', () => {
      const existingSessionId = 'existing-session-123'
      uni.getStorageSync.mockReturnValueOnce(existingSessionId)
      
      analytics = new Analytics()
      analytics.trackEvent('test_event', {})
      
      const events = analytics.getEvents()
      expect(events[0].sessionId).toBe(existingSessionId)
    })
    
    it('should persist events to storage', () => {
      analytics.trackEvent('event1', { data: 1 })
      analytics.trackEvent('event2', { data: 2 })
      
      expect(uni.setStorageSync).toHaveBeenCalledWith(
        'analytics_events',
        expect.any(String)
      )
      
      const savedData = JSON.parse(
        uni.setStorageSync.mock.calls.find(
          call => call[0] === 'analytics_events'
        )[1]
      )
      
      expect(savedData).toHaveLength(2)
    })
    
    it('should limit events to maxEvents', () => {
      // Track more than maxEvents (default 100)
      for (let i = 0; i < 150; i++) {
        analytics.trackEvent('test_event', { index: i })
      }
      
      const events = analytics.getEvents()
      expect(events).toHaveLength(100)
      expect(events[0].eventData.index).toBe(50) // First 50 should be removed
    })
  })
  
  describe('trackAdEvent', () => {
    it('should track ad exposure event', () => {
      const adData = {
        adId: 'ad_001',
        adType: 'banner',
        position: 'home_top'
      }
      
      analytics.trackAdEvent('exposure', adData)
      
      const events = analytics.getEvents()
      expect(events[0]).toMatchObject({
        eventName: 'ad_exposure',
        eventData: {
          ...adData,
          action: 'exposure'
        }
      })
    })
    
    it('should track ad click event', () => {
      const adData = {
        adId: 'ad_002',
        adType: 'popup',
        position: 'home_popup'
      }
      
      analytics.trackAdEvent('click', adData)
      
      const events = analytics.getEvents()
      expect(events[0]).toMatchObject({
        eventName: 'ad_click',
        eventData: {
          ...adData,
          action: 'click'
        }
      })
    })
    
    it('should include additional data', () => {
      const adData = {
        adId: 'ad_003',
        adType: 'carousel',
        position: 'home_carousel',
        customField: 'customValue'
      }
      
      analytics.trackAdEvent('exposure', adData)
      
      const events = analytics.getEvents()
      expect(events[0].eventData).toMatchObject(adData)
    })
  })
  
  describe('trackPageView', () => {
    it('should track page view event', () => {
      analytics.trackPageView('/pages/home/index', {
        referrer: '/pages/user/index',
        params: { id: '123' }
      })
      
      const events = analytics.getEvents()
      expect(events[0]).toMatchObject({
        eventName: 'page_view',
        eventData: {
          page: '/pages/home/index',
          referrer: '/pages/user/index',
          params: { id: '123' }
        }
      })
    })
    
    it('should track page duration', () => {
      jest.useFakeTimers()
      
      // Start page view
      analytics.trackPageView('/pages/home/index')
      
      // Advance time by 5 seconds
      jest.advanceTimersByTime(5000)
      
      // Track new page view (which ends previous)
      analytics.trackPageView('/pages/user/index')
      
      const events = analytics.getEvents()
      expect(events[0].eventData.duration).toBeUndefined()
      expect(events[1].eventData.duration).toBe(5000)
      
      jest.useRealTimers()
    })
  })
  
  describe('getStatistics', () => {
    beforeEach(() => {
      // Add some test events
      analytics.trackEvent('button_click', { buttonId: 'btn1' })
      analytics.trackEvent('button_click', { buttonId: 'btn2' })
      analytics.trackEvent('page_view', { page: '/home' })
      analytics.trackAdEvent('exposure', { adId: 'ad1' })
      analytics.trackAdEvent('click', { adId: 'ad1' })
    })
    
    it('should return overall statistics', () => {
      const stats = analytics.getStatistics()
      
      expect(stats).toMatchObject({
        totalEvents: 5,
        eventCounts: {
          button_click: 2,
          page_view: 1,
          ad_exposure: 1,
          ad_click: 1
        },
        sessionCount: 1,
        dateRange: {
          start: expect.any(Date),
          end: expect.any(Date)
        }
      })
    })
    
    it('should calculate ad statistics', () => {
      const stats = analytics.getStatistics('ad')
      
      expect(stats).toMatchObject({
        totalExposures: 1,
        totalClicks: 1,
        clickThroughRate: 100, // 1 click / 1 exposure * 100
        adPerformance: expect.any(Object)
      })
    })
    
    it('should filter by date range', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      // Add an old event
      const events = analytics.getEvents()
      events.push({
        eventName: 'old_event',
        eventData: {},
        timestamp: yesterday.getTime() - 1000,
        sessionId: 'old-session'
      })
      
      const stats = analytics.getStatistics('all', {
        startDate: now,
        endDate: tomorrow
      })
      
      expect(stats.totalEvents).toBe(5) // Should not include old event
    })
  })
  
  describe('exportData', () => {
    beforeEach(() => {
      analytics.trackEvent('test_event', { data: 'test' })
      analytics.trackAdEvent('exposure', { adId: 'ad1' })
    })
    
    it('should export data in JSON format', () => {
      const exported = analytics.exportData('json')
      const data = JSON.parse(exported)
      
      expect(data).toHaveProperty('events')
      expect(data).toHaveProperty('statistics')
      expect(data).toHaveProperty('exportDate')
      expect(data.events).toHaveLength(2)
    })
    
    it('should export data in CSV format', () => {
      const exported = analytics.exportData('csv')
      
      expect(exported).toContain('eventName,timestamp,sessionId')
      expect(exported).toContain('test_event')
      expect(exported).toContain('ad_exposure')
    })
    
    it('should handle export with date filter', () => {
      const future = new Date(Date.now() + 86400000)
      const exported = analytics.exportData('json', {
        startDate: future
      })
      
      const data = JSON.parse(exported)
      expect(data.events).toHaveLength(0)
    })
  })
  
  describe('clearData', () => {
    it('should clear all analytics data', () => {
      analytics.trackEvent('test1', {})
      analytics.trackEvent('test2', {})
      
      expect(analytics.getEvents()).toHaveLength(2)
      
      analytics.clearData()
      
      expect(analytics.getEvents()).toHaveLength(0)
      expect(uni.removeStorageSync).toHaveBeenCalledWith('analytics_events')
    })
    
    it('should clear data before specific date', () => {
      jest.useFakeTimers()
      const baseTime = Date.now()
      jest.setSystemTime(baseTime)
      
      // Add events at different times
      analytics.trackEvent('event1', {})
      
      jest.advanceTimersByTime(60000) // 1 minute later
      analytics.trackEvent('event2', {})
      
      jest.advanceTimersByTime(60000) // 2 minutes later
      analytics.trackEvent('event3', {})
      
      // Clear data older than 1.5 minutes
      const cutoffTime = baseTime + 90000
      analytics.clearData(new Date(cutoffTime))
      
      const events = analytics.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventName).toBe('event3')
      
      jest.useRealTimers()
    })
  })
  
  describe('uploadEvents', () => {
    it('should upload events to server', async () => {
      analytics.trackEvent('test1', {})
      analytics.trackEvent('test2', {})
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: { success: true }
      })
      
      const result = await analytics.uploadEvents()
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/analytics/upload'),
        method: 'POST',
        data: {
          events: expect.any(Array),
          sessionId: expect.any(String),
          deviceInfo: expect.any(Object)
        }
      })
      
      expect(result.success).toBe(true)
      expect(analytics.getEvents()).toHaveLength(0) // Should clear after upload
    })
    
    it('should handle upload failure', async () => {
      analytics.trackEvent('test1', {})
      
      uni.request.mockRejectedValueOnce(new Error('Network error'))
      
      await expect(analytics.uploadEvents()).rejects.toThrow('Network error')
      expect(analytics.getEvents()).toHaveLength(1) // Should not clear on failure
    })
    
    it('should batch upload large number of events', async () => {
      // Add 150 events
      for (let i = 0; i < 150; i++) {
        analytics.trackEvent('test', { index: i })
      }
      
      uni.request.mockResolvedValue({
        statusCode: 200,
        data: { success: true }
      })
      
      await analytics.uploadEvents()
      
      // Should make 2 requests (100 + 50)
      expect(uni.request).toHaveBeenCalledTimes(2)
    })
  })
})