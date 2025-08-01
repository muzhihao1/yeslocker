import WxCharts from '@/utils/wx-charts'

describe('WxCharts', () => {
  let mockContext
  let chart
  
  beforeEach(() => {
    // Mock canvas context
    mockContext = {
      setFillStyle: jest.fn(),
      setStrokeStyle: jest.fn(),
      setLineWidth: jest.fn(),
      setFontSize: jest.fn(),
      setTextAlign: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      draw: jest.fn(),
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn()
    }
    
    // Mock uni.createCanvasContext
    uni.createCanvasContext.mockReturnValue(mockContext)
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('Chart initialization', () => {
    it('should create chart with default options', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['A', 'B', 'C'],
        series: [{
          name: 'Series 1',
          data: [10, 20, 30]
        }]
      })
      
      expect(uni.createCanvasContext).toHaveBeenCalledWith('testCanvas')
      expect(chart.width).toBe(300)
      expect(chart.height).toBe(200)
      expect(chart.type).toBe('column')
    })
    
    it('should accept custom dimensions', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'line',
        width: 400,
        height: 300,
        categories: ['A', 'B'],
        series: [{ data: [1, 2] }]
      })
      
      expect(chart.width).toBe(400)
      expect(chart.height).toBe(300)
    })
    
    it('should use custom colors', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff']
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'pie',
        colors: customColors,
        categories: ['A', 'B', 'C'],
        series: [{ data: [1, 2, 3] }]
      })
      
      expect(chart.colors).toEqual(customColors)
    })
  })
  
  describe('Data range calculation', () => {
    it('should calculate data range correctly', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['A', 'B', 'C'],
        series: [{
          data: [5, 15, 10]
        }, {
          data: [8, 12, 20]
        }]
      })
      
      expect(chart.dataRange.min).toBe(0) // Should optimize to 0
      expect(chart.dataRange.max).toBe(20)
    })
    
    it('should handle negative values', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'line',
        categories: ['A', 'B', 'C'],
        series: [{
          data: [-10, 5, -5]
        }]
      })
      
      expect(chart.dataRange.min).toBeLessThanOrEqual(-10)
      expect(chart.dataRange.max).toBeGreaterThanOrEqual(5)
    })
  })
  
  describe('Column chart', () => {
    beforeEach(() => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['Jan', 'Feb', 'Mar'],
        series: [{
          name: 'Sales',
          data: [100, 150, 120],
          color: '#1890ff'
        }]
      })
    })
    
    it('should draw column chart correctly', () => {
      // Check that bars are drawn
      expect(mockContext.fillRect).toHaveBeenCalled()
      
      // Check that axes are drawn
      expect(mockContext.beginPath).toHaveBeenCalled()
      expect(mockContext.moveTo).toHaveBeenCalled()
      expect(mockContext.lineTo).toHaveBeenCalled()
      expect(mockContext.stroke).toHaveBeenCalled()
      
      // Check that labels are drawn
      expect(mockContext.fillText).toHaveBeenCalled()
      
      // Check that canvas is rendered
      expect(mockContext.draw).toHaveBeenCalled()
    })
    
    it('should draw data labels when enabled', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['A', 'B'],
        series: [{ data: [10, 20] }],
        dataLabel: true
      })
      
      // Should draw value labels on top of bars
      expect(mockContext.fillText).toHaveBeenCalledWith('10', expect.any(Number), expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('20', expect.any(Number), expect.any(Number))
    })
    
    it('should handle multiple series', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['Q1', 'Q2'],
        series: [{
          name: 'Product A',
          data: [100, 120]
        }, {
          name: 'Product B',
          data: [80, 90]
        }]
      })
      
      // Should draw bars for both series
      const fillRectCalls = mockContext.fillRect.mock.calls.length
      expect(fillRectCalls).toBeGreaterThanOrEqual(4) // At least 2 bars per series
    })
  })
  
  describe('Line chart', () => {
    beforeEach(() => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'line',
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        series: [{
          name: 'Temperature',
          data: [20, 22, 19, 24, 25],
          color: '#ff4d4f'
        }],
        dataPointShape: true
      })
    })
    
    it('should draw line chart correctly', () => {
      // Check that line path is created
      expect(mockContext.beginPath).toHaveBeenCalled()
      expect(mockContext.moveTo).toHaveBeenCalled()
      expect(mockContext.lineTo).toHaveBeenCalled()
      
      // Check that data points are drawn
      expect(mockContext.arc).toHaveBeenCalled()
    })
    
    it('should not draw data points when disabled', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'line',
        categories: ['A', 'B'],
        series: [{ data: [1, 2] }],
        dataPointShape: false
      })
      
      expect(mockContext.arc).not.toHaveBeenCalled()
    })
  })
  
  describe('Pie chart', () => {
    beforeEach(() => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'pie',
        categories: ['Chrome', 'Firefox', 'Safari', 'Edge'],
        series: [{
          data: [45, 25, 20, 10]
        }]
      })
    })
    
    it('should draw pie chart correctly', () => {
      // Check that pie slices are drawn
      expect(mockContext.arc).toHaveBeenCalled()
      expect(mockContext.moveTo).toHaveBeenCalled()
      expect(mockContext.closePath).toHaveBeenCalled()
      expect(mockContext.fill).toHaveBeenCalled()
    })
    
    it('should calculate percentages correctly', () => {
      // Check that percentage labels are drawn
      expect(mockContext.fillText).toHaveBeenCalledWith('45.0%', expect.any(Number), expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('25.0%', expect.any(Number), expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('20.0%', expect.any(Number), expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('10.0%', expect.any(Number), expect.any(Number))
    })
    
    it('should draw legend for pie chart', () => {
      // Check that legend items are drawn
      expect(mockContext.fillText).toHaveBeenCalledWith('Chrome', expect.any(Number), expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('Firefox', expect.any(Number), expect.any(Number))
    })
  })
  
  describe('Bar chart (horizontal)', () => {
    it('should draw horizontal bar chart', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'bar',
        categories: ['Category A', 'Category B', 'Category C'],
        series: [{
          name: 'Values',
          data: [30, 50, 20]
        }]
      })
      
      // Should draw horizontal bars
      expect(mockContext.fillRect).toHaveBeenCalled()
      
      // Bars should be drawn horizontally
      const fillRectCalls = mockContext.fillRect.mock.calls
      fillRectCalls.forEach(call => {
        const [x, y, width, height] = call
        expect(width).toBeGreaterThan(height) // Horizontal bars
      })
    })
  })
  
  describe('Chart features', () => {
    it('should draw grid lines', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['A', 'B'],
        series: [{ data: [10, 20] }]
      })
      
      // Check that grid lines are drawn
      const strokeCalls = mockContext.stroke.mock.calls.length
      expect(strokeCalls).toBeGreaterThan(2) // Multiple grid lines
    })
    
    it('should draw axis labels', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['Category 1', 'Category 2'],
        series: [{ data: [10, 20] }],
        yAxis: {
          title: 'Y Axis Title'
        }
      })
      
      // Check Y axis title is drawn
      expect(mockContext.fillText).toHaveBeenCalledWith('Y Axis Title', expect.any(Number), expect.any(Number))
      
      // Check category labels are drawn
      expect(mockContext.fillText).toHaveBeenCalledWith('Category 1', expect.any(Number), expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('Category 2', expect.any(Number), expect.any(Number))
    })
    
    it('should draw legend for multiple series', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'line',
        categories: ['A', 'B'],
        series: [{
          name: 'Series 1',
          data: [1, 2]
        }, {
          name: 'Series 2',
          data: [3, 4]
        }]
      })
      
      // Check legend is drawn
      expect(mockContext.fillText).toHaveBeenCalledWith('Series 1', expect.any(Number), expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('Series 2', expect.any(Number), expect.any(Number))
    })
  })
  
  describe('Interactive features', () => {
    it('should show tooltip on touch', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['A', 'B', 'C'],
        series: [{
          name: 'Values',
          data: [10, 20, 30]
        }]
      })
      
      const touchEvent = {
        touches: [{
          x: 150, // Middle of canvas
          y: 100
        }]
      }
      
      chart.showToolTip(touchEvent)
      
      // Should draw tooltip
      expect(mockContext.fillRect).toHaveBeenCalled() // Tooltip background
      expect(mockContext.fillText).toHaveBeenCalledWith('B', expect.any(Number), expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('Values: 20', expect.any(Number), expect.any(Number))
      expect(mockContext.draw).toHaveBeenCalledWith(true) // Preserve previous drawing
    })
  })
  
  describe('Update data', () => {
    it('should update chart data and redraw', () => {
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'column',
        categories: ['A', 'B'],
        series: [{ data: [10, 20] }]
      })
      
      // Clear mock calls
      jest.clearAllMocks()
      
      // Update data
      chart.updateData({
        categories: ['X', 'Y', 'Z'],
        series: [{ data: [5, 15, 25] }]
      })
      
      // Should clear and redraw
      expect(mockContext.clearRect).toHaveBeenCalled()
      expect(mockContext.draw).toHaveBeenCalled()
      
      // Check new data is used
      expect(chart.categories).toEqual(['X', 'Y', 'Z'])
      expect(chart.series[0].data).toEqual([5, 15, 25])
    })
  })
  
  describe('Error handling', () => {
    it('should handle empty data gracefully', () => {
      expect(() => {
        new WxCharts({
          canvasId: 'testCanvas',
          type: 'column',
          categories: [],
          series: []
        })
      }).not.toThrow()
    })
    
    it('should handle invalid chart type', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()
      
      chart = new WxCharts({
        canvasId: 'testCanvas',
        type: 'invalid',
        categories: ['A'],
        series: [{ data: [1] }]
      })
      
      expect(consoleWarn).toHaveBeenCalledWith('Unsupported chart type:', 'invalid')
      consoleWarn.mockRestore()
    })
  })
})