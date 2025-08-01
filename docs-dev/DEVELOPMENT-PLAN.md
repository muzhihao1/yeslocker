# Context Engineering 驱动的开发计划

> 遵循"原子→分子→细胞→组织→系统"的渐进式开发模式

## 🎯 开发原则

1. **Context First**: 每个开发任务都基于已定义的上下文
2. **Progressive Complexity**: 从简单到复杂，逐层构建
3. **Verifiable Milestones**: 每个阶段都有可验证的产出
4. **Business Value Focus**: 优先实现商业价值

## 📅 14天开发时间线

### 🔧 Phase 1: Foundation (Day 1-6) - Level 1实现

#### Day 1-2: 环境搭建与项目初始化
**目标**: 建立可运行的基础环境

**任务清单**:
```bash
# 1. Fork并克隆项目
□ Fork litemall到个人GitHub
□ 克隆并重命名为yeshi-locker
□ 创建yeshi-mvp分支

# 2. 环境配置
□ 安装MySQL 5.7+并创建数据库
□ 安装Redis 5.0+
□ 配置开发环境变量
□ 验证Java/Node.js环境

# 3. 项目初始化
□ 导入基础数据库表
□ 创建扩展表结构
□ 配置application-dev.yml
□ 整合Context Engineering文档

# 4. 验证运行
□ 启动后端服务
□ 启动管理后台
□ 配置小程序开发工具
```

**验证标准**:
- ✅ 后端API可访问: http://localhost:8080
- ✅ 管理后台可登录: http://localhost:9527
- ✅ 小程序可在开发工具中运行

**关键文件**:
```yaml
# yeshi-extensions.sql
CREATE TABLE `litemall_locker_operation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(10) NOT NULL,
  `locker_no` varchar(20) DEFAULT NULL,
  `voucher_code` varchar(32) DEFAULT NULL,
  `qr_code_url` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  `expired_at` datetime DEFAULT NULL,
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_voucher` (`voucher_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `litemall_user` 
ADD COLUMN `real_name` varchar(63) DEFAULT NULL,
ADD COLUMN `identity_verified` tinyint(1) DEFAULT '0';
```

#### Day 3-4: Level 1 - 实体层构建
**目标**: 实现7个核心实体及其数据操作

**开发内容**:
1. **实体类创建** (参考: level-1-atoms/entities.md)
   ```java
   // LitemallLockerOperation.java
   @Data
   public class LitemallLockerOperation {
       private Integer id;
       private Integer userId;
       private String type; // store/retrieve
       private String lockerNo;
       private String voucherCode;
       private String qrCodeUrl;
       private Byte status;
       private LocalDateTime expiredAt;
   }
   ```

2. **Mapper接口**
   ```java
   @Mapper
   public interface LitemallLockerOperationMapper {
       int insert(LitemallLockerOperation record);
       LitemallLockerOperation selectByVoucherCode(String voucherCode);
       List<LitemallLockerOperation> selectActiveByUserId(Integer userId);
       int updateStatusById(@Param("id") Integer id, @Param("status") Byte status);
   }
   ```

3. **Service层基础实现**
   ```java
   @Service
   public class LitemallLockerService {
       @Autowired
       private LitemallLockerOperationMapper operationMapper;
       
       public LitemallLockerOperation findActiveByUser(Integer userId) {
           List<LitemallLockerOperation> list = operationMapper.selectActiveByUserId(userId);
           return list.isEmpty() ? null : list.get(0);
       }
   }
   ```

**验证标准**:
- ✅ 数据库CRUD操作正常
- ✅ 实体映射正确
- ✅ 单元测试通过

#### Day 5-6: Level 1 - 基础操作实现
**目标**: 实现核心的原子操作

**开发内容** (参考: level-1-atoms/basic-operations.md):

1. **认证操作增强**
   ```java
   @PostMapping("/wx/auth/verify")
   public Object verifyIdentity(@LoginUser Integer userId, @RequestBody VerifyRequest request) {
       // 1. 验证用户状态
       // 2. 检查手机号唯一性
       // 3. 更新用户信息
       // 4. 返回验证结果
   }
   ```

2. **凭证生成操作**
   ```java
   public String generateVoucherCode() {
       String date = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now());
       String random1 = RandomStringUtils.randomAlphanumeric(4).toUpperCase();
       String random2 = RandomStringUtils.randomAlphanumeric(4).toUpperCase();
       return String.format("%s-%s-%s", date, random1, random2);
   }
   ```

3. **二维码生成**
   ```java
   @Service
   public class QRCodeService {
       public String generateQRCode(String content) {
           // 使用ZXing生成二维码
           // 上传到七牛云
           // 返回URL
       }
   }
   ```

**验证标准**:
- ✅ 用户可以完成身份验证
- ✅ 凭证码格式正确且唯一
- ✅ 二维码可以生成和访问

### 🌊 Phase 2: Business Logic (Day 7-10) - Level 2实现

#### Day 7-8: 核心业务流程
**目标**: 实现存取杆的完整业务流程

**开发内容** (参考: level-2-neural/business-flows.md):

1. **存杆流程实现**
   ```java
   @Transactional
   public Map<String, Object> store(Integer userId, String lockerNo) {
       // 1. 前置检查
       checkUserVerified(userId);
       checkNoActiveStorage(userId);
       
       // 2. 生成凭证
       String voucherCode = generateVoucherCode();
       String qrCodeUrl = qrCodeService.generateQRCode(voucherCode);
       
       // 3. 创建记录
       LitemallLockerOperation operation = new LitemallLockerOperation();
       operation.setUserId(userId);
       operation.setType("store");
       operation.setLockerNo(lockerNo);
       operation.setVoucherCode(voucherCode);
       operation.setQrCodeUrl(qrCodeUrl);
       operation.setExpiredAt(LocalDateTime.now().plusDays(30));
       
       operationMapper.insert(operation);
       
       // 4. 更新缓存
       redisTemplate.opsForValue().set(
           "user:locker:" + userId, 
           lockerNo,
           30, TimeUnit.DAYS
       );
       
       // 5. 返回结果
       Map<String, Object> result = new HashMap<>();
       result.put("voucherCode", voucherCode);
       result.put("qrCodeUrl", qrCodeUrl);
       result.put("lockerNo", lockerNo);
       result.put("expiredAt", operation.getExpiredAt());
       
       return result;
   }
   ```

2. **取杆流程实现**
   ```java
   @Transactional
   public void retrieve(Integer userId, String voucherCode) {
       // 1. 验证凭证
       LitemallLockerOperation operation = operationMapper.selectByVoucherCode(voucherCode);
       if (operation == null) {
           throw new BusinessException("凭证不存在");
       }
       
       // 2. 验证所有权
       if (!operation.getUserId().equals(userId)) {
           throw new BusinessException("这不是您的凭证");
       }
       
       // 3. 验证状态
       if (operation.getStatus() == 0) {
           throw new BusinessException("凭证已使用");
       }
       
       // 4. 更新状态
       operationMapper.updateStatusById(operation.getId(), (byte)0);
       
       // 5. 清理缓存
       redisTemplate.delete("user:locker:" + userId);
   }
   ```

3. **小程序页面开发**
   - 存杆页面UI
   - 凭证展示页面
   - 操作成功反馈

**验证标准**:
- ✅ 完整的存杆流程可运行
- ✅ 凭证展示清晰
- ✅ 取杆验证严格

#### Day 9-10: 商业化功能
**目标**: 实现广告展示和二手球杆浏览

**开发内容**:

1. **广告展示集成**
   ```javascript
   // 小程序首页
   Page({
     data: {
       bannerAds: [],
       sideAds: []
     },
     
     onLoad() {
       this.loadAds('home_banner').then(ads => {
         this.setData({ bannerAds: ads });
       });
     },
     
     onAdClick(e) {
       const adId = e.currentTarget.dataset.id;
       wx.request({
         url: `/api/v1/ads/${adId}/click`,
         method: 'POST'
       });
     }
   });
   ```

2. **二手球杆列表**
   - 改造商品列表页
   - 添加筛选功能
   - 实现浏览统计

**验证标准**:
- ✅ 广告正常轮播
- ✅ 点击统计准确
- ✅ 商品列表可浏览

### 🔌 Phase 3: Integration & Launch (Day 11-14) - Level 3实现

#### Day 11-12: 系统集成
**目标**: 完成各子系统的集成

**开发内容** (参考: level-3-protocols/):

1. **微信平台集成**
   - 模板消息配置
   - 长期未使用提醒

2. **监控集成**
   ```java
   @Component
   public class MetricsCollector {
       private final MeterRegistry registry;
       
       public void recordOperation(String type) {
           registry.counter("locker.operations", "type", type).increment();
       }
       
       public void recordApiLatency(String endpoint, long duration) {
           registry.timer("api.latency", "endpoint", endpoint).record(duration, TimeUnit.MILLISECONDS);
       }
   }
   ```

3. **定时任务**
   ```java
   @Scheduled(cron = "0 0 1 * * ?")
   public void generateDailyReport() {
       // 生成日报
   }
   
   @Scheduled(cron = "0 */10 * * * ?")
   public void checkExpiredVouchers() {
       // 检查过期凭证
   }
   ```

**验证标准**:
- ✅ 监控数据可查看
- ✅ 定时任务正常执行
- ✅ 通知功能可用

#### Day 13-14: 测试与上线
**目标**: 完成测试并部署上线

**任务清单**:

1. **功能测试**
   ```yaml
   测试用例:
     - 新用户完整流程
     - 存取杆全流程
     - 广告点击统计
     - 商品浏览记录
     - 异常情况处理
   ```

2. **性能测试**
   - API响应时间 < 200ms
   - 并发用户 > 100
   - 页面加载 < 3s

3. **部署上线**
   ```bash
   # 1. 打包应用
   mvn clean package
   
   # 2. 上传服务器
   scp target/*.jar server:/opt/yeshi/
   
   # 3. 启动服务
   java -jar yeshi-locker.jar --spring.profiles.active=prod
   
   # 4. 配置Nginx
   # 5. 申请SSL证书
   # 6. 小程序提审
   ```

**验证标准**:
- ✅ 生产环境可访问
- ✅ 小程序审核通过
- ✅ 监控正常

## 📊 每日进度追踪

### 进度看板模板
```markdown
## Day X 进度 (Date)

### ✅ 已完成
- [ ] 任务1
- [ ] 任务2

### 🚧 进行中
- [ ] 任务3

### ❌ 遇到问题
- 问题描述
- 解决方案

### 📝 明日计划
- 任务4
- 任务5

### 💡 学到的经验
- 经验1
- 经验2
```

## 🎯 关键里程碑

| 日期 | 里程碑 | 验证标准 |
|------|--------|----------|
| Day 2 | 环境就绪 | 所有服务可启动 |
| Day 6 | Level 1完成 | 基础API可调用 |
| Day 8 | 核心功能完成 | 存取流程可用 |
| Day 10 | 商业功能完成 | 广告和商品展示正常 |
| Day 12 | 集成完成 | 所有系统联调通过 |
| Day 14 | MVP上线 | 用户可正常使用 |

## 🚨 风险管理

### 技术风险
1. **Litemall学习曲线**
   - 缓解: 先运行demo，理解架构
   - 备选: 使用Node.js重写后端

2. **微信API限制**
   - 缓解: 提前申请模板消息
   - 备选: 使用服务号功能

### 时间风险
1. **功能超出预期**
   - 缓解: 严格控制MVP范围
   - 原则: 2周内必须上线

2. **审核延迟**
   - 缓解: 提前准备材料
   - 备选: 先用体验版测试

## 📈 成功标准

### 技术指标
- API可用性 > 99%
- 响应时间 < 500ms
- 错误率 < 1%

### 业务指标
- 首周用户 > 50
- 日活跃 > 20
- 广告CTR > 1%

### 验证指标
- 用户反馈积极
- 无重大bug
- 可持续迭代

## 🔄 每日站会模板

```
时间: 每天 10:00
时长: 15分钟

议程:
1. 昨天完成了什么？
2. 今天计划做什么？
3. 遇到什么阻碍？
4. 需要什么帮助？

输出:
- 更新任务看板
- 调整优先级
- 解决阻碍
```

## 💡 开发小贴士

1. **保持简单**: MVP不求完美，求快速验证
2. **数据驱动**: 每个功能都要可度量
3. **用户优先**: 优先解决用户痛点
4. **持续集成**: 每天都要有可运行版本
5. **文档同步**: 代码变更同步更新Context文档

---

*基于Context Engineering原则制定，随开发进展动态调整*