<template>
  <view class="retrieval-page">
    <retrieval-flow
      :initial-code="initialCode"
      @voucher-verified="handleVoucherVerified"
      @complete="handleRetrievalComplete"
      @cancel="handleCancel"
    />
  </view>
</template>

<script>
import RetrievalFlow from '@/components/molecules/RetrievalFlow.vue'

export default {
  name: 'RetrievalPage',
  components: {
    RetrievalFlow
  },
  data() {
    return {
      initialCode: ''
    }
  },
  onLoad(options) {
    // 如果从扫码或其他页面跳转过来，可能带有凭证码
    if (options.code) {
      this.initialCode = options.code
    }
    
    // 检查是否从首页的凭证链接跳转过来
    if (options.voucherCode) {
      this.initialCode = options.voucherCode
    }
  },
  methods: {
    handleVoucherVerified(voucherInfo) {
      console.log('凭证已验证:', voucherInfo)
      
      // 可以在这里做一些额外的处理
      // 比如记录用户行为分析等
    },
    
    handleRetrievalComplete(data) {
      console.log('取杆完成:', data)
      
      // 显示成功提示
      uni.showToast({
        title: '取杆成功',
        icon: 'success',
        duration: 2000
      })
      
      // 延迟返回首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/home/index'
        })
      }, 2000)
    },
    
    handleCancel() {
      // 用户取消了取杆操作
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，返回首页
          uni.switchTab({
            url: '/pages/home/index'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.retrieval-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}
</style>