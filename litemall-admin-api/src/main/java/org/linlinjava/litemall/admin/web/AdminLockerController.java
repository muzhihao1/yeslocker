package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.context.StoreContext;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallStore;
import org.linlinjava.litemall.db.service.LitemallLockerService;
import org.linlinjava.litemall.db.service.LitemallStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/locker")
@Validated
public class AdminLockerController {
    private final Log logger = LogFactory.getLog(AdminLockerController.class);

    @Autowired
    private LitemallLockerService lockerService;
    
    @Autowired
    private LitemallStoreService storeService;

    @RequiresPermissions("admin:locker:list")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "查询")
    @GetMapping("/list")
    public Object list(String zone, String status, Integer storeId,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "add_time") String sort,
                       @Order @RequestParam(defaultValue = "desc") String order) {
        // 如果没有指定门店ID，使用上下文中的门店ID
        if (storeId == null && StoreContext.hasStoreId()) {
            storeId = StoreContext.getStoreId();
        }
        
        List<LitemallLocker> lockerList = lockerService.querySelective(
            zone, status, storeId, page, limit, sort, order);
            
        // Enrich with store names
        for (LitemallLocker locker : lockerList) {
            if (locker.getStoreId() != null) {
                LitemallStore store = storeService.findById(locker.getStoreId());
                if (store != null) {
                    locker.setStoreName(store.getName());
                }
            }
        }
        
        return ResponseUtil.okList(lockerList);
    }

    @RequiresPermissions("admin:locker:read")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "详情")
    @GetMapping("/detail")
    public Object detail(@NotNull Integer id) {
        LitemallLocker locker = lockerService.findById(id);
        return ResponseUtil.ok(locker);
    }

    @RequiresPermissions("admin:locker:create")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "添加")
    @PostMapping("/create")
    public Object create(@RequestBody LitemallLocker locker) {
        if (locker.getCabinetNumber() == null || locker.getCabinetNumber().trim().isEmpty()) {
            return ResponseUtil.badArgument("储物柜编号不能为空");
        }
        
        // 设置门店ID
        if (locker.getStoreId() == null && StoreContext.hasStoreId()) {
            locker.setStoreId(StoreContext.getStoreId());
        }
        
        if (locker.getStoreId() == null) {
            return ResponseUtil.badArgument("门店ID不能为空");
        }
        
        // 检查编号是否重复
        if (lockerService.checkExistByNumber(locker.getCabinetNumber(), locker.getStoreId())) {
            return ResponseUtil.fail(401, "储物柜编号已存在");
        }
        
        locker.setStatus("available");
        locker.setAddTime(LocalDateTime.now());
        locker.setUpdateTime(LocalDateTime.now());
        locker.setDeleted(false);
        
        lockerService.add(locker);
        return ResponseUtil.ok(locker);
    }

    @RequiresPermissions("admin:locker:update")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody LitemallLocker locker) {
        if (locker.getId() == null) {
            return ResponseUtil.badArgument();
        }
        
        // 确保不能修改门店ID
        LitemallLocker original = lockerService.findById(locker.getId());
        if (original == null) {
            return ResponseUtil.badArgumentValue();
        }
        
        // 如果是跨门店管理员，检查权限
        if (StoreContext.hasStoreId() && !StoreContext.getStoreId().equals(original.getStoreId())) {
            return ResponseUtil.fail(403, "无权操作其他门店的储物柜");
        }
        
        locker.setStoreId(original.getStoreId());
        locker.setUpdateTime(LocalDateTime.now());
        
        lockerService.update(locker);
        return ResponseUtil.ok(locker);
    }

    @RequiresPermissions("admin:locker:delete")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "删除")
    @PostMapping("/delete")
    public Object delete(@RequestBody LitemallLocker locker) {
        Integer id = locker.getId();
        if (id == null) {
            return ResponseUtil.badArgument();
        }
        
        LitemallLocker original = lockerService.findById(id);
        if (original == null) {
            return ResponseUtil.badArgumentValue();
        }
        
        // 如果是跨门店管理员，检查权限
        if (StoreContext.hasStoreId() && !StoreContext.getStoreId().equals(original.getStoreId())) {
            return ResponseUtil.fail(403, "无权操作其他门店的储物柜");
        }
        
        // 检查是否有进行中的操作
        if ("occupied".equals(original.getStatus())) {
            return ResponseUtil.fail(402, "储物柜正在使用中，无法删除");
        }
        
        lockerService.deleteById(id);
        return ResponseUtil.ok();
    }

    @RequiresPermissions("admin:locker:batch")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "批量更新")
    @PostMapping("/batch-update")
    public Object batchUpdate(@RequestBody BatchUpdateRequest request) {
        // 验证参数
        if (request.getIds() == null || request.getIds().isEmpty()) {
            return ResponseUtil.badArgument("请选择要更新的储物柜");
        }
        
        if (request.getIds().size() > 100) {
            return ResponseUtil.badArgument("批量更新最多支持100个储物柜");
        }
        
        // 构建更新对象
        LitemallLocker updates = new LitemallLocker();
        boolean hasUpdate = false;
        
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            if (!isValidStatus(request.getStatus())) {
                return ResponseUtil.badArgument("无效的状态值: " + request.getStatus());
            }
            updates.setStatus(request.getStatus());
            hasUpdate = true;
        }
        
        if (request.getZone() != null && !request.getZone().isEmpty()) {
            updates.setZone(request.getZone());
            hasUpdate = true;
        }
        
        if (request.getNotes() != null) {
            updates.setNotes(request.getNotes());
            hasUpdate = true;
        }
        
        if (!hasUpdate) {
            return ResponseUtil.badArgument("没有要更新的字段");
        }
        
        // 如果是门店管理员，验证所有储物柜都属于其管理的门店
        if (StoreContext.hasStoreId()) {
            Integer storeId = StoreContext.getStoreId();
            for (Integer lockerId : request.getIds()) {
                LitemallLocker locker = lockerService.findById(lockerId);
                if (locker == null || !storeId.equals(locker.getStoreId())) {
                    return ResponseUtil.fail(403, "无权操作储物柜ID: " + lockerId);
                }
            }
        }
        
        // 执行批量更新
        LitemallLockerService.BatchUpdateResult result = lockerService.batchUpdate(request.getIds(), updates);
        
        // 记录操作日志
        logger.info("批量更新储物柜: 总数=" + result.getTotal() + 
                   ", 成功=" + result.getSuccessCount() + 
                   ", 失败=" + result.getFailedCount());
        
        // 返回结果
        Map<String, Object> data = new HashMap<>();
        data.put("total", result.getTotal());
        data.put("successCount", result.getSuccessCount());
        data.put("failedCount", result.getFailedCount());
        data.put("successIds", result.getSuccessIds());
        data.put("failedIds", result.getFailedIds());
        
        return ResponseUtil.ok(data);
    }
    
    private boolean isValidStatus(String status) {
        return "available".equals(status) || 
               "occupied".equals(status) || 
               "maintenance".equals(status) || 
               "disabled".equals(status);
    }
    
    /**
     * 批量更新请求对象
     */
    public static class BatchUpdateRequest {
        private List<Integer> ids;
        private String status;
        private String zone;
        private String notes;
        
        public List<Integer> getIds() {
            return ids;
        }
        
        public void setIds(List<Integer> ids) {
            this.ids = ids;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public String getZone() {
            return zone;
        }
        
        public void setZone(String zone) {
            this.zone = zone;
        }
        
        public String getNotes() {
            return notes;
        }
        
        public void setNotes(String notes) {
            this.notes = notes;
        }
    }
}