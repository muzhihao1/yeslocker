package org.linlinjava.litemall.db.service;

import org.linlinjava.litemall.db.dao.LitemallUserMapper;
import org.linlinjava.litemall.db.domain.LitemallUserExample;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * 身份验证服务
 * 管理用户身份验证相关业务
 */
@Service
public class LitemallIdentityVerificationService {
    
    @Resource
    private LitemallUserMapper userMapper;
    
    /**
     * 统计已完成身份验证的用户数量
     * @return 已验证用户数量
     */
    public long countVerified() {
        LitemallUserExample example = new LitemallUserExample();
        LitemallUserExample.Criteria criteria = example.createCriteria();
        
        // 假设有身份验证标记字段，这里暂时统计所有用户
        // TODO: 当添加身份验证功能后，需要更新此查询条件
        criteria.andDeletedEqualTo(false);
        // criteria.andIdVerifiedEqualTo(true); // 待添加身份验证字段后启用
        
        return userMapper.countByExample(example);
    }
}