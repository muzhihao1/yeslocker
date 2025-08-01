package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
// import org.linlinjava.litemall.core.context.StoreContext;
import org.linlinjava.litemall.db.dao.LitemallLockerMapper;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallLockerExample;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LitemallLockerService {
    @Resource
    private LitemallLockerMapper lockerMapper;

    /**
     * 查询储物柜列表
     */
    public List<LitemallLocker> querySelective(String zone, String status, Integer storeId,
                                               Integer page, Integer limit, String sort, String order) {
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();

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

        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            example.setOrderByClause(sort + " " + order);
        } else {
            example.setOrderByClause("id DESC");
        }

        PageHelper.startPage(page, limit);
        return lockerMapper.selectByExample(example);
    }

    /**
     * 查询门店的储物柜列表
     */
    public List<LitemallLocker> queryByStore(Integer storeId, Integer page, Integer limit) {
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        
        // criteria.andStoreIdEqualTo(storeId);
        criteria.andDeletedEqualTo(false);
        example.setOrderByClause("number ASC");
        
        PageHelper.startPage(page, limit);
        return lockerMapper.selectByExample(example);
    }

    /**
     * 查询可用的储物柜列表
     */
    public List<LitemallLocker> queryAvailable(String zone) {
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        
        // Store filtering - temporarily disabled
        // Integer storeId = StoreContext.getStoreId();
        // if (storeId != null) {
        //     criteria.andStoreIdEqualTo(storeId);
        // }
        
        criteria.andStatusEqualTo("available");
        if (!StringUtils.isEmpty(zone)) {
            criteria.andZoneEqualTo(zone);
        }
        criteria.andDeletedEqualTo(false);
        example.setOrderByClause("number ASC");
        
        return lockerMapper.selectByExample(example);
    }

    /**
     * 根据ID查询储物柜
     */
    public LitemallLocker findById(Integer id) {
        return lockerMapper.selectByPrimaryKey(id);
    }

    /**
     * 统计总储物柜数量
     */
    public long count() {
        LitemallLockerExample example = new LitemallLockerExample();
        example.createCriteria().andDeletedEqualTo(false);
        return lockerMapper.countByExample(example);
    }
    
    /**
     * 统计可用储物柜数量
     */
    public long countAvailable() {
        LitemallLockerExample example = new LitemallLockerExample();
        example.createCriteria()
                .andStatusEqualTo("available")
                .andDeletedEqualTo(false);
        return lockerMapper.countByExample(example);
    }
    
    /**
     * 按区域查询储物柜
     */
    public List<LitemallLocker> queryByZone(String zone) {
        LitemallLockerExample example = new LitemallLockerExample();
        example.createCriteria()
                .andZoneEqualTo(zone)
                .andDeletedEqualTo(false);
        example.setOrderByClause("number ASC");
        return lockerMapper.selectByExample(example);
    }

    /**
     * 根据编号查询储物柜
     */
    public LitemallLocker findByNumber(String number) {
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        criteria.andCabinetNumberEqualTo(number);
        // criteria.andStoreIdEqualTo(StoreContext.getStoreId());
        criteria.andDeletedEqualTo(false);
        List<LitemallLocker> lockers = lockerMapper.selectByExample(example);
        return lockers.isEmpty() ? null : lockers.get(0);
    }

    /**
     * 创建储物柜
     */
    public int add(LitemallLocker locker) {
        locker.setStatus("available");
        locker.setAddTime(LocalDateTime.now());
        locker.setUpdateTime(LocalDateTime.now());
        return lockerMapper.insertSelective(locker);
    }

    /**
     * 批量创建储物柜
     */
    public int batchAdd(List<LitemallLocker> lockers) {
        int count = 0;
        for (LitemallLocker locker : lockers) {
            locker.setStatus("available");
            locker.setAddTime(LocalDateTime.now());
            locker.setUpdateTime(LocalDateTime.now());
            count += lockerMapper.insertSelective(locker);
        }
        return count;
    }

    /**
     * 更新储物柜信息
     */
    public int update(LitemallLocker locker) {
        locker.setUpdateTime(LocalDateTime.now());
        return lockerMapper.updateByPrimaryKeySelective(locker);
    }

    /**
     * 删除储物柜（逻辑删除）
     */
    public void deleteById(Integer id) {
        LitemallLocker locker = new LitemallLocker();
        locker.setId(id);
        locker.setDeleted(true);
        locker.setUpdateTime(LocalDateTime.now());
        lockerMapper.updateByPrimaryKeySelective(locker);
    }

    /**
     * 占用储物柜
     */
    public boolean occupy(Integer id, Integer userId) {
        LitemallLocker locker = findById(id);
        if (locker == null || !"available".equals(locker.getStatus())) {
            return false;
        }
        
        locker.setStatus("occupied");
        locker.setCurrentUserId(userId);
        locker.setLastUsedTime(LocalDateTime.now());
        locker.setUpdateTime(LocalDateTime.now());
        
        return lockerMapper.updateByPrimaryKey(locker) > 0;
    }

    /**
     * 释放储物柜
     */
    public boolean release(Integer id) {
        LitemallLocker locker = findById(id);
        if (locker == null || !"occupied".equals(locker.getStatus())) {
            return false;
        }
        
        locker.setStatus("available");
        locker.setCurrentUserId(null);
        locker.setUpdateTime(LocalDateTime.now());
        
        return lockerMapper.updateByPrimaryKey(locker) > 0;
    }


    /**
     * 统计已占用储物柜数量
     */
    public long countOccupied() {
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        
        // Store filtering - temporarily disabled
        // Integer storeId = StoreContext.getStoreId();
        // if (storeId != null) {
        //     criteria.andStoreIdEqualTo(storeId);
        // }
        
        criteria.andStatusEqualTo("occupied");
        criteria.andDeletedEqualTo(false);
        return lockerMapper.countByExample(example);
    }

    /**
     * 维护储物柜（设置为维护状态）
     */
    public boolean maintain(Integer id, String notes) {
        LitemallLocker locker = findById(id);
        if (locker == null) {
            return false;
        }
        
        locker.setStatus("maintenance");
        locker.setNotes(notes);
        locker.setUpdateTime(LocalDateTime.now());
        
        return lockerMapper.updateByPrimaryKey(locker) > 0;
    }

    /**
     * 完成维护（设置为可用状态）
     */
    public boolean completeMaintenance(Integer id) {
        LitemallLocker locker = findById(id);
        if (locker == null || !"maintenance".equals(locker.getStatus())) {
            return false;
        }
        
        locker.setStatus("available");
        locker.setNotes(null);
        locker.setUpdateTime(LocalDateTime.now());
        
        return lockerMapper.updateByPrimaryKey(locker) > 0;
    }

    /**
     * 检查储物柜编号是否存在
     */
    public boolean checkExist(String number, Integer storeId) {
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();
        criteria.andCabinetNumberEqualTo(number);
        if (storeId != null) {
            criteria.andStoreIdEqualTo(storeId);
        }
        criteria.andDeletedEqualTo(false);
        return lockerMapper.countByExample(example) > 0;
    }

    /**
     * 检查储物柜编号是否存在（使用别名以兼容controller）
     */
    public boolean checkExistByNumber(String number, Integer storeId) {
        return checkExist(number, storeId);
    }

    /**
     * 批量更新储物柜
     * @param ids 储物柜ID列表
     * @param updates 更新的字段（只更新非null字段）
     * @return 更新结果
     */
    public BatchUpdateResult batchUpdate(List<Integer> ids, LitemallLocker updates) {
        BatchUpdateResult result = new BatchUpdateResult();
        result.setTotal(ids.size());
        
        for (Integer id : ids) {
            try {
                LitemallLocker locker = findById(id);
                if (locker == null) {
                    result.addFailed(id, "储物柜不存在");
                    continue;
                }
                
                // 验证状态转换的有效性
                if (updates.getStatus() != null) {
                    if (!isValidStatusTransition(locker.getStatus(), updates.getStatus())) {
                        result.addFailed(id, "无效的状态转换: " + locker.getStatus() + " -> " + updates.getStatus());
                        continue;
                    }
                }
                
                // 设置要更新的字段
                locker.setId(id);
                if (updates.getStatus() != null) {
                    locker.setStatus(updates.getStatus());
                }
                if (updates.getZone() != null) {
                    locker.setZone(updates.getZone());
                }
                if (updates.getNotes() != null) {
                    locker.setNotes(updates.getNotes());
                }
                locker.setUpdateTime(LocalDateTime.now());
                
                int updated = lockerMapper.updateByPrimaryKeySelective(locker);
                if (updated > 0) {
                    result.addSuccess(id);
                } else {
                    result.addFailed(id, "更新失败");
                }
            } catch (Exception e) {
                result.addFailed(id, "更新异常: " + e.getMessage());
            }
        }
        
        return result;
    }

    /**
     * 验证状态转换是否有效
     */
    private boolean isValidStatusTransition(String fromStatus, String toStatus) {
        // 相同状态允许
        if (fromStatus.equals(toStatus)) {
            return true;
        }
        
        // 定义允许的状态转换规则
        switch (fromStatus) {
            case "available":
                return "occupied".equals(toStatus) || "maintenance".equals(toStatus) || "disabled".equals(toStatus);
            case "occupied":
                return "available".equals(toStatus) || "maintenance".equals(toStatus);
            case "maintenance":
                return "available".equals(toStatus) || "disabled".equals(toStatus);
            case "disabled":
                return "available".equals(toStatus) || "maintenance".equals(toStatus);
            default:
                return false;
        }
    }

    /**
     * 批量更新结果类
     */
    public static class BatchUpdateResult {
        private int total;
        private List<Integer> successIds = new ArrayList<>();
        private Map<Integer, String> failedIds = new HashMap<>();

        public void addSuccess(Integer id) {
            successIds.add(id);
        }

        public void addFailed(Integer id, String reason) {
            failedIds.put(id, reason);
        }

        public int getTotal() {
            return total;
        }

        public void setTotal(int total) {
            this.total = total;
        }

        public int getSuccessCount() {
            return successIds.size();
        }

        public int getFailedCount() {
            return failedIds.size();
        }

        public List<Integer> getSuccessIds() {
            return successIds;
        }

        public Map<Integer, String> getFailedIds() {
            return failedIds;
        }
    }
}