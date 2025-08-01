# B02 分页查询优化指南

## 概述

本文档提供了储物柜系统分页查询的优化建议和最佳实践。

## 当前分页实现分析

### 1. 现有实现

系统使用 PageHelper 进行分页，典型代码模式：

```java
PageHelper.startPage(page, limit);
return lockerMapper.selectByExample(example);
```

### 2. 存在的问题

1. **深分页问题**：当页码很大时，性能急剧下降
2. **COUNT 查询开销**：每次分页都执行 COUNT 查询
3. **缺少查询缓存**：相同查询条件重复执行
4. **无排序优化**：某些查询未利用索引排序

## 优化建议

### 1. 限制最大页码

```java
// 在 Service 层添加页码限制
public static final int MAX_PAGE = 100;  // 最多查询前100页
public static final int MAX_PAGE_SIZE = 100;  // 单页最大记录数

public List<LitemallLocker> querySelective(...) {
    // 限制页码
    if (page > MAX_PAGE) {
        page = MAX_PAGE;
    }
    if (limit > MAX_PAGE_SIZE) {
        limit = MAX_PAGE_SIZE;
    }
    // ... 继续查询逻辑
}
```

### 2. 使用游标分页（适用于大数据量）

```java
// 新增游标分页方法
public List<LitemallLocker> queryCursor(Integer lastId, Integer limit) {
    LitemallLockerExample example = new LitemallLockerExample();
    LitemallLockerExample.Criteria criteria = example.createCriteria();
    
    if (lastId != null) {
        criteria.andIdGreaterThan(lastId);
    }
    criteria.andDeletedEqualTo(false);
    example.setOrderByClause("id ASC");
    
    // 不使用 PageHelper，直接限制结果集
    PageHelper.startPage(1, limit);
    return lockerMapper.selectByExample(example);
}
```

### 3. 优化 COUNT 查询

```java
// 添加是否需要总数的参数
public PageResult<LitemallLocker> queryWithOptionalCount(
    String zone, String status, Integer storeId,
    Integer page, Integer limit, boolean needCount) {
    
    List<LitemallLocker> list;
    long total = 0;
    
    // 执行主查询
    PageHelper.startPage(page, limit);
    list = lockerMapper.selectByExample(example);
    
    // 仅在需要时执行 COUNT
    if (needCount) {
        PageInfo<LitemallLocker> pageInfo = new PageInfo<>(list);
        total = pageInfo.getTotal();
    }
    
    return new PageResult<>(list, total, page, limit);
}
```

### 4. 添加查询结果缓存

```java
@Service
public class LitemallLockerService {
    @Resource
    private StringRedisTemplate redisTemplate;
    
    // 缓存常用查询
    @Cacheable(value = "locker:available", key = "#storeId + ':' + #zone")
    public List<LitemallLocker> queryAvailableWithCache(Integer storeId, String zone) {
        return queryAvailable(zone);
    }
    
    // 更新时清除缓存
    @CacheEvict(value = "locker:available", allEntries = true)
    public int update(LitemallLocker locker) {
        // ... 更新逻辑
    }
}
```

### 5. 优化排序策略

```java
// 根据查询条件选择最优排序
private String getOptimalOrderBy(String zone, String status) {
    // 如果按区域查询，使用区域+编号排序（有复合索引）
    if (!StringUtils.isEmpty(zone)) {
        return "zone ASC, cabinet_number ASC";
    }
    // 如果按状态查询，使用状态+ID排序
    if (!StringUtils.isEmpty(status)) {
        return "status ASC, id DESC";
    }
    // 默认按ID倒序（主键索引）
    return "id DESC";
}
```

## 分页查询最佳实践

### 1. 储物柜列表查询优化

```java
public PageResult<LockerVO> queryLockersOptimized(
    LockerQueryParam param) {
    
    // 1. 参数验证和限制
    param.validate();
    
    // 2. 构建查询条件
    LitemallLockerExample example = buildExample(param);
    
    // 3. 选择最优排序
    example.setOrderByClause(getOptimalOrderBy(param));
    
    // 4. 执行分页查询
    Page<LitemallLocker> page = PageHelper.startPage(
        param.getPage(), 
        param.getLimit(),
        param.isNeedCount()  // 按需COUNT
    );
    
    List<LitemallLocker> lockers = lockerMapper.selectByExample(example);
    
    // 5. 转换为VO并返回
    return PageResult.of(page, this::convertToVO);
}
```

### 2. 操作记录查询优化

```java
public PageResult<OperationVO> queryOperationsOptimized(
    Integer userId, 
    String type,
    Integer page, 
    Integer limit) {
    
    // 使用存储过程（已优化的查询）
    Map<String, Object> params = new HashMap<>();
    params.put("p_user_id", userId);
    params.put("p_type", type);
    params.put("p_page", page);
    params.put("p_limit", limit);
    
    List<OperationVO> list = sqlSession.selectList(
        "queryUserOperationsOptimized", params);
    
    Integer total = sqlSession.selectOne(
        "queryUserOperationsOptimized_total", params);
    
    return new PageResult<>(list, total, page, limit);
}
```

### 3. 统计查询优化

```java
@Cacheable(value = "locker:stats", key = "#storeId")
public LockerStats getStoreStats(Integer storeId) {
    // 使用单个查询获取所有统计信息
    return lockerMapper.selectStoreStats(storeId);
}
```

## 分页组件封装

### PageResult 类

```java
@Data
public class PageResult<T> {
    private List<T> list;
    private long total;
    private int pageNum;
    private int pageSize;
    private int pages;
    
    public static <T> PageResult<T> of(Page<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setList(page.getResult());
        result.setTotal(page.getTotal());
        result.setPageNum(page.getPageNum());
        result.setPageSize(page.getPageSize());
        result.setPages(page.getPages());
        return result;
    }
}
```

### 查询参数基类

```java
@Data
public abstract class PageParam {
    private Integer page = 1;
    private Integer limit = 20;
    private String sort;
    private String order = "DESC";
    private boolean needCount = true;
    
    public void validate() {
        if (page < 1) page = 1;
        if (page > 100) page = 100;
        if (limit < 1) limit = 1;
        if (limit > 100) limit = 100;
    }
}
```

## 监控和调优

### 1. 添加性能监控

```java
@Aspect
@Component
public class PaginationMonitor {
    
    @Around("@annotation(Paginated)")
    public Object monitor(ProceedingJoinPoint pjp) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        try {
            Object result = pjp.proceed();
            
            long duration = System.currentTimeMillis() - startTime;
            if (duration > 1000) {  // 超过1秒记录警告
                log.warn("Slow pagination query: {} took {}ms", 
                    pjp.getSignature().getName(), duration);
            }
            
            return result;
        } catch (Exception e) {
            log.error("Pagination query error", e);
            throw e;
        }
    }
}
```

### 2. 定期分析慢查询

```sql
-- 查看储物柜相关的慢查询
SELECT * FROM v_locker_slow_queries;

-- 检查索引使用情况
CALL check_index_usage('litemall_locker');
```

## 实施计划

1. **第一阶段**：添加数据库索引（已完成）
2. **第二阶段**：优化现有分页逻辑
3. **第三阶段**：添加缓存机制
4. **第四阶段**：实施监控和调优

## 注意事项

1. 索引添加后需要观察数据库负载变化
2. 缓存策略需要考虑数据一致性
3. 游标分页不支持跳页，适用于滚动加载场景
4. 深分页问题可通过搜索功能替代