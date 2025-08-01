package org.linlinjava.litemall.db.service;

import org.linlinjava.litemall.db.dao.LitemallStorageRequestMapper;
import org.linlinjava.litemall.db.domain.LitemallStorageRequest;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LitemallStorageRequestService {
    @Resource
    private LitemallStorageRequestMapper storageRequestMapper;

    /**
     * 创建存取申请
     */
    public LitemallStorageRequest create(Integer userId, Integer lockerId, Integer storeId, String type, String notes) {
        LitemallStorageRequest request = new LitemallStorageRequest();
        request.setRequestCode(storageRequestMapper.generateRequestCode());
        request.setUserId(userId);
        request.setLockerId(lockerId);
        request.setStoreId(storeId);
        request.setType(type);
        request.setStatus("active"); // 直接设为进行中，无需审批
        request.setNotes(notes);
        request.setAddTime(LocalDateTime.now());
        request.setUpdateTime(LocalDateTime.now());
        request.setDeleted(false);
        
        storageRequestMapper.insertSelective(request);
        return request;
    }

    /**
     * 根据ID查询申请
     */
    public LitemallStorageRequest findById(Integer id) {
        return storageRequestMapper.selectByPrimaryKey(id);
    }

    /**
     * 根据申请编号查询
     */
    public LitemallStorageRequest findByRequestCode(String requestCode) {
        return storageRequestMapper.selectByRequestCode(requestCode);
    }

    /**
     * 查询用户的所有申请
     */
    public List<LitemallStorageRequest> queryByUserId(Integer userId) {
        return storageRequestMapper.selectByUserId(userId);
    }

    /**
     * 查询用户的活跃申请
     */
    public List<LitemallStorageRequest> queryActiveByUserId(Integer userId) {
        return storageRequestMapper.selectActiveByUserId(userId);
    }

    /**
     * 确认钥匙归还，完成申请
     */
    public boolean confirmKeyReturn(Integer requestId) {
        LitemallStorageRequest request = findById(requestId);
        if (request == null || !"active".equals(request.getStatus())) {
            return false;
        }
        
        request.setStatus("completed");
        request.setCompletedAt(LocalDateTime.now());
        request.setUpdateTime(LocalDateTime.now());
        
        return storageRequestMapper.updateByPrimaryKeySelective(request) > 0;
    }

    /**
     * 取消申请
     */
    public boolean cancel(Integer requestId) {
        LitemallStorageRequest request = findById(requestId);
        if (request == null || "completed".equals(request.getStatus())) {
            return false;
        }
        
        request.setStatus("cancelled");
        request.setUpdateTime(LocalDateTime.now());
        
        return storageRequestMapper.updateByPrimaryKeySelective(request) > 0;
    }

    /**
     * 检查用户是否有进行中的申请
     */
    public boolean hasActiveRequest(Integer userId) {
        List<LitemallStorageRequest> activeRequests = queryActiveByUserId(userId);
        return !activeRequests.isEmpty();
    }
}