package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.JacksonUtil;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallStorageRequest;
import org.linlinjava.litemall.db.domain.LitemallStore;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallLockerService;
import org.linlinjava.litemall.db.service.LitemallStorageRequestService;
import org.linlinjava.litemall.db.service.LitemallStoreService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 存取申请控制器
 * 处理用户的球杆存取申请流程
 */
@RestController
@RequestMapping("/wx/storage")
@Validated
public class WxStorageRequestController {
    private final Log logger = LogFactory.getLog(WxStorageRequestController.class);

    @Autowired
    private LitemallStorageRequestService storageRequestService;
    
    @Autowired
    private LitemallUserService userService;
    
    @Autowired
    private LitemallLockerService lockerService;
    
    @Autowired
    private LitemallStoreService storeService;

    /**
     * 创建存取申请
     * 
     * @param userId 用户ID
     * @param body 请求体 {lockerId: 柜子ID, type: "store"/"retrieve", notes: 备注}
     * @return 申请信息
     */
    @PostMapping("/request")
    @Transactional
    public Object create(@LoginUser Integer userId, @RequestBody String body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        Integer lockerId = JacksonUtil.parseInteger(body, "lockerId");
        String type = JacksonUtil.parseString(body, "type");
        String notes = JacksonUtil.parseString(body, "notes");

        // 参数验证
        if (lockerId == null || type == null) {
            return ResponseUtil.badArgument();
        }
        
        if (!"store".equals(type) && !"retrieve".equals(type)) {
            return ResponseUtil.badArgumentValue();
        }

        // 检查用户信息
        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.fail(401, "用户不存在");
        }

        // 检查用户是否实名认证
        if (user.getIdCardNumber() == null || user.getIdCardNumber().isEmpty()) {
            return ResponseUtil.fail(403, "请先完成实名认证");
        }

        // 检查用户是否已选择门店
        if (user.getStoreId() == null) {
            return ResponseUtil.fail(403, "请先选择您要使用的门店");
        }

        // 检查是否有进行中的申请
        if (storageRequestService.hasActiveRequest(userId)) {
            return ResponseUtil.fail(405, "您有未完成的申请，请先完成或取消");
        }

        // 检查柜子是否存在
        LitemallLocker locker = lockerService.findById(lockerId);
        if (locker == null) {
            return ResponseUtil.fail(404, "柜子不存在");
        }

        // 检查柜子是否属于用户所在门店
        if (!user.getStoreId().equals(locker.getStoreId())) {
            return ResponseUtil.fail(403, "该柜子不属于您选择的门店");
        }

        // 根据类型进行额外验证
        if ("store".equals(type)) {
            // 存入操作：检查柜子是否已被占用
            if ("occupied".equals(locker.getStatus())) {
                return ResponseUtil.fail(406, "该柜子已被占用");
            }
        } else {
            // 取出操作：检查柜子是否被当前用户使用
            if (!"occupied".equals(locker.getStatus()) || !userId.equals(locker.getCurrentUserId())) {
                return ResponseUtil.fail(407, "您未在该柜子存放球杆");
            }
        }

        try {
            // 创建申请
            LitemallStorageRequest request = storageRequestService.create(userId, lockerId, user.getStoreId(), type, notes);
            
            // 构建返回数据
            Map<String, Object> data = new HashMap<>();
            data.put("id", request.getId());
            data.put("requestCode", request.getRequestCode());
            data.put("type", request.getType());
            data.put("status", request.getStatus());
            data.put("lockerId", request.getLockerId());
            data.put("lockerNumber", locker.getCabinetNumber());
            data.put("createTime", request.getAddTime());
            data.put("storeId", request.getStoreId());
            
            // 添加门店信息
            LitemallStore store = storeService.findById(request.getStoreId());
            if (store != null) {
                data.put("storeName", store.getName());
                data.put("storeAddress", store.getAddress());
            }
            
            return ResponseUtil.ok(data);
        } catch (Exception e) {
            logger.error("创建存取申请失败", e);
            return ResponseUtil.fail(500, "创建申请失败，请稍后重试");
        }
    }

    /**
     * 获取申请详情
     * 
     * @param userId 用户ID
     * @param id 申请ID
     * @return 申请详情
     */
    @GetMapping("/request/{id}")
    public Object detail(@LoginUser Integer userId, @PathVariable @NotNull Integer id) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        LitemallStorageRequest request = storageRequestService.findById(id);
        if (request == null) {
            return ResponseUtil.fail(404, "申请不存在");
        }

        // 检查是否是该用户的申请
        if (!userId.equals(request.getUserId())) {
            return ResponseUtil.fail(403, "无权查看此申请");
        }

        // 获取相关信息
        LitemallLocker locker = lockerService.findById(request.getLockerId());
        LitemallUser user = userService.findById(request.getUserId());
        LitemallStore store = storeService.findById(request.getStoreId());

        // 构建返回数据
        Map<String, Object> data = buildRequestData(request, locker, user, store);
        
        return ResponseUtil.ok(data);
    }

    /**
     * 获取用户的申请列表
     * 
     * @param userId 用户ID
     * @param type 申请类型过滤（可选）
     * @param status 状态过滤（可选）
     * @return 申请列表
     */
    @GetMapping("/requests")
    public Object list(@LoginUser Integer userId,
                      @RequestParam(required = false) String type,
                      @RequestParam(required = false) String status) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        // 获取用户的所有申请
        List<LitemallStorageRequest> requests = storageRequestService.queryByUserId(userId);

        // 过滤
        if (type != null && !type.isEmpty()) {
            requests = requests.stream()
                .filter(r -> type.equals(r.getType()))
                .collect(Collectors.toList());
        }
        
        if (status != null && !status.isEmpty()) {
            requests = requests.stream()
                .filter(r -> status.equals(r.getStatus()))
                .collect(Collectors.toList());
        }

        // 按创建时间倒序排序
        requests.sort((a, b) -> b.getAddTime().compareTo(a.getAddTime()));

        // 构建返回数据
        List<Map<String, Object>> dataList = new ArrayList<>();
        for (LitemallStorageRequest request : requests) {
            LitemallLocker locker = lockerService.findById(request.getLockerId());
            LitemallStore store = storeService.findById(request.getStoreId());
            
            Map<String, Object> item = new HashMap<>();
            item.put("id", request.getId());
            item.put("requestCode", request.getRequestCode());
            item.put("type", request.getType());
            item.put("status", request.getStatus());
            item.put("lockerNumber", locker != null ? locker.getCabinetNumber() : "");
            item.put("createTime", request.getAddTime());
            item.put("completedTime", request.getCompletedAt());
            
            // 添加状态描述
            String statusDesc = getStatusDescription(request.getStatus());
            item.put("statusDesc", statusDesc);
            
            // 添加门店信息
            if (store != null) {
                item.put("storeName", store.getName());
                item.put("storeId", store.getId());
            }
            
            dataList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", dataList);
        result.put("total", dataList.size());
        
        return ResponseUtil.ok(result);
    }

    /**
     * 确认钥匙已归还
     * 
     * @param userId 用户ID
     * @param body 请求体 {requestId: 申请ID}
     * @return 操作结果
     */
    @PostMapping("/confirm-key-return")
    @Transactional
    public Object confirmKeyReturn(@LoginUser Integer userId, @RequestBody String body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        Integer requestId = JacksonUtil.parseInteger(body, "requestId");
        if (requestId == null) {
            return ResponseUtil.badArgument();
        }

        // 获取申请信息
        LitemallStorageRequest request = storageRequestService.findById(requestId);
        if (request == null) {
            return ResponseUtil.fail(404, "申请不存在");
        }

        // 检查是否是该用户的申请
        if (!userId.equals(request.getUserId())) {
            return ResponseUtil.fail(403, "无权操作此申请");
        }

        // 检查申请状态
        if (!"active".equals(request.getStatus())) {
            return ResponseUtil.fail(408, "申请状态不正确");
        }

        try {
            // 确认钥匙归还
            boolean success = storageRequestService.confirmKeyReturn(requestId);
            if (!success) {
                return ResponseUtil.fail(500, "操作失败，请稍后重试");
            }

            // 如果是存入操作，更新柜子状态
            if ("store".equals(request.getType())) {
                LitemallLocker locker = lockerService.findById(request.getLockerId());
                if (locker != null) {
                    locker.setStatus("occupied");
                    locker.setCurrentUserId(userId);
                    locker.setLastUsedTime(LocalDateTime.now());
                    locker.setUpdateTime(LocalDateTime.now());
                    lockerService.update(locker);
                }
            } else if ("retrieve".equals(request.getType())) {
                // 如果是取出操作，释放柜子
                LitemallLocker locker = lockerService.findById(request.getLockerId());
                if (locker != null) {
                    locker.setStatus("available");
                    locker.setCurrentUserId(null);
                    locker.setUpdateTime(LocalDateTime.now());
                    lockerService.update(locker);
                }
            }

            return ResponseUtil.ok();
        } catch (Exception e) {
            logger.error("确认钥匙归还失败", e);
            return ResponseUtil.fail(500, "操作失败，请稍后重试");
        }
    }

    /**
     * 获取用户的活跃申请
     * 
     * @param userId 用户ID
     * @return 活跃申请信息
     */
    @GetMapping("/active-request")
    public Object getActiveRequest(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        List<LitemallStorageRequest> activeRequests = storageRequestService.queryActiveByUserId(userId);
        
        if (activeRequests.isEmpty()) {
            return ResponseUtil.ok(null);
        }

        // 一般情况下只有一个活跃申请
        LitemallStorageRequest request = activeRequests.get(0);
        LitemallLocker locker = lockerService.findById(request.getLockerId());
        LitemallUser user = userService.findById(request.getUserId());
        LitemallStore store = storeService.findById(request.getStoreId());

        Map<String, Object> data = buildRequestData(request, locker, user, store);
        
        return ResponseUtil.ok(data);
    }

    /**
     * 取消申请
     * 
     * @param userId 用户ID
     * @param body 请求体 {requestId: 申请ID}
     * @return 操作结果
     */
    @PostMapping("/cancel")
    @Transactional
    public Object cancel(@LoginUser Integer userId, @RequestBody String body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        Integer requestId = JacksonUtil.parseInteger(body, "requestId");
        if (requestId == null) {
            return ResponseUtil.badArgument();
        }

        // 获取申请信息
        LitemallStorageRequest request = storageRequestService.findById(requestId);
        if (request == null) {
            return ResponseUtil.fail(404, "申请不存在");
        }

        // 检查是否是该用户的申请
        if (!userId.equals(request.getUserId())) {
            return ResponseUtil.fail(403, "无权操作此申请");
        }

        // 检查申请状态
        if ("completed".equals(request.getStatus())) {
            return ResponseUtil.fail(409, "已完成的申请无法取消");
        }

        try {
            boolean success = storageRequestService.cancel(requestId);
            if (!success) {
                return ResponseUtil.fail(500, "操作失败，请稍后重试");
            }

            return ResponseUtil.ok();
        } catch (Exception e) {
            logger.error("取消申请失败", e);
            return ResponseUtil.fail(500, "操作失败，请稍后重试");
        }
    }

    /**
     * 构建申请详情数据
     */
    private Map<String, Object> buildRequestData(LitemallStorageRequest request, 
                                                LitemallLocker locker, 
                                                LitemallUser user,
                                                LitemallStore store) {
        Map<String, Object> data = new HashMap<>();
        
        // 基本信息
        data.put("id", request.getId());
        data.put("requestCode", request.getRequestCode());
        data.put("type", request.getType());
        data.put("status", request.getStatus());
        data.put("notes", request.getNotes());
        data.put("createTime", request.getAddTime());
        data.put("approvedTime", request.getApprovedAt());
        data.put("completedTime", request.getCompletedAt());
        
        // 状态描述
        data.put("statusDesc", getStatusDescription(request.getStatus()));
        data.put("typeDesc", getTypeDescription(request.getType()));
        
        // 柜子信息
        if (locker != null) {
            Map<String, Object> lockerInfo = new HashMap<>();
            lockerInfo.put("id", locker.getId());
            lockerInfo.put("lockerNumber", locker.getCabinetNumber());
            lockerInfo.put("zone", locker.getZone());
            lockerInfo.put("status", locker.getStatus());
            data.put("locker", lockerInfo);
        }
        
        // 用户信息
        if (user != null) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("nickname", user.getNickname());
            userInfo.put("mobile", user.getMobile());
            data.put("user", userInfo);
        }
        
        // 门店信息
        if (store != null) {
            Map<String, Object> storeInfo = new HashMap<>();
            storeInfo.put("id", store.getId());
            storeInfo.put("name", store.getName());
            storeInfo.put("code", store.getCode());
            storeInfo.put("address", store.getAddress());
            storeInfo.put("phone", store.getPhone());
            data.put("store", storeInfo);
        }
        
        // 添加操作提示
        if ("active".equals(request.getStatus())) {
            data.put("actionTip", "请前往前台领取钥匙进行操作");
        }
        
        return data;
    }

    /**
     * 获取状态描述
     */
    private String getStatusDescription(String status) {
        switch (status) {
            case "active":
                return "进行中";
            case "completed":
                return "已完成";
            case "cancelled":
                return "已取消";
            default:
                return "未知";
        }
    }

    /**
     * 获取类型描述
     */
    private String getTypeDescription(String type) {
        switch (type) {
            case "store":
                return "存入";
            case "retrieve":
                return "取出";
            default:
                return type;
        }
    }
}