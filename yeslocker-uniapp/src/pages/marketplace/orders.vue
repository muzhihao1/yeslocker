<template>
  <view class="orders-page">
    <!-- Page Header -->
    <view class="page-header">
      <text class="page-title">商城订单</text>
    </view>
    
    <!-- Order Tabs -->
    <view class="order-tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'all' }"
        @click="switchTab('all')"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'pending' }"
        @click="switchTab('pending')"
      >
        待付款
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'shipping' }"
        @click="switchTab('shipping')"
      >
        待发货
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'completed' }"
        @click="switchTab('completed')"
      >
        已完成
      </view>
    </view>
    
    <!-- Order List -->
    <view class="order-list" v-if="orders.length > 0">
      <view class="order-card" v-for="order in orders" :key="order.id" @click="viewOrderDetail(order)">
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status">{{ getStatusText(order.status) }}</text>
        </view>
        
        <view class="order-items">
          <view class="order-item" v-for="item in order.items" :key="item.id">
            <image class="item-image" :src="item.image" mode="aspectFill"></image>
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-spec">{{ item.spec }}</text>
            </view>
            <view class="item-price">
              <text class="price">¥{{ item.price }}</text>
              <text class="quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <text class="total-info">共{{ order.totalQuantity }}件商品，合计：</text>
          <text class="total-price">¥{{ order.totalPrice }}</text>
        </view>
        
        <view class="order-actions" v-if="order.status === 'pending'">
          <button class="action-btn cancel-btn" @click.stop="cancelOrder(order)">取消订单</button>
          <button class="action-btn pay-btn" @click.stop="payOrder(order)">立即支付</button>
        </view>
      </view>
    </view>
    
    <!-- Empty State -->
    <view class="empty-state" v-else>
      <image class="empty-icon" src="/static/empty-order.png" mode="aspectFit"></image>
      <text class="empty-text">暂无订单</text>
      <button class="go-shopping-btn" @click="goShopping">去商城逛逛</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'OrdersPage',
  data() {
    return {
      currentTab: 'all',
      orders: []
    }
  },
  onLoad() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      // TODO: 从API加载订单数据
      // 模拟数据
      this.orders = [
        {
          id: 1,
          orderNo: 'ORDER20240122001',
          status: 'pending',
          totalQuantity: 2,
          totalPrice: '299.00',
          items: [
            {
              id: 1,
              name: '专业比赛用球杆',
              spec: '规格：147cm',
              image: '/static/cue-1.jpg',
              price: '199.00',
              quantity: 1
            },
            {
              id: 2,
              name: '球杆保养套装',
              spec: '包含：清洁剂、抛光剂',
              image: '/static/care-kit.jpg',
              price: '100.00',
              quantity: 1
            }
          ]
        }
      ]
    },
    
    switchTab(tab) {
      this.currentTab = tab
      this.loadOrders()
    },
    
    getStatusText(status) {
      const statusMap = {
        pending: '待付款',
        paid: '待发货',
        shipping: '配送中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status] || status
    },
    
    viewOrderDetail(order) {
      uni.navigateTo({
        url: `/pages/marketplace/order-detail?id=${order.id}`
      })
    },
    
    cancelOrder(order) {
      uni.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用取消订单API
            uni.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            this.loadOrders()
          }
        }
      })
    },
    
    payOrder(order) {
      // TODO: 跳转到支付页面
      uni.navigateTo({
        url: `/pages/marketplace/payment?orderId=${order.id}`
      })
    },
    
    goShopping() {
      uni.switchTab({
        url: '/pages/marketplace/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.orders-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.page-header {
  padding: 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .page-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333333;
  }
}

.order-tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .tab-item {
    flex: 1;
    padding: 28rpx 0;
    text-align: center;
    font-size: 30rpx;
    color: #666666;
    position: relative;
    
    &.active {
      color: #1890ff;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #1890ff;
      }
    }
  }
}

.order-list {
  padding: 24rpx 32rpx;
}

.order-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .order-no {
      font-size: 26rpx;
      color: #999999;
    }
    
    .order-status {
      font-size: 28rpx;
      color: #1890ff;
      font-weight: 500;
    }
  }
  
  .order-items {
    border-top: 1rpx solid #f0f0f0;
    padding-top: 24rpx;
  }
  
  .order-item {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .item-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 8rpx;
      margin-right: 24rpx;
    }
    
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .item-name {
        font-size: 30rpx;
        color: #333333;
        margin-bottom: 8rpx;
      }
      
      .item-spec {
        font-size: 26rpx;
        color: #999999;
      }
    }
    
    .item-price {
      text-align: right;
      
      .price {
        font-size: 30rpx;
        color: #333333;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .quantity {
        font-size: 26rpx;
        color: #999999;
      }
    }
  }
  
  .order-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .total-info {
      font-size: 26rpx;
      color: #666666;
      margin-right: 16rpx;
    }
    
    .total-price {
      font-size: 32rpx;
      color: #ff4d4f;
      font-weight: 600;
    }
  }
  
  .order-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .action-btn {
      height: 64rpx;
      padding: 0 32rpx;
      border-radius: 32rpx;
      font-size: 28rpx;
      margin-left: 24rpx;
      
      &.cancel-btn {
        background-color: #ffffff;
        color: #666666;
        border: 2rpx solid #e8e8e8;
      }
      
      &.pay-btn {
        background-color: #ff4d4f;
        color: #ffffff;
        border: none;
      }
    }
  }
}

.empty-state {
  padding: 160rpx 32rpx;
  text-align: center;
  
  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 32rpx;
  }
  
  .empty-text {
    font-size: 30rpx;
    color: #999999;
    display: block;
    margin-bottom: 48rpx;
  }
  
  .go-shopping-btn {
    width: 240rpx;
    height: 80rpx;
    background-color: #1890ff;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 40rpx;
    border: none;
    margin: 0 auto;
  }
}
</style>