package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
// import org.linlinjava.litemall.core.context.StoreContext;
import org.linlinjava.litemall.db.dao.LitemallLockerOperationMapper;
import org.linlinjava.litemall.db.domain.LitemallLockerOperation;
import org.linlinjava.litemall.db.domain.LitemallLockerOperationExample;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class LitemallLockerOperationService {
    @Resource
    private LitemallLockerOperationMapper lockerOperationMapper;

    /**
     * 查询操作记录
     */
    public List<LitemallLockerOperation> querySelective(Integer lockerId, Integer userId, 
                                                       String operationType, LocalDateTime startTime, 
                                                       LocalDateTime endTime, Integer page, 
                                                       Integer limit, String sort, String order) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();

        // Store filtering based on context - temporarily disabled
        // Integer storeId = StoreContext.getStoreId();
        // if (storeId != null) {
        //     criteria.andStoreIdEqualTo(storeId);
        // }

        if (lockerId != null) {
            criteria.andLockerIdEqualTo(lockerId);
        }
        if (userId != null) {
            criteria.andUserIdEqualTo(userId);
        }
        if (!StringUtils.isEmpty(operationType)) {
            criteria.andTypeEqualTo(operationType);
        }
        if (startTime != null) {
            criteria.andAddTimeGreaterThanOrEqualTo(startTime);
        }
        if (endTime != null) {
            criteria.andAddTimeLessThanOrEqualTo(endTime);
        }
        criteria.andDeletedEqualTo(false);

        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            example.setOrderByClause(sort + " " + order);
        } else {
            example.setOrderByClause("add_time DESC");
        }

        PageHelper.startPage(page, limit);
        return lockerOperationMapper.selectByExample(example);
    }

    /**
     * 查询指定门店的操作记录
     */
    public List<LitemallLockerOperation> queryByStore(Integer storeId, Integer page, Integer limit) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();
        
        // criteria.andStoreIdEqualTo(storeId);
        criteria.andDeletedEqualTo(false);
        example.setOrderByClause("add_time DESC");
        
        PageHelper.startPage(page, limit);
        return lockerOperationMapper.selectByExample(example);
    }

    /**
     * 查询用户历史存储记录
     */
    public List<LitemallLockerOperation> queryByUser(Integer userId, Integer page, Integer limit) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();
        criteria.andUserIdEqualTo(userId);
        criteria.andDeletedEqualTo(false);
        example.setOrderByClause("add_time DESC");
        
        PageHelper.startPage(page, limit);
        return lockerOperationMapper.selectByExample(example);
    }

    /**
     * 查询用户当前存储记录（未取出的）
     */
    public List<LitemallLockerOperation> queryActiveByUser(Integer userId) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();
        criteria.andUserIdEqualTo(userId);
        criteria.andStatusEqualTo("active");
        criteria.andDeletedEqualTo(false);
        example.setOrderByClause("add_time DESC");
        
        return lockerOperationMapper.selectByExample(example);
    }

    /**
     * 根据凭证码查询记录
     */
    public LitemallLockerOperation findByVoucherCode(String voucherCode) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();
        criteria.andVoucherCodeEqualTo(voucherCode);
        criteria.andDeletedEqualTo(false);
        List<LitemallLockerOperation> operations = lockerOperationMapper.selectByExample(example);
        return operations.isEmpty() ? null : operations.get(0);
    }

    /**
     * 创建操作记录
     */
    public int add(LitemallLockerOperation operation) {
        operation.setAddTime(LocalDateTime.now());
        operation.setUpdateTime(LocalDateTime.now());
        return lockerOperationMapper.insertSelective(operation);
    }

    /**
     * 更新操作记录
     */
    public int update(LitemallLockerOperation operation) {
        operation.setUpdateTime(LocalDateTime.now());
        return lockerOperationMapper.updateByPrimaryKeySelective(operation);
    }

    /**
     * 统计今日存储数量
     */
    public long countTodayStore(LocalDateTime startOfDay, LocalDateTime endOfDay) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();
        
        // Store filtering - temporarily disabled
        // Integer storeId = StoreContext.getStoreId();
        // if (storeId != null) {
        //     criteria.andStoreIdEqualTo(storeId);
        // }
        
        criteria.andTypeEqualTo("store");
        criteria.andAddTimeGreaterThanOrEqualTo(startOfDay);
        criteria.andAddTimeLessThanOrEqualTo(endOfDay);
        criteria.andDeletedEqualTo(false);
        
        return lockerOperationMapper.countByExample(example);
    }

    /**
     * 统计今日取出数量
     */
    public long countTodayRetrieve(LocalDateTime startOfDay, LocalDateTime endOfDay) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();
        
        // Store filtering - temporarily disabled
        // Integer storeId = StoreContext.getStoreId();
        // if (storeId != null) {
        //     criteria.andStoreIdEqualTo(storeId);
        // }
        
        criteria.andTypeEqualTo("retrieve");
        criteria.andAddTimeGreaterThanOrEqualTo(startOfDay);
        criteria.andAddTimeLessThanOrEqualTo(endOfDay);
        criteria.andDeletedEqualTo(false);
        
        return lockerOperationMapper.countByExample(example);
    }

    /**
     * 统计当前使用中的储物柜数量
     */
    public long countActiveOperations() {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();
        
        // Store filtering - temporarily disabled
        // Integer storeId = StoreContext.getStoreId();
        // if (storeId != null) {
        //     criteria.andStoreIdEqualTo(storeId);
        // }
        
        criteria.andStatusEqualTo("active");
        criteria.andDeletedEqualTo(false);
        
        return lockerOperationMapper.countByExample(example);
    }

    /**
     * 根据ID查询操作记录
     */
    public LitemallLockerOperation findById(Integer id) {
        return lockerOperationMapper.selectByPrimaryKey(id);
    }

    /**
     * 删除操作记录（逻辑删除）
     */
    public void deleteById(Integer id) {
        LitemallLockerOperation operation = new LitemallLockerOperation();
        operation.setId(id);
        operation.setDeleted(true);
        operation.setUpdateTime(LocalDateTime.now());
        lockerOperationMapper.updateByPrimaryKeySelective(operation);
    }
    
    /**
     * 统计用户的操作次数
     */
    public long countByUser(Integer userId) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andDeletedEqualTo(false);
        
        return lockerOperationMapper.countByExample(example);
    }
    
    /**
     * 更新过期状态
     * @return 更新的记录数
     */
    public int updateExpiredStatus() {
        // TODO: Implement actual logic to update expired records
        // This is a placeholder for compilation
        return 0;
    }
    
    /**
     * 查找即将过期的操作记录
     * @param days 天数
     * @return 即将过期的操作列表
     */
    public List<LitemallLockerOperation> findExpiringSoon(int days) {
        // TODO: Implement actual logic to find expiring records
        // This is a placeholder for compilation
        return new ArrayList<>();
    }
    
    /**
     * 按类型和时间范围统计操作数量
     * @param type 操作类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作数量
     */
    public long countByTypeAndTimeRange(String type, LocalDateTime startTime, LocalDateTime endTime) {
        LitemallLockerOperationExample example = new LitemallLockerOperationExample();
        LitemallLockerOperationExample.Criteria criteria = example.createCriteria();
        
        criteria.andTypeEqualTo(type);
        if (startTime != null) {
            criteria.andAddTimeGreaterThanOrEqualTo(startTime);
        }
        if (endTime != null) {
            criteria.andAddTimeLessThanOrEqualTo(endTime);
        }
        criteria.andDeletedEqualTo(false);
        
        return lockerOperationMapper.countByExample(example);
    }
}