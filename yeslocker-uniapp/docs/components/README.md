# 组件文档

本文档详细介绍了 YesLocker UniApp 项目中所有自定义组件的使用方法。项目采用 Context Engineering 架构，将组件分为三个层级：

## 组件架构

### 1. Atoms（原子组件）
基础 UI 组件，无业务逻辑，纯展示性组件。

- [UserCard](./atoms/UserCard.md) - 用户信息卡片
- [LockerItem](./atoms/LockerItem.md) - 储物柜展示组件
- [VoucherCode](./atoms/VoucherCode.md) - 凭证码展示组件

### 2. Molecules（分子组件）
包含业务逻辑的可复用组件，由原子组件组合而成。

- [IdentityVerify](./molecules/IdentityVerify.md) - 身份验证流程组件
- [StorageFlow](./molecules/StorageFlow.md) - 存储流程管理组件
- [RetrievalFlow](./molecules/RetrievalFlow.md) - 取回流程管理组件
- [Advertisement](./molecules/Advertisement.md) - 多功能广告组件

### 3. Organisms（有机体组件）
页面级别的大型组件，通常对应完整的页面。

## 组件开发规范

### 命名规范

1. **文件命名**：使用 PascalCase，如 `UserCard.vue`
2. **组件名称**：与文件名保持一致
3. **Props 命名**：使用 camelCase，如 `userData`
4. **事件命名**：使用 kebab-case，如 `@click-action`

### 样式规范

1. **单位使用**：优先使用 rpx 作为尺寸单位
2. **基准宽度**：375px = 750rpx
3. **颜色变量**：使用 uni.scss 中定义的颜色变量
4. **样式隔离**：使用 scoped 确保样式不污染全局

### 组件通信

1. **父子通信**：通过 props 和 events
2. **跨组件通信**：使用 Vuex 状态管理
3. **全局事件**：使用 uni.$emit 和 uni.$on

### 最佳实践

1. **组件职责单一**：每个组件只负责一个功能
2. **Props 验证**：定义明确的 props 类型和默认值
3. **错误处理**：合理处理异常情况
4. **性能优化**：避免不必要的重渲染
5. **文档完善**：每个组件都要有详细的使用文档

## 快速开始

### 引入组件

```vue
<template>
  <view>
    <user-card :user-data="userInfo" @click="handleUserClick" />
  </view>
</template>

<script>
import UserCard from '@/components/atoms/UserCard.vue'

export default {
  components: {
    UserCard
  },
  data() {
    return {
      userInfo: {
        name: '张三',
        phone: '138****8888',
        avatar: '/static/avatar.png'
      }
    }
  },
  methods: {
    handleUserClick() {
      console.log('用户卡片被点击')
    }
  }
}
</script>
```

### 全局注册

如果组件使用频繁，可以在 `main.js` 中全局注册：

```javascript
import UserCard from '@/components/atoms/UserCard.vue'
Vue.component('user-card', UserCard)
```

## 组件示例

每个组件文档都包含以下内容：

1. **组件介绍**：组件的功能和使用场景
2. **基础用法**：最简单的使用示例
3. **API 文档**：
   - Props：所有可用属性
   - Events：所有事件
   - Slots：可用插槽
   - Methods：暴露的方法
4. **高级用法**：复杂场景的使用示例
5. **样式定制**：如何自定义组件样式
6. **注意事项**：使用时需要注意的问题

## 更新日志

- 2025-07-23：创建组件文档结构
- 2025-07-23：添加原子组件文档
- 2025-07-23：添加分子组件文档

## 贡献指南

欢迎贡献新的组件或改进现有组件！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支
3. 编写组件和文档
4. 提交 Pull Request

更多详情请查看 [贡献指南](../CONTRIBUTING.md)。