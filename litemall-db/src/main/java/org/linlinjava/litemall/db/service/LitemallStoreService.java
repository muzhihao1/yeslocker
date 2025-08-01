package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
import org.linlinjava.litemall.db.dao.LitemallStoreMapper;
import org.linlinjava.litemall.db.domain.LitemallStore;
import org.linlinjava.litemall.db.domain.LitemallStoreExample;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 门店服务类
 */
@Service
public class LitemallStoreService {
    
    @Resource
    private LitemallStoreMapper storeMapper;

    /**
     * 查询门店列表
     */
    public List<LitemallStore> querySelective(String name, String code, String status,
                                              Integer page, Integer limit, String sort, String order) {
        LitemallStoreExample example = new LitemallStoreExample();
        LitemallStoreExample.Criteria criteria = example.createCriteria();

        if (!StringUtils.isEmpty(name)) {
            criteria.andNameLike("%" + name + "%");
        }
        if (!StringUtils.isEmpty(code)) {
            criteria.andCodeEqualTo(code);
        }
        if (!StringUtils.isEmpty(status)) {
            criteria.andStatusEqualTo(status);
        }
        criteria.andDeletedEqualTo(false);

        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            example.setOrderByClause(sort + " " + order);
        }

        PageHelper.startPage(page, limit);
        return storeMapper.selectByExample(example);
    }

    /**
     * 根据ID查询门店
     */
    public LitemallStore findById(Integer id) {
        return storeMapper.selectByPrimaryKey(id);
    }

    /**
     * 根据编码查询门店
     */
    public LitemallStore findByCode(String code) {
        LitemallStoreExample example = new LitemallStoreExample();
        example.createCriteria().andCodeEqualTo(code).andDeletedEqualTo(false);
        List<LitemallStore> stores = storeMapper.selectByExample(example);
        return stores.isEmpty() ? null : stores.get(0);
    }

    /**
     * 查询所有有效门店
     */
    public List<LitemallStore> queryAll() {
        LitemallStoreExample example = new LitemallStoreExample();
        example.createCriteria().andDeletedEqualTo(false).andStatusEqualTo("ACTIVE");
        example.setOrderByClause("add_time desc");
        return storeMapper.selectByExample(example);
    }

    /**
     * 添加门店
     */
    public int add(LitemallStore store) {
        store.setAddTime(LocalDateTime.now());
        store.setUpdateTime(LocalDateTime.now());
        return storeMapper.insertSelective(store);
    }

    /**
     * 更新门店
     */
    public int update(LitemallStore store) {
        store.setUpdateTime(LocalDateTime.now());
        return storeMapper.updateByPrimaryKeySelective(store);
    }

    /**
     * 删除门店（逻辑删除）
     */
    public void delete(Integer id) {
        storeMapper.logicalDeleteByPrimaryKey(id);
    }

    /**
     * 统计门店数量
     */
    public long count() {
        LitemallStoreExample example = new LitemallStoreExample();
        example.createCriteria().andDeletedEqualTo(false);
        return storeMapper.countByExample(example);
    }

    /**
     * 统计指定状态的门店数量
     */
    public long count(String status) {
        LitemallStoreExample example = new LitemallStoreExample();
        LitemallStoreExample.Criteria criteria = example.createCriteria();
        criteria.andDeletedEqualTo(false);
        if (!StringUtils.isEmpty(status)) {
            criteria.andStatusEqualTo(status);
        }
        return storeMapper.countByExample(example);
    }

    /**
     * 更新门店储物柜数量
     */
    public boolean updateLockerCount(Integer storeId, Integer lockerCount) {
        LitemallStore store = findById(storeId);
        if (store == null) {
            return false;
        }
        store.setLockerCount(lockerCount);
        store.setUpdateTime(LocalDateTime.now());
        return storeMapper.updateByPrimaryKeySelective(store) > 0;
    }

    /**
     * 检查门店编码是否存在
     */
    public boolean checkExistByCode(String code) {
        LitemallStoreExample example = new LitemallStoreExample();
        example.createCriteria().andCodeEqualTo(code).andDeletedEqualTo(false);
        return storeMapper.countByExample(example) > 0;
    }

    /**
     * 检查门店编码是否存在（排除指定ID）
     */
    public boolean checkExistByCode(String code, Integer excludeId) {
        LitemallStoreExample example = new LitemallStoreExample();
        example.createCriteria()
            .andCodeEqualTo(code)
            .andIdNotEqualTo(excludeId)
            .andDeletedEqualTo(false);
        return storeMapper.countByExample(example) > 0;
    }
}