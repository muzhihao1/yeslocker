<template>
  <view class="marketplace-page">
    <!-- Search Bar -->
    <view class="search-bar">
      <view class="search-input" @click="navigateToSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索二手球杆</text>
      </view>
    </view>
    
    <!-- Banner Swiper -->
    <view class="banner-section">
      <swiper 
        class="banner-swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="5000"
        :duration="500"
        :circular="true"
      >
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <image :src="banner.imageUrl" mode="aspectFill" class="banner-image" @click="handleBannerClick(banner)" />
        </swiper-item>
      </swiper>
    </view>
    
    <!-- Category Grid -->
    <view class="category-section">
      <view class="section-header">
        <text class="section-title">商品分类</text>
        <text class="section-more" @click="navigateToCategories">查看全部 ›</text>
      </view>
      <view class="category-grid">
        <view 
          v-for="category in categories" 
          :key="category.id"
          class="category-item"
          @click="navigateToCategory(category)"
        >
          <image :src="category.icon" mode="aspectFit" class="category-icon" />
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- Featured Products -->
    <view class="featured-section">
      <view class="section-header">
        <text class="section-title">精选球杆</text>
        <text class="section-desc">优质二手球杆推荐</text>
      </view>
      <scroll-view 
        scroll-x 
        class="featured-scroll"
        :show-scrollbar="false"
      >
        <view class="featured-list">
          <view 
            v-for="product in featuredProducts" 
            :key="product.id"
            class="featured-item"
            @click="navigateToProduct(product)"
          >
            <image :src="product.imageUrl" mode="aspectFill" class="product-image" />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <text class="product-price">¥{{ product.price }}</text>
              <text class="product-original-price" v-if="product.originalPrice">
                ¥{{ product.originalPrice }}
              </text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- Product List -->
    <view class="product-section">
      <view class="section-header">
        <text class="section-title">全部商品</text>
        <view class="sort-filter">
          <text class="sort-text" @click="showSortOptions">
            {{ currentSort.name }} ▼
          </text>
        </view>
      </view>
      
      <view class="product-grid">
        <view 
          v-for="product in products" 
          :key="product.id"
          class="product-card"
          @click="navigateToProduct(product)"
        >
          <image :src="product.imageUrl" mode="aspectFill" class="product-image" />
          <view class="product-content">
            <text class="product-title">{{ product.name }}</text>
            <text class="product-desc">{{ product.description }}</text>
            <view class="product-footer">
              <text class="product-price">¥{{ product.price }}</text>
              <text class="product-sold">已售{{ product.soldCount }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Load More -->
      <view class="load-more" v-if="hasMore">
        <text class="load-more-text" v-if="!loading">上拉加载更多</text>
        <text class="load-more-text" v-else>加载中...</text>
      </view>
      <view class="no-more" v-else>
        <text class="no-more-text">没有更多商品了</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MarketplacePage',
  data() {
    return {
      banners: [],
      categories: [],
      featuredProducts: [],
      products: [],
      currentSort: {
        id: 'default',
        name: '综合排序'
      },
      sortOptions: [
        { id: 'default', name: '综合排序' },
        { id: 'price_asc', name: '价格从低到高' },
        { id: 'price_desc', name: '价格从高到低' },
        { id: 'sales', name: '销量优先' },
        { id: 'newest', name: '最新上架' }
      ],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false
    }
  },
  onLoad() {
    this.loadBanners()
    this.loadCategories()
    this.loadFeaturedProducts()
    this.loadProducts()
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMoreProducts()
    }
  },
  methods: {
    async loadBanners() {
      // TODO: 调用API获取轮播图
      // 模拟数据
      this.banners = [
        {
          id: 1,
          imageUrl: '/static/banner-1.jpg',
          link: '/pages/marketplace/special'
        },
        {
          id: 2,
          imageUrl: '/static/banner-2.jpg',
          link: '/pages/marketplace/special'
        }
      ]
    },
    
    async loadCategories() {
      // TODO: 调用API获取分类
      // 模拟数据
      this.categories = [
        { id: 1, name: '九球杆', icon: '/static/category-1.png' },
        { id: 2, name: '斯诺克', icon: '/static/category-2.png' },
        { id: 3, name: '中式八球', icon: '/static/category-3.png' },
        { id: 4, name: '配件', icon: '/static/category-4.png' }
      ]
    },
    
    async loadFeaturedProducts() {
      // TODO: 调用API获取精选商品
      // 模拟数据
      this.featuredProducts = [
        {
          id: 1,
          name: '美洲豹九球杆',
          price: 2800,
          originalPrice: 3500,
          imageUrl: '/static/product-1.jpg'
        },
        {
          id: 2,
          name: '野豹斯诺克球杆',
          price: 1800,
          imageUrl: '/static/product-2.jpg'
        }
      ]
    },
    
    async loadProducts() {
      this.loading = true
      
      try {
        // TODO: 调用API获取商品列表
        // 模拟数据
        const mockProducts = []
        for (let i = 1; i <= 10; i++) {
          mockProducts.push({
            id: i,
            name: `二手球杆 ${i}`,
            description: '九成新，保养良好',
            price: Math.floor(Math.random() * 3000) + 500,
            soldCount: Math.floor(Math.random() * 100),
            imageUrl: '/static/product-default.jpg'
          })
        }
        
        this.products = mockProducts
        this.page = 1
        this.hasMore = true
      } catch (error) {
        console.error('加载商品失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    async loadMoreProducts() {
      this.loading = true
      
      try {
        // TODO: 调用API获取更多商品
        // 模拟数据
        const mockProducts = []
        const startId = this.products.length + 1
        
        for (let i = startId; i < startId + 10; i++) {
          mockProducts.push({
            id: i,
            name: `二手球杆 ${i}`,
            description: '九成新，保养良好',
            price: Math.floor(Math.random() * 3000) + 500,
            soldCount: Math.floor(Math.random() * 100),
            imageUrl: '/static/product-default.jpg'
          })
        }
        
        this.products = [...this.products, ...mockProducts]
        this.page++
        
        // 模拟没有更多数据
        if (this.products.length >= 30) {
          this.hasMore = false
        }
      } catch (error) {
        console.error('加载更多商品失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    showSortOptions() {
      const itemList = this.sortOptions.map(item => item.name)
      
      uni.showActionSheet({
        itemList,
        success: (res) => {
          const selected = this.sortOptions[res.tapIndex]
          if (selected.id !== this.currentSort.id) {
            this.currentSort = selected
            this.loadProducts()
          }
        }
      })
    },
    
    handleBannerClick(banner) {
      if (banner.link) {
        uni.navigateTo({
          url: banner.link
        })
      }
    },
    
    navigateToSearch() {
      uni.navigateTo({
        url: '/pages/marketplace/search'
      })
    },
    
    navigateToCategories() {
      uni.navigateTo({
        url: '/pages/marketplace/categories'
      })
    },
    
    navigateToCategory(category) {
      uni.navigateTo({
        url: `/pages/marketplace/category?id=${category.id}&name=${category.name}`
      })
    },
    
    navigateToProduct(product) {
      uni.navigateTo({
        url: `/pages/marketplace/product?id=${product.id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.marketplace-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16rpx 32rpx;
  background-color: #ffffff;
  
  .search-input {
    display: flex;
    align-items: center;
    height: 72rpx;
    padding: 0 24rpx;
    background-color: #f5f5f5;
    border-radius: 36rpx;
    
    .search-icon {
      font-size: 32rpx;
      margin-right: 16rpx;
    }
    
    .search-placeholder {
      font-size: 28rpx;
      color: #999999;
    }
  }
}

.banner-section {
  .banner-swiper {
    height: 400rpx;
    
    .banner-image {
      width: 100%;
      height: 100%;
    }
  }
}

.category-section {
  background-color: #ffffff;
  padding: 32rpx;
  margin-bottom: 24rpx;
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32rpx;
    margin-top: 24rpx;
    
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .category-icon {
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 16rpx;
      }
      
      .category-name {
        font-size: 26rpx;
        color: #333333;
      }
    }
  }
}

.featured-section {
  background-color: #ffffff;
  padding: 32rpx 0;
  margin-bottom: 24rpx;
  
  .featured-scroll {
    margin-top: 24rpx;
    
    .featured-list {
      display: flex;
      padding: 0 32rpx;
      
      .featured-item {
        width: 240rpx;
        margin-right: 24rpx;
        
        .product-image {
          width: 240rpx;
          height: 240rpx;
          border-radius: 12rpx;
          margin-bottom: 16rpx;
        }
        
        .product-info {
          .product-name {
            display: block;
            font-size: 28rpx;
            color: #333333;
            margin-bottom: 8rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .product-price {
            font-size: 32rpx;
            color: #ff4d4f;
            font-weight: 500;
            margin-right: 12rpx;
          }
          
          .product-original-price {
            font-size: 24rpx;
            color: #999999;
            text-decoration: line-through;
          }
        }
      }
    }
  }
}

.product-section {
  background-color: #ffffff;
  padding: 32rpx;
  
  .sort-filter {
    .sort-text {
      font-size: 28rpx;
      color: #666666;
    }
  }
  
  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    margin-top: 24rpx;
    
    .product-card {
      background-color: #ffffff;
      border-radius: 12rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
      
      .product-image {
        width: 100%;
        height: 340rpx;
      }
      
      .product-content {
        padding: 20rpx;
        
        .product-title {
          display: block;
          font-size: 28rpx;
          color: #333333;
          margin-bottom: 8rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .product-desc {
          display: block;
          font-size: 24rpx;
          color: #999999;
          margin-bottom: 16rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .product-price {
            font-size: 32rpx;
            color: #ff4d4f;
            font-weight: 500;
          }
          
          .product-sold {
            font-size: 24rpx;
            color: #999999;
          }
        }
      }
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .section-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
  }
  
  .section-desc {
    font-size: 26rpx;
    color: #999999;
    margin-left: 16rpx;
  }
  
  .section-more {
    font-size: 28rpx;
    color: #999999;
  }
}

.load-more,
.no-more {
  text-align: center;
  padding: 32rpx 0 48rpx;
  
  .load-more-text,
  .no-more-text {
    font-size: 28rpx;
    color: #999999;
  }
}
</style>