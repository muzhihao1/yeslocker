/**
 * wx-charts - 轻量级 UniApp 图表库
 * 支持柱状图、折线图、饼图等常用图表类型
 */

class WxCharts {
  constructor(opts) {
    this.opts = opts
    this.ctx = uni.createCanvasContext(opts.canvasId)
    this.width = opts.width || 300
    this.height = opts.height || 200
    this.type = opts.type || 'column'
    this.categories = opts.categories || []
    this.series = opts.series || []
    this.dataLabel = opts.dataLabel !== false
    this.animation = opts.animation !== false
    this.colors = opts.colors || ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96']
    
    // 初始化配置
    this.initConfig()
    
    // 绘制图表
    this.draw()
  }
  
  initConfig() {
    // 计算图表区域
    this.chartArea = {
      left: 50,
      top: 30,
      right: this.width - 30,
      bottom: this.height - 50
    }
    
    this.chartWidth = this.chartArea.right - this.chartArea.left
    this.chartHeight = this.chartArea.bottom - this.chartArea.top
    
    // 计算数据范围
    this.calculateDataRange()
  }
  
  calculateDataRange() {
    let min = Infinity
    let max = -Infinity
    
    this.series.forEach(serie => {
      serie.data.forEach(value => {
        min = Math.min(min, value)
        max = Math.max(max, value)
      })
    })
    
    // 优化刻度
    this.dataRange = this.optimizeScale(min, max)
  }
  
  optimizeScale(min, max) {
    const range = max - min
    const step = Math.pow(10, Math.floor(Math.log10(range)))
    
    return {
      min: Math.floor(min / step) * step,
      max: Math.ceil(max / step) * step,
      step: step
    }
  }
  
  draw() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height)
    
    // 绘制背景
    this.drawBackground()
    
    // 绘制坐标轴
    this.drawAxis()
    
    // 根据类型绘制图表
    switch (this.type) {
      case 'column':
        this.drawColumn()
        break
      case 'line':
        this.drawLine()
        break
      case 'pie':
        this.drawPie()
        break
      case 'bar':
        this.drawBar()
        break
      default:
        console.warn('Unsupported chart type:', this.type)
    }
    
    // 绘制图例
    if (this.series.length > 1) {
      this.drawLegend()
    }
    
    // 渲染到画布
    this.ctx.draw()
  }
  
  drawBackground() {
    // 绘制网格线
    this.ctx.setStrokeStyle('#f0f0f0')
    this.ctx.setLineWidth(1)
    
    // 横向网格线
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const y = this.chartArea.top + (this.chartHeight / ySteps) * i
      this.ctx.beginPath()
      this.ctx.moveTo(this.chartArea.left, y)
      this.ctx.lineTo(this.chartArea.right, y)
      this.ctx.stroke()
    }
  }
  
  drawAxis() {
    this.ctx.setStrokeStyle('#333333')
    this.ctx.setLineWidth(2)
    
    // X轴
    this.ctx.beginPath()
    this.ctx.moveTo(this.chartArea.left, this.chartArea.bottom)
    this.ctx.lineTo(this.chartArea.right, this.chartArea.bottom)
    this.ctx.stroke()
    
    // Y轴
    this.ctx.beginPath()
    this.ctx.moveTo(this.chartArea.left, this.chartArea.top)
    this.ctx.lineTo(this.chartArea.left, this.chartArea.bottom)
    this.ctx.stroke()
    
    // X轴标签
    this.ctx.setFontSize(12)
    this.ctx.setFillStyle('#666666')
    this.ctx.setTextAlign('center')
    
    const xStep = this.chartWidth / this.categories.length
    this.categories.forEach((category, index) => {
      const x = this.chartArea.left + xStep * (index + 0.5)
      this.ctx.fillText(category, x, this.chartArea.bottom + 20)
    })
    
    // Y轴标签
    this.ctx.setTextAlign('right')
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const value = this.dataRange.min + (this.dataRange.max - this.dataRange.min) / ySteps * (ySteps - i)
      const y = this.chartArea.top + (this.chartHeight / ySteps) * i
      this.ctx.fillText(value.toFixed(0), this.chartArea.left - 10, y + 5)
    }
    
    // Y轴标题
    if (this.opts.yAxis && this.opts.yAxis.title) {
      this.ctx.save()
      this.ctx.translate(20, this.chartArea.top + this.chartHeight / 2)
      this.ctx.rotate(-Math.PI / 2)
      this.ctx.setTextAlign('center')
      this.ctx.fillText(this.opts.yAxis.title, 0, 0)
      this.ctx.restore()
    }
  }
  
  drawColumn() {
    const categoryWidth = this.chartWidth / this.categories.length
    const barWidth = categoryWidth * 0.6 / this.series.length
    const gap = categoryWidth * 0.1
    
    this.series.forEach((serie, seriesIndex) => {
      this.ctx.setFillStyle(serie.color || this.colors[seriesIndex])
      
      serie.data.forEach((value, index) => {
        const x = this.chartArea.left + categoryWidth * index + gap + barWidth * seriesIndex
        const height = (value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min) * this.chartHeight
        const y = this.chartArea.bottom - height
        
        // 绘制柱子
        this.ctx.fillRect(x, y, barWidth, height)
        
        // 绘制数据标签
        if (this.dataLabel) {
          this.ctx.setFillStyle('#333333')
          this.ctx.setTextAlign('center')
          this.ctx.setFontSize(10)
          this.ctx.fillText(value.toString(), x + barWidth / 2, y - 5)
        }
      })
    })
  }
  
  drawLine() {
    const xStep = this.chartWidth / (this.categories.length - 1)
    
    this.series.forEach((serie, seriesIndex) => {
      this.ctx.setStrokeStyle(serie.color || this.colors[seriesIndex])
      this.ctx.setLineWidth(2)
      
      // 绘制线条
      this.ctx.beginPath()
      serie.data.forEach((value, index) => {
        const x = this.chartArea.left + xStep * index
        const y = this.chartArea.bottom - ((value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min)) * this.chartHeight
        
        if (index === 0) {
          this.ctx.moveTo(x, y)
        } else {
          this.ctx.lineTo(x, y)
        }
      })
      this.ctx.stroke()
      
      // 绘制数据点
      if (this.opts.dataPointShape) {
        this.ctx.setFillStyle(serie.color || this.colors[seriesIndex])
        serie.data.forEach((value, index) => {
          const x = this.chartArea.left + xStep * index
          const y = this.chartArea.bottom - ((value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min)) * this.chartHeight
          
          this.ctx.beginPath()
          this.ctx.arc(x, y, 4, 0, 2 * Math.PI)
          this.ctx.fill()
        })
      }
      
      // 绘制数据标签
      if (this.dataLabel) {
        this.ctx.setFillStyle('#333333')
        this.ctx.setTextAlign('center')
        this.ctx.setFontSize(10)
        serie.data.forEach((value, index) => {
          const x = this.chartArea.left + xStep * index
          const y = this.chartArea.bottom - ((value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min)) * this.chartHeight
          this.ctx.fillText(value.toString(), x, y - 10)
        })
      }
    })
  }
  
  drawPie() {
    const centerX = this.width / 2
    const centerY = this.height / 2
    const radius = Math.min(this.width, this.height) * 0.35
    
    // 计算总和
    const total = this.series[0].data.reduce((sum, value) => sum + value, 0)
    
    let startAngle = -Math.PI / 2
    
    this.series[0].data.forEach((value, index) => {
      const angle = (value / total) * 2 * Math.PI
      const endAngle = startAngle + angle
      
      // 绘制扇形
      this.ctx.setFillStyle(this.colors[index % this.colors.length])
      this.ctx.beginPath()
      this.ctx.moveTo(centerX, centerY)
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      this.ctx.closePath()
      this.ctx.fill()
      
      // 绘制标签
      if (this.dataLabel) {
        const labelAngle = startAngle + angle / 2
        const labelX = centerX + Math.cos(labelAngle) * radius * 0.7
        const labelY = centerY + Math.sin(labelAngle) * radius * 0.7
        
        this.ctx.setFillStyle('#ffffff')
        this.ctx.setTextAlign('center')
        this.ctx.setFontSize(12)
        const percentage = ((value / total) * 100).toFixed(1) + '%'
        this.ctx.fillText(percentage, labelX, labelY)
      }
      
      startAngle = endAngle
    })
    
    // 绘制图例
    this.ctx.setFontSize(12)
    this.ctx.setTextAlign('left')
    this.categories.forEach((category, index) => {
      const legendY = 30 + index * 20
      
      // 图例色块
      this.ctx.setFillStyle(this.colors[index % this.colors.length])
      this.ctx.fillRect(20, legendY - 8, 16, 16)
      
      // 图例文字
      this.ctx.setFillStyle('#333333')
      this.ctx.fillText(category, 45, legendY + 4)
    })
  }
  
  drawBar() {
    // 横向柱状图
    const categoryHeight = this.chartHeight / this.categories.length
    const barHeight = categoryHeight * 0.6 / this.series.length
    const gap = categoryHeight * 0.1
    
    this.series.forEach((serie, seriesIndex) => {
      this.ctx.setFillStyle(serie.color || this.colors[seriesIndex])
      
      serie.data.forEach((value, index) => {
        const y = this.chartArea.top + categoryHeight * index + gap + barHeight * seriesIndex
        const width = (value - this.dataRange.min) / (this.dataRange.max - this.dataRange.min) * this.chartWidth
        
        // 绘制条形
        this.ctx.fillRect(this.chartArea.left, y, width, barHeight)
        
        // 绘制数据标签
        if (this.dataLabel) {
          this.ctx.setFillStyle('#333333')
          this.ctx.setTextAlign('left')
          this.ctx.setFontSize(10)
          this.ctx.fillText(value.toString(), this.chartArea.left + width + 5, y + barHeight / 2 + 3)
        }
      })
    })
  }
  
  drawLegend() {
    const legendY = 10
    let legendX = this.width / 2 - (this.series.length * 80) / 2
    
    this.ctx.setFontSize(12)
    this.ctx.setTextAlign('left')
    
    this.series.forEach((serie, index) => {
      // 图例色块
      this.ctx.setFillStyle(serie.color || this.colors[index])
      this.ctx.fillRect(legendX, legendY, 16, 16)
      
      // 图例文字
      this.ctx.setFillStyle('#333333')
      this.ctx.fillText(serie.name, legendX + 20, legendY + 12)
      
      legendX += 80
    })
  }
  
  // 显示提示框
  showToolTip(e, opts = {}) {
    const x = e.touches[0].x
    const y = e.touches[0].y
    
    // 计算点击位置对应的数据索引
    const index = Math.floor((x - this.chartArea.left) / (this.chartWidth / this.categories.length))
    
    if (index >= 0 && index < this.categories.length) {
      // 绘制提示框背景
      const tipWidth = 120
      const tipHeight = 60
      const tipX = x - tipWidth / 2
      const tipY = y - tipHeight - 10
      
      this.ctx.setFillStyle(opts.background || '#000000')
      this.ctx.fillRect(tipX, tipY, tipWidth, tipHeight)
      
      // 绘制提示框文字
      this.ctx.setFillStyle('#ffffff')
      this.ctx.setTextAlign('center')
      this.ctx.setFontSize(12)
      this.ctx.fillText(this.categories[index], x, tipY + 20)
      
      this.series.forEach((serie, i) => {
        this.ctx.fillText(`${serie.name}: ${serie.data[index]}`, x, tipY + 40 + i * 20)
      })
      
      this.ctx.draw(true)
    }
  }
  
  // 更新数据
  updateData(data) {
    if (data.categories) this.categories = data.categories
    if (data.series) this.series = data.series
    
    // 重新计算数据范围
    this.calculateDataRange()
    
    // 重新绘制
    this.draw()
  }
}

export default WxCharts