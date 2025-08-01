package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallLockerOperation;
import org.linlinjava.litemall.db.domain.LitemallStorageRequest;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallLockerService;
import org.linlinjava.litemall.db.service.LitemallLockerOperationService;
import org.linlinjava.litemall.db.service.LitemallStorageRequestService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 储物柜相关接口
 */
@RestController
@RequestMapping("/wx/locker")
@Validated
public class WxLockerController {
    private final Log logger = LogFactory.getLog(WxLockerController.class);

    @Autowired
    private LitemallLockerService lockerService;
    
    @Autowired
    private LitemallLockerOperationService operationService;
    
    @Autowired
    private LitemallStorageRequestService storageRequestService;
    
    @Autowired
    private LitemallUserService userService;
    
    // TODO: 实现二维码服务
    // @Autowired
    // private QrCodeService qrCodeService;
    
    @Value("${litemall.wx.share:false}")
    private String shareUrl;

    /**
     * 获取可用储物柜列表
     */
    @GetMapping("/available")
    public Object available(@LoginUser Integer userId, 
                          @RequestParam(required = false) String zone,
                          @RequestParam(required = false) Integer storeId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        // 获取用户信息
        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.fail(401, "用户不存在");
        }

        // 如果用户已选择门店，优先使用用户的门店
        Integer targetStoreId = storeId;
        if (targetStoreId == null && user.getStoreId() != null) {
            targetStoreId = user.getStoreId();
        }

        List<LitemallLocker> lockers;
        if (targetStoreId != null) {
            // 按门店ID筛选
            lockers = lockerService.queryAvailableByStore(targetStoreId, zone);
        } else {
            // 全部可用储物柜（用户未选择门店的情况）
            lockers = lockerService.queryAvailable(zone);
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("total", lockers.size());
        data.put("list", lockers);
        data.put("storeId", targetStoreId);
        
        return ResponseUtil.ok(data);
    }

    /**
     * 存储球杆
     */
    @PostMapping("/store")
    public Object store(@LoginUser Integer userId, @RequestBody Map<String, Object> body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        Integer lockerId = (Integer) body.get("lockerId");
        String notes = (String) body.get("notes");
        
        if (lockerId == null) {
            return ResponseUtil.badArgument();
        }

        // 检查用户是否已验证身份
        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.fail(501, "用户不存在");
        }
        // TODO: 实现身份验证检查
        // if (!user.getIdentityVerified()) {
        //     return ResponseUtil.fail(501, "请先进行身份验证");
        // }

        // 检查是否有未完成的存储
        List<LitemallLockerOperation> activeOps = operationService.findActiveByUserId(userId);
        if (!activeOps.isEmpty()) {
            return ResponseUtil.fail(502, "您有未完成的存储操作");
        }

        // 检查储物柜是否可用
        LitemallLocker locker = lockerService.findById(lockerId);
        if (locker == null) {
            return ResponseUtil.fail(503, "储物柜不存在");
        }
        if (!"available".equals(locker.getStatus())) {
            return ResponseUtil.fail(504, "储物柜不可用");
        }

        try {
            // 占用储物柜
            boolean occupied = lockerService.occupy(lockerId, userId);
            if (!occupied) {
                return ResponseUtil.fail(505, "储物柜占用失败");
            }

            // 创建操作记录
            LitemallLockerOperation operation = operationService.createStoreOperation(
                userId, lockerId, notes, null
            );

            // 生成二维码
            String qrContent = "LOCKER:" + operation.getVoucherCode();
            // TODO: 实现二维码生成
            // String qrCodeUrl = qrCodeService.generateQrCode(qrContent, 300);
            String qrCodeUrl = "/storage/qr/" + operation.getVoucherCode() + ".png"; // 临时占位URL
            operationService.updateQrCodeUrl(operation.getId(), qrCodeUrl);

            // 构造返回数据
            Map<String, Object> data = new HashMap<>();
            data.put("operationId", operation.getId());
            data.put("voucherCode", operation.getVoucherCode());
            data.put("qrCodeUrl", qrCodeUrl);
            data.put("lockerId", lockerId);
            data.put("cabinetNumber", locker.getCabinetNumber());
            data.put("zone", locker.getZone());
            data.put("expiredAt", operation.getExpiredAt());

            return ResponseUtil.ok(data);
            
        } catch (Exception e) {
            logger.error("存储球杆失败", e);
            // 回滚储物柜状态
            lockerService.release(lockerId);
            return ResponseUtil.fail(506, e.getMessage());
        }
    }

    // 旧的取回球杆方法已移除 - 现在使用新的请求流程 (WxStorageRequestController)

    /**
     * 查询储物柜状态
     */
    @GetMapping("/status")
    public Object status(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        // 查询活跃的存储记录
        List<LitemallLockerOperation> activeOps = operationService.findActiveByUserId(userId);
        
        Map<String, Object> data = new HashMap<>();
        
        if (activeOps.isEmpty()) {
            data.put("hasActiveStorage", false);
            data.put("activeStorage", null);
        } else {
            LitemallLockerOperation operation = activeOps.get(0);
            LitemallLocker locker = lockerService.findById(operation.getLockerId());
            
            Map<String, Object> activeStorage = new HashMap<>();
            activeStorage.put("operationId", operation.getId());
            activeStorage.put("lockerId", operation.getLockerId());
            activeStorage.put("cabinetNumber", locker.getCabinetNumber());
            activeStorage.put("zone", locker.getZone());
            activeStorage.put("storedAt", operation.getAddTime());
            activeStorage.put("expiredAt", operation.getExpiredAt());
            activeStorage.put("voucherCode", operation.getVoucherCode());
            activeStorage.put("qrCodeUrl", operation.getQrCodeUrl());
            
            // 计算剩余天数
            long daysRemaining = ChronoUnit.DAYS.between(LocalDateTime.now(), operation.getExpiredAt());
            activeStorage.put("daysRemaining", Math.max(0, daysRemaining));
            
            data.put("hasActiveStorage", true);
            data.put("activeStorage", activeStorage);
        }

        return ResponseUtil.ok(data);
    }

    /**
     * 操作历史记录
     */
    @GetMapping("/history")
    public Object history(@LoginUser Integer userId,
                         @RequestParam(defaultValue = "1") Integer page,
                         @RequestParam(defaultValue = "10") Integer limit,
                         @Sort @RequestParam(defaultValue = "add_time") String sort,
                         @Order @RequestParam(defaultValue = "desc") String order) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        List<LitemallLockerOperation> operations = operationService.queryHistory(userId, page, limit);
        
        // 构造返回数据
        List<Map<String, Object>> list = new java.util.ArrayList<>();
        for (LitemallLockerOperation op : operations) {
            LitemallLocker locker = lockerService.findById(op.getLockerId());
            
            Map<String, Object> item = new HashMap<>();
            item.put("id", op.getId());
            item.put("type", op.getType());
            item.put("cabinetNumber", locker.getCabinetNumber());
            item.put("zone", locker.getZone());
            item.put("operatedAt", op.getAddTime());
            item.put("status", op.getStatus());
            item.put("voucherCode", op.getVoucherCode());
            
            list.add(item);
        }

        long total = operationService.count(userId, null, null);
        
        Map<String, Object> data = new HashMap<>();
        data.put("total", total);
        data.put("page", page);
        data.put("limit", limit);
        data.put("list", list);

        return ResponseUtil.ok(data);
    }

    /**
     * 扫描储物柜二维码
     */
    @PostMapping("/scan")
    public Object scan(@LoginUser Integer userId, @RequestBody Map<String, Object> body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        String code = (String) body.get("code");
        if (code == null) {
            return ResponseUtil.badArgument();
        }

        // 解析二维码内容
        if (code.startsWith("LOCKER:")) {
            // 储物柜编号
            String cabinetNumber = code.substring(7);
            LitemallLocker locker = lockerService.findByCabinetNumber(cabinetNumber);
            
            if (locker == null) {
                return ResponseUtil.fail(508, "储物柜不存在");
            }

            Map<String, Object> data = new HashMap<>();
            data.put("type", "locker");
            data.put("lockerId", locker.getId());
            data.put("cabinetNumber", locker.getCabinetNumber());
            data.put("zone", locker.getZone());
            data.put("status", locker.getStatus());
            
            return ResponseUtil.ok(data);
        }

        return ResponseUtil.fail(509, "无效的二维码");
    }

    /**
     * ========== 新流程API（申请制） ==========
     */

    /**
     * 创建存取申请
     */
    @PostMapping("/request/create")
    public Object createRequest(@LoginUser Integer userId, @RequestBody Map<String, Object> body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        String type = (String) body.get("type"); // store 或 retrieve
        String notes = (String) body.get("notes");
        
        if (type == null || (!type.equals("store") && !type.equals("retrieve"))) {
            return ResponseUtil.badArgument();
        }

        // 获取用户信息和专属柜子
        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.fail(501, "用户不存在");
        }
        
        if (user.getLockerId() == null) {
            return ResponseUtil.fail(502, "您还没有分配储物柜，请联系工作人员");
        }

        // 检查是否有进行中的申请
        if (storageRequestService.hasActiveRequest(userId)) {
            return ResponseUtil.fail(503, "您有进行中的申请，请先完成");
        }

        // 获取储物柜信息
        LitemallLocker locker = lockerService.findById(user.getLockerId());
        if (locker == null) {
            return ResponseUtil.fail(504, "储物柜不存在");
        }

        // 检查储物柜状态是否符合操作要求
        if (type.equals("store") && "occupied".equals(locker.getStatus())) {
            return ResponseUtil.fail(505, "储物柜已被占用");
        }
        if (type.equals("retrieve") && !"occupied".equals(locker.getStatus())) {
            return ResponseUtil.fail(506, "储物柜内没有物品");
        }

        try {
            // 创建申请
            LitemallStorageRequest request = storageRequestService.create(
                userId, user.getLockerId(), type, notes
            );

            Map<String, Object> data = new HashMap<>();
            data.put("requestId", request.getId());
            data.put("requestCode", request.getRequestCode());
            data.put("type", request.getType());
            data.put("status", request.getStatus());
            data.put("lockerId", request.getLockerId());
            data.put("cabinetNumber", locker.getCabinetNumber());
            data.put("zone", locker.getZone());
            data.put("createdAt", request.getAddTime());

            return ResponseUtil.ok(data);
            
        } catch (Exception e) {
            logger.error("创建申请失败", e);
            return ResponseUtil.fail(507, "创建申请失败");
        }
    }

    /**
     * 查询申请记录
     */
    @GetMapping("/request/list")
    public Object requestList(@LoginUser Integer userId,
                             @RequestParam(required = false) String type,
                             @RequestParam(defaultValue = "1") Integer page,
                             @RequestParam(defaultValue = "10") Integer limit) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        List<LitemallStorageRequest> requests = storageRequestService.queryByUserId(userId);
        
        // 构造返回数据
        List<Map<String, Object>> list = new java.util.ArrayList<>();
        for (LitemallStorageRequest request : requests) {
            if (type != null && !type.equals(request.getType())) {
                continue;
            }
            
            LitemallLocker locker = lockerService.findById(request.getLockerId());
            
            Map<String, Object> item = new HashMap<>();
            item.put("id", request.getId());
            item.put("requestCode", request.getRequestCode());
            item.put("type", request.getType());
            item.put("status", request.getStatus());
            item.put("cabinetNumber", locker.getCabinetNumber());
            item.put("zone", locker.getZone());
            item.put("createdAt", request.getAddTime());
            item.put("completedAt", request.getCompletedAt());
            
            list.add(item);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("total", list.size());
        data.put("page", page);
        data.put("limit", limit);
        data.put("list", list);

        return ResponseUtil.ok(data);
    }

    /**
     * 查询申请详情
     */
    @GetMapping("/request/detail")
    public Object requestDetail(@LoginUser Integer userId, Integer requestId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        
        if (requestId == null) {
            return ResponseUtil.badArgument();
        }

        LitemallStorageRequest request = storageRequestService.findById(requestId);
        if (request == null) {
            return ResponseUtil.fail(508, "申请不存在");
        }
        
        // 验证是否是用户自己的申请
        if (!request.getUserId().equals(userId)) {
            return ResponseUtil.fail(509, "无权查看此申请");
        }

        LitemallLocker locker = lockerService.findById(request.getLockerId());
        LitemallUser user = userService.findById(userId);

        Map<String, Object> data = new HashMap<>();
        data.put("id", request.getId());
        data.put("requestCode", request.getRequestCode());
        data.put("type", request.getType());
        data.put("status", request.getStatus());
        data.put("notes", request.getNotes());
        data.put("createdAt", request.getAddTime());
        data.put("completedAt", request.getCompletedAt());
        
        // 储物柜信息
        Map<String, Object> lockerInfo = new HashMap<>();
        lockerInfo.put("id", locker.getId());
        lockerInfo.put("cabinetNumber", locker.getCabinetNumber());
        lockerInfo.put("zone", locker.getZone());
        // lockerInfo.put("location", locker.getLocation()); // TODO: Add location field to entity
        data.put("locker", lockerInfo);
        
        // 用户信息
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("nickname", user.getNickname());
        userInfo.put("mobile", user.getMobile());
        data.put("user", userInfo);

        return ResponseUtil.ok(data);
    }

    /**
     * 确认钥匙归还
     */
    @PostMapping("/request/confirm-return")
    public Object confirmKeyReturn(@LoginUser Integer userId, @RequestBody Map<String, Object> body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        Integer requestId = (Integer) body.get("requestId");
        if (requestId == null) {
            return ResponseUtil.badArgument();
        }

        LitemallStorageRequest request = storageRequestService.findById(requestId);
        if (request == null) {
            return ResponseUtil.fail(510, "申请不存在");
        }
        
        // 验证是否是用户自己的申请
        if (!request.getUserId().equals(userId)) {
            return ResponseUtil.fail(511, "无权操作此申请");
        }
        
        // 验证申请状态
        if (!"active".equals(request.getStatus())) {
            return ResponseUtil.fail(512, "申请状态不正确");
        }

        try {
            // 确认钥匙归还
            boolean success = storageRequestService.confirmKeyReturn(requestId);
            if (!success) {
                return ResponseUtil.fail(513, "确认失败");
            }

            // 更新储物柜状态
            LitemallLocker locker = lockerService.findById(request.getLockerId());
            if ("store".equals(request.getType())) {
                locker.setStatus("occupied");
                locker.setCurrentUserId(userId);
            } else {
                locker.setStatus("available");
                locker.setCurrentUserId(null);
            }
            lockerService.update(locker);

            Map<String, Object> data = new HashMap<>();
            data.put("success", true);
            data.put("completedAt", LocalDateTime.now());

            return ResponseUtil.ok(data);
            
        } catch (Exception e) {
            logger.error("确认钥匙归还失败", e);
            return ResponseUtil.fail(514, "操作失败");
        }
    }

    /**
     * 获取用户的储物柜信息
     */
    @GetMapping("/my-locker")
    public Object myLocker(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        LitemallUser user = userService.findById(userId);
        if (user == null || user.getLockerId() == null) {
            Map<String, Object> data = new HashMap<>();
            data.put("hasLocker", false);
            data.put("locker", null);
            return ResponseUtil.ok(data);
        }

        LitemallLocker locker = lockerService.findById(user.getLockerId());
        if (locker == null) {
            Map<String, Object> data = new HashMap<>();
            data.put("hasLocker", false);
            data.put("locker", null);
            return ResponseUtil.ok(data);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("hasLocker", true);
        
        Map<String, Object> lockerInfo = new HashMap<>();
        lockerInfo.put("id", locker.getId());
        lockerInfo.put("cabinetNumber", locker.getCabinetNumber());
        lockerInfo.put("zone", locker.getZone());
        // lockerInfo.put("location", locker.getLocation()); // TODO: Add location field to entity
        lockerInfo.put("status", locker.getStatus());
        // lockerInfo.put("size", locker.getSize()); // TODO: Add size field to entity
        data.put("locker", lockerInfo);

        // 查询活跃申请
        List<LitemallStorageRequest> activeRequests = storageRequestService.queryActiveByUserId(userId);
        data.put("hasActiveRequest", !activeRequests.isEmpty());
        if (!activeRequests.isEmpty()) {
            LitemallStorageRequest activeRequest = activeRequests.get(0);
            Map<String, Object> requestInfo = new HashMap<>();
            requestInfo.put("id", activeRequest.getId());
            requestInfo.put("type", activeRequest.getType());
            requestInfo.put("status", activeRequest.getStatus());
            requestInfo.put("createdAt", activeRequest.getAddTime());
            data.put("activeRequest", requestInfo);
        }

        return ResponseUtil.ok(data);
    }

    /**
     * 分配储物柜给用户（注册时使用）
     */
    @PostMapping("/assign")
    public Object assignLocker(@LoginUser Integer userId, @RequestBody Map<String, Object> body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        String lockerId = (String) body.get("lockerId");
        if (lockerId == null) {
            return ResponseUtil.badArgument();
        }

        // 检查用户是否已有储物柜
        LitemallUser user = userService.findById(userId);
        if (user == null) {
            return ResponseUtil.fail(501, "用户不存在");
        }
        
        if (user.getLockerId() != null) {
            return ResponseUtil.fail(502, "您已经有专属储物柜了");
        }

        // 检查储物柜是否存在且可用
        LitemallLocker locker = lockerService.findById(Integer.valueOf(lockerId));
        if (locker == null) {
            return ResponseUtil.fail(503, "储物柜不存在");
        }
        
        if (!"available".equals(locker.getStatus())) {
            return ResponseUtil.fail(504, "该储物柜不可用");
        }

        try {
            // 分配储物柜给用户
            user.setLockerId(Integer.valueOf(lockerId));
            userService.updateById(user);
            
            // 更新储物柜状态为已分配
            locker.setAssignedUserId(userId);
            locker.setStatus("assigned");
            lockerService.update(locker);

            Map<String, Object> data = new HashMap<>();
            data.put("success", true);
            data.put("lockerId", locker.getId());
            data.put("lockerNumber", locker.getCabinetNumber());
            data.put("zone", locker.getZone());

            return ResponseUtil.ok(data);
            
        } catch (Exception e) {
            logger.error("分配储物柜失败", e);
            return ResponseUtil.fail(505, "分配储物柜失败");
        }
    }
}