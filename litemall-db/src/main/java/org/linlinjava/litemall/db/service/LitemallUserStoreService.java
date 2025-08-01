package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
import org.linlinjava.litemall.db.dao.LitemallUserStoreMapper;
import org.linlinjava.litemall.db.domain.LitemallUserStore;
import org.linlinjava.litemall.db.domain.LitemallUserStoreExample;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户门店关联服务
 */
@Service
public class LitemallUserStoreService {
    
    @Resource
    private LitemallUserStoreMapper userStoreMapper;

    /**
     * 分配用户到门店
     *
     * @param userId 用户ID
     * @param storeId 门店ID
     * @param isDefault 是否默认门店
     * @return 添加结果
     */
    @Transactional
    public int assignUserToStore(Integer userId, Integer storeId, Boolean isDefault) {
        // 检查是否已存在
        LitemallUserStoreExample example = new LitemallUserStoreExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andStoreIdEqualTo(storeId)
                .andDeletedEqualTo(false);
        
        List<LitemallUserStore> existing = userStoreMapper.selectByExample(example);
        if (!existing.isEmpty()) {
            // 如果已存在，更新状态
            LitemallUserStore userStore = existing.get(0);
            userStore.setIsDefault(isDefault);
            userStore.setUpdateTime(LocalDateTime.now());
            return userStoreMapper.updateByPrimaryKeySelective(userStore);
        }
        
        // 如果设置为默认，取消其他默认
        if (Boolean.TRUE.equals(isDefault)) {
            clearDefaultStore(userId);
        }
        
        // 创建新记录
        LitemallUserStore userStore = new LitemallUserStore();
        userStore.setUserId(userId);
        userStore.setStoreId(storeId);
        userStore.setIsDefault(isDefault);
        userStore.setAddTime(LocalDateTime.now());
        userStore.setUpdateTime(LocalDateTime.now());
        userStore.setDeleted(false);
        
        return userStoreMapper.insertSelective(userStore);
    }

    /**
     * 移除用户与门店的关联
     *
     * @param userId 用户ID
     * @param storeId 门店ID
     * @return 删除结果
     */
    @Transactional
    public int removeUserFromStore(Integer userId, Integer storeId) {
        LitemallUserStoreExample example = new LitemallUserStoreExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andStoreIdEqualTo(storeId)
                .andDeletedEqualTo(false);
        
        List<LitemallUserStore> userStores = userStoreMapper.selectByExample(example);
        if (userStores.isEmpty()) {
            return 0;
        }
        
        LitemallUserStore userStore = userStores.get(0);
        userStore.setDeleted(true);
        userStore.setUpdateTime(LocalDateTime.now());
        
        return userStoreMapper.updateByPrimaryKeySelective(userStore);
    }

    /**
     * 获取用户关联的门店列表
     *
     * @param userId 用户ID
     * @return 门店ID列表
     */
    public List<LitemallUserStore> getUserStores(Integer userId) {
        LitemallUserStoreExample example = new LitemallUserStoreExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andDeletedEqualTo(false);
        example.setOrderByClause("is_default desc, add_time desc");
        
        return userStoreMapper.selectByExample(example);
    }

    /**
     * 获取门店的用户列表
     *
     * @param storeId 门店ID
     * @param page 页码
     * @param limit 每页条数
     * @return 用户列表
     */
    public List<LitemallUserStore> getStoreUsers(Integer storeId, Integer page, Integer limit) {
        LitemallUserStoreExample example = new LitemallUserStoreExample();
        example.createCriteria()
                .andStoreIdEqualTo(storeId)
                .andDeletedEqualTo(false);
        example.setOrderByClause("add_time desc");
        
        if (page != null && limit != null) {
            PageHelper.startPage(page, limit);
        }
        
        return userStoreMapper.selectByExample(example);
    }

    /**
     * 设置用户的默认门店
     *
     * @param userId 用户ID
     * @param storeId 门店ID
     * @return 更新结果
     */
    @Transactional
    public int setDefaultStore(Integer userId, Integer storeId) {
        // 先取消其他默认
        clearDefaultStore(userId);
        
        // 设置新的默认
        LitemallUserStoreExample example = new LitemallUserStoreExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andStoreIdEqualTo(storeId)
                .andDeletedEqualTo(false);
        
        List<LitemallUserStore> userStores = userStoreMapper.selectByExample(example);
        if (userStores.isEmpty()) {
            // 如果不存在关联，创建新的
            return assignUserToStore(userId, storeId, true);
        }
        
        LitemallUserStore userStore = userStores.get(0);
        userStore.setIsDefault(true);
        userStore.setUpdateTime(LocalDateTime.now());
        
        return userStoreMapper.updateByPrimaryKeySelective(userStore);
    }

    /**
     * 获取用户的默认门店
     *
     * @param userId 用户ID
     * @return 默认门店信息
     */
    public LitemallUserStore getUserDefaultStore(Integer userId) {
        LitemallUserStoreExample example = new LitemallUserStoreExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andIsDefaultEqualTo(true)
                .andDeletedEqualTo(false);
        
        List<LitemallUserStore> userStores = userStoreMapper.selectByExample(example);
        return userStores.isEmpty() ? null : userStores.get(0);
    }

    /**
     * 清除用户的默认门店设置
     *
     * @param userId 用户ID
     */
    private void clearDefaultStore(Integer userId) {
        LitemallUserStoreExample example = new LitemallUserStoreExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andIsDefaultEqualTo(true)
                .andDeletedEqualTo(false);
        
        List<LitemallUserStore> defaultStores = userStoreMapper.selectByExample(example);
        for (LitemallUserStore store : defaultStores) {
            store.setIsDefault(false);
            store.setUpdateTime(LocalDateTime.now());
            userStoreMapper.updateByPrimaryKeySelective(store);
        }
    }

    /**
     * 批量分配用户到门店
     *
     * @param userIds 用户ID列表
     * @param storeId 门店ID
     * @return 成功数量
     */
    @Transactional
    public int batchAssignUsersToStore(List<Integer> userIds, Integer storeId) {
        int count = 0;
        for (Integer userId : userIds) {
            count += assignUserToStore(userId, storeId, false);
        }
        return count;
    }

    /**
     * 检查用户是否属于某个门店
     *
     * @param userId 用户ID
     * @param storeId 门店ID
     * @return 是否属于
     */
    public boolean checkUserBelongsToStore(Integer userId, Integer storeId) {
        LitemallUserStoreExample example = new LitemallUserStoreExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andStoreIdEqualTo(storeId)
                .andDeletedEqualTo(false);
        
        return userStoreMapper.countByExample(example) > 0;
    }
}