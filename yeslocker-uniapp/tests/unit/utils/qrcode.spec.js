import QRCode from '@/utils/qrcode'

describe('QRCode Utility', () => {
  let qrcode
  
  beforeEach(() => {
    jest.clearAllMocks()
    qrcode = new QRCode()
  })
  
  describe('QR Code Generation', () => {
    it('should generate QR code for text', () => {
      const text = 'YS2024012012345'
      const result = qrcode.generate(text)
      
      expect(result).toMatchObject({
        data: expect.any(String),
        width: 200,
        height: 200,
        type: 'base64'
      })
      
      expect(result.data).toMatch(/^data:image\/png;base64,/)
    })
    
    it('should generate QR code with custom size', () => {
      const text = 'Test QR Code'
      const result = qrcode.generate(text, {
        width: 300,
        height: 300
      })
      
      expect(result.width).toBe(300)
      expect(result.height).toBe(300)
    })
    
    it('should generate QR code with custom error correction level', () => {
      const text = 'Test'
      const levels = ['L', 'M', 'Q', 'H']
      
      levels.forEach(level => {
        const result = qrcode.generate(text, {
          errorCorrectionLevel: level
        })
        
        expect(result.errorCorrectionLevel).toBe(level)
      })
    })
    
    it('should generate QR code with custom colors', () => {
      const text = 'Custom Colors'
      const result = qrcode.generate(text, {
        foregroundColor: '#FF0000',
        backgroundColor: '#FFFFFF'
      })
      
      expect(result.foregroundColor).toBe('#FF0000')
      expect(result.backgroundColor).toBe('#FFFFFF')
    })
    
    it('should handle empty text', () => {
      expect(() => qrcode.generate('')).toThrow('Text cannot be empty')
    })
    
    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000)
      const result = qrcode.generate(longText)
      
      expect(result).toBeTruthy()
      expect(result.data).toBeTruthy()
    })
    
    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const result = qrcode.generate(specialText)
      
      expect(result).toBeTruthy()
      expect(result.data).toMatch(/^data:image\/png;base64,/)
    })
    
    it('should handle Unicode characters', () => {
      const unicodeText = '你好世界 Hello World 🌍'
      const result = qrcode.generate(unicodeText)
      
      expect(result).toBeTruthy()
      expect(result.data).toBeTruthy()
    })
  })
  
  describe('QR Code Formats', () => {
    it('should generate base64 format by default', () => {
      const result = qrcode.generate('test')
      
      expect(result.type).toBe('base64')
      expect(result.data).toMatch(/^data:image\/png;base64,/)
    })
    
    it('should generate canvas format', () => {
      const mockCanvas = {
        width: 200,
        height: 200,
        getContext: jest.fn(() => ({
          fillStyle: '',
          fillRect: jest.fn(),
          clearRect: jest.fn()
        }))
      }
      
      uni.createCanvasContext.mockReturnValue(mockCanvas)
      
      const result = qrcode.generate('test', {
        format: 'canvas',
        canvasId: 'qrCanvas'
      })
      
      expect(result.type).toBe('canvas')
      expect(result.canvasId).toBe('qrCanvas')
      expect(uni.createCanvasContext).toHaveBeenCalledWith('qrCanvas')
    })
    
    it('should generate SVG format', () => {
      const result = qrcode.generate('test', {
        format: 'svg'
      })
      
      expect(result.type).toBe('svg')
      expect(result.data).toMatch(/^<svg/)
      expect(result.data).toContain('</svg>')
    })
    
    it('should generate binary data', () => {
      const result = qrcode.generate('test', {
        format: 'binary'
      })
      
      expect(result.type).toBe('binary')
      expect(result.data).toBeInstanceOf(Uint8Array)
    })
  })
  
  describe('QR Code with Logo', () => {
    it('should add logo to QR code', async () => {
      const logoUrl = '/static/logo.png'
      
      // Mock image info
      uni.getImageInfo.mockResolvedValueOnce({
        width: 100,
        height: 100,
        path: logoUrl
      })
      
      const result = await qrcode.generateWithLogo('test', {
        logo: logoUrl,
        logoSize: 40
      })
      
      expect(uni.getImageInfo).toHaveBeenCalledWith({
        src: logoUrl
      })
      
      expect(result.hasLogo).toBe(true)
      expect(result.logoSize).toBe(40)
    })
    
    it('should handle logo load failure', async () => {
      uni.getImageInfo.mockRejectedValueOnce(new Error('Image not found'))
      
      const result = await qrcode.generateWithLogo('test', {
        logo: '/invalid/logo.png'
      })
      
      expect(result.hasLogo).toBe(false)
      expect(result.error).toBe('Logo load failed')
    })
    
    it('should validate logo size', async () => {
      uni.getImageInfo.mockResolvedValueOnce({
        width: 100,
        height: 100
      })
      
      await expect(
        qrcode.generateWithLogo('test', {
          logo: '/logo.png',
          logoSize: 150 // Too large
        })
      ).rejects.toThrow('Logo size cannot exceed QR code size')
    })
  })
  
  describe('Batch Generation', () => {
    it('should generate multiple QR codes', async () => {
      const items = [
        { text: 'QR1', id: '1' },
        { text: 'QR2', id: '2' },
        { text: 'QR3', id: '3' }
      ]
      
      const results = await qrcode.generateBatch(items)
      
      expect(results).toHaveLength(3)
      results.forEach((result, index) => {
        expect(result.id).toBe(items[index].id)
        expect(result.data).toMatch(/^data:image\/png;base64,/)
      })
    })
    
    it('should handle batch generation with options', async () => {
      const items = [
        { text: 'QR1', options: { width: 150 } },
        { text: 'QR2', options: { width: 250 } }
      ]
      
      const results = await qrcode.generateBatch(items)
      
      expect(results[0].width).toBe(150)
      expect(results[1].width).toBe(250)
    })
    
    it('should handle errors in batch generation', async () => {
      const items = [
        { text: 'Valid' },
        { text: '' }, // Invalid
        { text: 'Also Valid' }
      ]
      
      const results = await qrcode.generateBatch(items, {
        skipErrors: true
      })
      
      expect(results).toHaveLength(2)
      expect(results[0].error).toBeUndefined()
      expect(results[1].error).toBeUndefined()
    })
  })
  
  describe('QR Code Parsing', () => {
    it('should parse voucher QR code format', () => {
      const qrData = 'YS2024012012345'
      const parsed = qrcode.parseVoucherCode(qrData)
      
      expect(parsed).toMatchObject({
        prefix: 'YS',
        date: '20240120',
        sequence: '12345',
        isValid: true
      })
    })
    
    it('should parse digital code format', () => {
      const qrData = '123456'
      const parsed = qrcode.parseVoucherCode(qrData)
      
      expect(parsed).toMatchObject({
        type: 'digital',
        code: '123456',
        isValid: true
      })
    })
    
    it('should handle invalid QR code format', () => {
      const qrData = 'INVALID'
      const parsed = qrcode.parseVoucherCode(qrData)
      
      expect(parsed.isValid).toBe(false)
      expect(parsed.error).toBe('Invalid voucher code format')
    })
    
    it('should validate QR code checksum', () => {
      const qrData = 'YS2024012012345-A8'
      const parsed = qrcode.parseVoucherCode(qrData)
      
      expect(parsed.hasChecksum).toBe(true)
      expect(parsed.checksumValid).toBe(true)
    })
  })
  
  describe('Canvas Drawing', () => {
    it('should draw QR code on canvas', () => {
      const mockContext = {
        fillStyle: '',
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        drawImage: jest.fn(),
        setFillStyle: jest.fn(),
        draw: jest.fn()
      }
      
      uni.createCanvasContext.mockReturnValue(mockContext)
      
      qrcode.drawToCanvas('test', 'myCanvas', {
        width: 200,
        height: 200
      })
      
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 200, 200)
      expect(mockContext.fillRect).toHaveBeenCalled()
      expect(mockContext.draw).toHaveBeenCalled()
    })
    
    it('should handle canvas drawing with callback', (done) => {
      const mockContext = {
        draw: jest.fn((callback) => {
          callback(true)
        }),
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        setFillStyle: jest.fn()
      }
      
      uni.createCanvasContext.mockReturnValue(mockContext)
      
      qrcode.drawToCanvas('test', 'myCanvas', {}, (success) => {
        expect(success).toBe(true)
        done()
      })
    })
  })
  
  describe('File Saving', () => {
    it('should save QR code to file', async () => {
      uni.canvasToTempFilePath.mockResolvedValueOnce({
        tempFilePath: '/tmp/qrcode.png'
      })
      
      uni.saveImageToPhotosAlbum.mockResolvedValueOnce({
        errMsg: 'saveImageToPhotosAlbum:ok'
      })
      
      const result = await qrcode.saveToFile('test', {
        canvasId: 'qrCanvas'
      })
      
      expect(uni.canvasToTempFilePath).toHaveBeenCalledWith({
        canvasId: 'qrCanvas',
        fileType: 'png',
        quality: 1
      })
      
      expect(uni.saveImageToPhotosAlbum).toHaveBeenCalledWith({
        filePath: '/tmp/qrcode.png'
      })
      
      expect(result.success).toBe(true)
      expect(result.path).toBe('/tmp/qrcode.png')
    })
    
    it('should handle file save failure', async () => {
      uni.canvasToTempFilePath.mockRejectedValueOnce(
        new Error('Canvas not found')
      )
      
      await expect(
        qrcode.saveToFile('test', { canvasId: 'invalid' })
      ).rejects.toThrow('Canvas not found')
    })
    
    it('should handle permission denial', async () => {
      uni.canvasToTempFilePath.mockResolvedValueOnce({
        tempFilePath: '/tmp/qrcode.png'
      })
      
      uni.saveImageToPhotosAlbum.mockRejectedValueOnce({
        errMsg: 'saveImageToPhotosAlbum:fail auth deny'
      })
      
      await expect(
        qrcode.saveToFile('test', { canvasId: 'qrCanvas' })
      ).rejects.toThrow('Permission denied')
    })
  })
  
  describe('Performance', () => {
    it('should cache generated QR codes', () => {
      const text = 'cached-test'
      
      // First generation
      const result1 = qrcode.generate(text)
      
      // Second generation - should use cache
      const result2 = qrcode.generate(text)
      
      expect(result1.data).toBe(result2.data)
      expect(result2.fromCache).toBe(true)
    })
    
    it('should clear cache when needed', () => {
      // Generate some QR codes
      qrcode.generate('test1')
      qrcode.generate('test2')
      qrcode.generate('test3')
      
      expect(qrcode.getCacheSize()).toBe(3)
      
      qrcode.clearCache()
      
      expect(qrcode.getCacheSize()).toBe(0)
    })
    
    it('should limit cache size', () => {
      // Generate many QR codes
      for (let i = 0; i < 150; i++) {
        qrcode.generate(`test${i}`)
      }
      
      // Cache should not exceed limit (e.g., 100)
      expect(qrcode.getCacheSize()).toBeLessThanOrEqual(100)
    })
  })
  
  describe('Error Handling', () => {
    it('should handle invalid options gracefully', () => {
      const result = qrcode.generate('test', {
        width: -100, // Invalid
        height: 'abc', // Invalid
        errorCorrectionLevel: 'Z' // Invalid
      })
      
      // Should use defaults
      expect(result.width).toBe(200)
      expect(result.height).toBe(200)
      expect(result.errorCorrectionLevel).toBe('M')
    })
    
    it('should provide meaningful error messages', () => {
      expect(() => qrcode.generate(null)).toThrow('Text is required')
      expect(() => qrcode.generate(123)).toThrow('Text must be a string')
    })
  })
})