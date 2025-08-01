package org.linlinjava.litemall.db.service;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.linlinjava.litemall.db.dao.LitemallLockerMapper;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallLockerExample;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.List;

/**
 * 优化的储物柜查询服务
 * 实现了分页优化、缓存和查询性能改进
 */
@Service
public class OptimizedLockerQueryService {
    
    @Resource
    private LitemallLockerMapper lockerMapper;
    
    /**
     * 优化的储物柜列表查询
     * 特点：
     * 1. 参数验证和标准化
     * 2. 优化的排序策略
     * 3. 可选的总数查询
     */
    public org.linlinjava.litemall.db.util.PageHelper.PageResult<LitemallLocker> queryLockersOptimized(
            String zone, String status, Integer storeId,
            Integer page, Integer limit, String sort, String order,
            boolean needCount) {
        
        // 1. 标准化分页参数
        org.linlinjava.litemall.db.util.PageHelper.PageParam pageParam = 
            org.linlinjava.litemall.db.util.PageHelper.normalize(page, limit);
        
        // 2. 构建查询条件
        LitemallLockerExample example = buildOptimizedExample(zone, status, storeId, sort, order);
        
        // 3. 执行分页查询
        Page<LitemallLocker> pageResult = PageHelper.startPage(
            pageParam.getPage(), 
            pageParam.getLimit(), 
            needCount
        );
        
        List<LitemallLocker> lockers = lockerMapper.selectByExample(example);
        
        // 4. 返回优化的分页结果
        return org.linlinjava.litemall.db.util.PageHelper.fromPage(pageResult);
    }
    
    /**
     * 游标分页查询（适用于大数据量）
     * 使用 ID 作为游标，避免深分页问题
     */
    public List<LitemallLocker> queryCursorBased(
            Integer lastId, Integer limit, String zone, String status, Integer storeId) {
        
        // 限制单次查询数量
        if (limit == null || limit < 1) {
            limit = 20;
        }
        if (limit > 100) {
            limit = 100;
        }
        
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        
        // 使用 ID 作为游标
        if (lastId != null && lastId > 0) {
            criteria.andIdGreaterThan(lastId);
        }
        
        // 添加查询条件
        if (storeId != null) {
            criteria.andStoreIdEqualTo(storeId);
        }
        if (!StringUtils.isEmpty(zone)) {
            criteria.andZoneEqualTo(zone);
        }
        if (!StringUtils.isEmpty(status)) {
            criteria.andStatusEqualTo(status);
        }
        criteria.andDeletedEqualTo(false);
        
        // 按 ID 升序，确保稳定的游标
        example.setOrderByClause("id ASC");
        
        // 使用 PageHelper 限制结果集，但不执行 COUNT
        PageHelper.startPage(1, limit, false);
        return lockerMapper.selectByExample(example);
    }
    
    /**
     * 缓存的可用储物柜查询
     * 使用 Spring Cache 缓存结果
     */
    @Cacheable(value = "locker:available", 
               key = "#storeId + ':' + #zone", 
               condition = "#limit <= 100")
    public List<LitemallLocker> queryAvailableCached(
            Integer storeId, String zone, Integer limit) {
        
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        
        if (storeId != null) {
            criteria.andStoreIdEqualTo(storeId);
        }
        criteria.andStatusEqualTo("available");
        if (!StringUtils.isEmpty(zone)) {
            criteria.andZoneEqualTo(zone);
        }
        criteria.andDeletedEqualTo(false);
        
        // 使用优化的排序（利用复合索引）
        example.setOrderByClause("zone ASC, cabinet_number ASC");
        
        if (limit != null && limit > 0) {
            PageHelper.startPage(1, limit, false);
        }
        
        return lockerMapper.selectByExample(example);
    }
    
    /**
     * 构建优化的查询条件
     * 根据查询参数选择最佳的排序策略
     */
    private LitemallLockerExample buildOptimizedExample(
            String zone, String status, Integer storeId,
            String sort, String order) {
        
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        
        // 添加查询条件
        if (storeId != null) {
            criteria.andStoreIdEqualTo(storeId);
        }
        if (!StringUtils.isEmpty(zone)) {
            criteria.andZoneEqualTo(zone);
        }
        if (!StringUtils.isEmpty(status)) {
            criteria.andStatusEqualTo(status);
        }
        criteria.andDeletedEqualTo(false);
        
        // 优化排序策略
        String orderByClause = getOptimalOrderBy(zone, status, sort, order);
        example.setOrderByClause(orderByClause);
        
        return example;
    }
    
    /**
     * 获取最优的排序策略
     * 根据查询条件选择能够利用索引的排序方式
     */
    private String getOptimalOrderBy(String zone, String status, String sort, String order) {
        // 如果指定了排序字段
        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            // 验证排序字段和顺序
            if (isValidSortField(sort) && isValidOrder(order)) {
                return sort + " " + order;
            }
        }
        
        // 根据查询条件选择最优排序
        // 如果按区域查询，使用区域+编号排序（有复合索引 idx_store_zone_status）
        if (!StringUtils.isEmpty(zone)) {
            return "zone ASC, cabinet_number ASC";
        }
        
        // 如果按状态查询，使用状态+ID排序（有复合索引 idx_store_status_deleted）
        if (!StringUtils.isEmpty(status)) {
            return "status ASC, id DESC";
        }
        
        // 默认按ID倒序（主键索引）
        return "id DESC";
    }
    
    /**
     * 验证排序字段是否有效
     */
    private boolean isValidSortField(String field) {
        return "id".equals(field) || "cabinet_number".equals(field) || 
               "zone".equals(field) || "status".equals(field) || 
               "last_used_time".equals(field) || "add_time".equals(field);
    }
    
    /**
     * 验证排序顺序是否有效
     */
    private boolean isValidOrder(String order) {
        return "ASC".equalsIgnoreCase(order) || "DESC".equalsIgnoreCase(order);
    }
    
    /**
     * 高性能的统计查询
     * 使用单个查询获取多个统计值
     */
    @Cacheable(value = "locker:stats", key = "#storeId")
    public LockerStats getStoreStats(Integer storeId) {
        // 这里应该使用自定义的 Mapper 方法，执行优化的统计 SQL
        // 示例：
        // return lockerMapper.selectStoreStats(storeId);
        
        // 临时实现
        LockerStats stats = new LockerStats();
        
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        if (storeId != null) {
            criteria.andStoreIdEqualTo(storeId);
        }
        criteria.andDeletedEqualTo(false);
        
        // 总数
        stats.setTotal(lockerMapper.countByExample(example));
        
        // 可用数量
        example.clear();
        criteria = example.createCriteria();
        if (storeId != null) {
            criteria.andStoreIdEqualTo(storeId);
        }
        criteria.andStatusEqualTo("available");
        criteria.andDeletedEqualTo(false);
        stats.setAvailable(lockerMapper.countByExample(example));
        
        // 占用数量
        example.clear();
        criteria = example.createCriteria();
        if (storeId != null) {
            criteria.andStoreIdEqualTo(storeId);
        }
        criteria.andStatusEqualTo("occupied");
        criteria.andDeletedEqualTo(false);
        stats.setOccupied(lockerMapper.countByExample(example));
        
        // 维护数量
        example.clear();
        criteria = example.createCriteria();
        if (storeId != null) {
            criteria.andStoreIdEqualTo(storeId);
        }
        criteria.andStatusEqualTo("maintenance");
        criteria.andDeletedEqualTo(false);
        stats.setMaintenance(lockerMapper.countByExample(example));
        
        return stats;
    }
    
    /**
     * 储物柜统计信息类
     */
    public static class LockerStats {
        private long total;
        private long available;
        private long occupied;
        private long maintenance;
        
        // Getters and setters
        public long getTotal() {
            return total;
        }
        
        public void setTotal(long total) {
            this.total = total;
        }
        
        public long getAvailable() {
            return available;
        }
        
        public void setAvailable(long available) {
            this.available = available;
        }
        
        public long getOccupied() {
            return occupied;
        }
        
        public void setOccupied(long occupied) {
            this.occupied = occupied;
        }
        
        public long getMaintenance() {
            return maintenance;
        }
        
        public void setMaintenance(long maintenance) {
            this.maintenance = maintenance;
        }
    }
}