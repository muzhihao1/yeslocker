# LockerItem 储物柜组件

## 组件介绍

LockerItem 是一个用于展示储物柜状态和信息的原子组件。支持多种状态展示（可用、占用、维护、VIP专属等），常用于储物柜选择页面、状态展示等场景。

## 基础用法

```vue
<template>
  <locker-item 
    :locker="lockerData"
    @click="handleSelect"
  />
</template>

<script>
import LockerItem from '@/components/atoms/LockerItem.vue'

export default {
  components: {
    LockerItem
  },
  data() {
    return {
      lockerData: {
        number: 'A01',
        status: 'available',
        size: 'medium'
      }
    }
  },
  methods: {
    handleSelect(locker) {
      console.log('选择了储物柜:', locker.number)
    }
  }
}
</script>
```

## API 文档

### Props

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| locker | Object | {} | 是 | 储物柜数据对象 |
| locker.number | String | - | 是 | 储物柜编号 |
| locker.status | String | available | 否 | 状态：available/occupied/maintenance/vip |
| locker.size | String | medium | 否 | 尺寸：small/medium/large |
| locker.occupant | Object | - | 否 | 占用者信息（occupied状态时） |
| locker.vipLevel | Number | - | 否 | VIP等级要求（vip状态时） |
| selectable | Boolean | true | 否 | 是否可选择 |
| selected | Boolean | false | 否 | 是否被选中 |
| showDetails | Boolean | true | 否 | 是否显示详细信息 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| click | locker | 点击储物柜时触发 |
| select | locker | 选择储物柜时触发（仅selectable为true时） |

### Slots

| 插槽名 | 说明 |
|--------|------|
| icon | 自定义图标内容 |
| extra | 额外信息展示 |

## 状态说明

### 1. 可用状态 (available)
```vue
<locker-item 
  :locker="{
    number: 'A01',
    status: 'available',
    size: 'medium'
  }"
/>
```

### 2. 占用状态 (occupied)
```vue
<locker-item 
  :locker="{
    number: 'A02',
    status: 'occupied',
    size: 'large',
    occupant: {
      name: '张三',
      endTime: '2025-08-01'
    }
  }"
/>
```

### 3. 维护状态 (maintenance)
```vue
<locker-item 
  :locker="{
    number: 'A03',
    status: 'maintenance',
    size: 'small'
  }"
/>
```

### 4. VIP专属 (vip)
```vue
<locker-item 
  :locker="{
    number: 'V01',
    status: 'vip',
    size: 'large',
    vipLevel: 2
  }"
/>
```

## 高级用法

### 批量展示储物柜

```vue
<template>
  <view class="locker-grid">
    <locker-item 
      v-for="locker in lockers"
      :key="locker.number"
      :locker="locker"
      :selected="selectedLocker === locker.number"
      @select="handleSelect"
    />
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedLocker: null,
      lockers: [
        { number: 'A01', status: 'available', size: 'small' },
        { number: 'A02', status: 'occupied', size: 'medium' },
        { number: 'A03', status: 'available', size: 'large' },
        { number: 'V01', status: 'vip', size: 'large', vipLevel: 2 }
      ]
    }
  },
  methods: {
    handleSelect(locker) {
      if (locker.status === 'available') {
        this.selectedLocker = locker.number
      } else if (locker.status === 'vip') {
        uni.showToast({
          title: '需要VIP等级' + locker.vipLevel,
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.locker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  padding: 32rpx;
}
</style>
```

### 使用插槽自定义

```vue
<locker-item :locker="lockerData">
  <!-- 自定义图标 -->
  <template #icon>
    <image src="/static/vip-locker.png" class="custom-icon" />
  </template>
  
  <!-- 额外信息 -->
  <template #extra>
    <view class="price-tag">
      <text>¥10/天</text>
    </view>
  </template>
</locker-item>
```

### 禁用选择

```vue
<locker-item 
  :locker="lockerData"
  :selectable="false"
/>
```

## 样式定制

### CSS 变量

```css
.locker-item {
  --locker-bg-available: #f6ffed;
  --locker-bg-occupied: #fff1f0;
  --locker-bg-maintenance: #f0f0f0;
  --locker-bg-vip: #fff7e6;
  --locker-border-color: #d9d9d9;
  --locker-selected-border: #1890ff;
  --locker-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}
```

### 尺寸样式

组件根据 size 属性自动调整大小：
- small: 200rpx × 200rpx
- medium: 220rpx × 220rpx
- large: 240rpx × 240rpx

## 完整示例

```vue
<template>
  <view class="locker-selection">
    <view class="filter-tabs">
      <view 
        v-for="filter in filters"
        :key="filter.value"
        class="filter-tab"
        :class="{ active: currentFilter === filter.value }"
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
      </view>
    </view>
    
    <view class="locker-container">
      <locker-item 
        v-for="locker in filteredLockers"
        :key="locker.number"
        :locker="locker"
        :selected="selectedLocker === locker.number"
        :selectable="locker.status === 'available' || (locker.status === 'vip' && userVipLevel >= locker.vipLevel)"
        @select="handleLockerSelect"
      >
        <template #extra v-if="locker.price">
          <view class="locker-price">
            <text>¥{{ locker.price }}/天</text>
          </view>
        </template>
      </locker-item>
    </view>
    
    <view class="selected-info" v-if="selectedLocker">
      <text>已选择：{{ selectedLocker }}</text>
      <button class="confirm-btn" @click="confirmSelection">确认选择</button>
    </view>
  </view>
</template>

<script>
import LockerItem from '@/components/atoms/LockerItem.vue'

export default {
  components: {
    LockerItem
  },
  data() {
    return {
      currentFilter: 'all',
      selectedLocker: null,
      userVipLevel: 1,
      filters: [
        { label: '全部', value: 'all' },
        { label: '可用', value: 'available' },
        { label: 'VIP专属', value: 'vip' }
      ],
      lockers: [
        { number: 'A01', status: 'available', size: 'small', price: 5 },
        { number: 'A02', status: 'available', size: 'medium', price: 8 },
        { number: 'A03', status: 'occupied', size: 'medium', occupant: { name: '张三', endTime: '2025-08-01' } },
        { number: 'A04', status: 'maintenance', size: 'large' },
        { number: 'V01', status: 'vip', size: 'large', vipLevel: 1, price: 10 },
        { number: 'V02', status: 'vip', size: 'large', vipLevel: 2, price: 12 },
      ]
    }
  },
  computed: {
    filteredLockers() {
      if (this.currentFilter === 'all') {
        return this.lockers
      }
      return this.lockers.filter(locker => locker.status === this.currentFilter)
    }
  },
  methods: {
    handleLockerSelect(locker) {
      if (locker.status === 'available') {
        this.selectedLocker = locker.number
      } else if (locker.status === 'vip') {
        if (this.userVipLevel >= locker.vipLevel) {
          this.selectedLocker = locker.number
        } else {
          uni.showModal({
            title: '提示',
            content: `需要VIP等级${locker.vipLevel}才能使用此储物柜`,
            confirmText: '升级VIP',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/user/membership'
                })
              }
            }
          })
        }
      }
    },
    confirmSelection() {
      if (this.selectedLocker) {
        uni.navigateTo({
          url: `/pages/storage/confirm?locker=${this.selectedLocker}`
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.locker-selection {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.filter-tabs {
  display: flex;
  padding: 24rpx 32rpx;
  background-color: #ffffff;
  
  .filter-tab {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 30rpx;
    color: #666666;
    
    &.active {
      color: #1890ff;
      font-weight: 500;
      position: relative;
      
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

.locker-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  padding: 32rpx;
}

.locker-price {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #ff4d4f;
  font-weight: 500;
}

.selected-info {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background-color: #ffffff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  text {
    font-size: 30rpx;
    color: #333333;
  }
  
  .confirm-btn {
    padding: 20rpx 48rpx;
    background-color: #1890ff;
    color: #ffffff;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
  }
}
</style>
```

## 注意事项

1. **状态互斥**：一个储物柜同时只能有一种状态
2. **选择限制**：只有 `available` 和满足条件的 `vip` 状态的储物柜可被选择
3. **占用信息**：`occupied` 状态时建议提供占用者信息，但注意隐私保护
4. **VIP等级**：`vip` 状态的储物柜需要提供 `vipLevel` 属性
5. **性能优化**：大量储物柜展示时建议使用虚拟列表或分页加载

## 更新日志

- 2025-07-23：创建组件文档
- 2025-07-23：添加 VIP 状态支持
- 2025-07-23：添加插槽功能