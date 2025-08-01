package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.context.StoreContext;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallLockerOperation;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.service.LitemallLockerOperationService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.db.service.LitemallLockerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/locker/operation")
@Validated
public class AdminLockerOperationController {
    private final Log logger = LogFactory.getLog(AdminLockerOperationController.class);

    @Autowired
    private LitemallLockerOperationService operationService;

    @Autowired
    private LitemallUserService userService;

    @Autowired
    private LitemallLockerService lockerService;

    /**
     * 查询操作记录列表
     */
    @RequiresPermissions("admin:lockeroperation:list")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "操作记录"}, button = "查询")
    @GetMapping("/list")
    public Object list(Integer lockerId,
                       Integer userId,
                       String operationType,
                       Integer storeId,
                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "add_time") String sort,
                       @RequestParam(defaultValue = "desc") String order) {

        // 如果没有指定门店ID，使用上下文中的门店ID
        if (storeId == null && StoreContext.hasStoreId()) {
            storeId = StoreContext.getStoreId();
        }
        
        List<LitemallLockerOperation> operationList = operationService.querySelective(
                lockerId, userId, operationType, storeId, startTime, endTime, page, limit, sort, order);

        // Enrich with user and locker information
        for (LitemallLockerOperation operation : operationList) {
            // Add user info
            if (operation.getUserId() != null) {
                LitemallUser user = userService.findById(operation.getUserId());
                if (user != null) {
                    operation.setUserName(user.getNickname());
                    operation.setUserMobile(user.getMobile());
                }
            }
            // Add locker info
            if (operation.getLockerId() != null) {
                LitemallLocker locker = lockerService.findById(operation.getLockerId());
                if (locker != null) {
                    operation.setLockerNumber(locker.getLockerNumber());
                }
            }
        }

        return ResponseUtil.okList(operationList);
    }

    /**
     * 查询操作记录详情
     */
    @RequiresPermissions("admin:lockeroperation:read")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "操作记录"}, button = "详情")
    @GetMapping("/detail")
    public Object detail(@RequestParam Integer id) {
        LitemallLockerOperation operation = operationService.findById(id);
        if (operation == null) {
            return ResponseUtil.badArgumentValue();
        }

        // Enrich with user and locker information
        if (operation.getUserId() != null) {
            LitemallUser user = userService.findById(operation.getUserId());
            if (user != null) {
                operation.setUserName(user.getNickname());
                operation.setUserMobile(user.getMobile());
            }
        }
        if (operation.getLockerId() != null) {
            LitemallLocker locker = lockerService.findById(operation.getLockerId());
            if (locker != null) {
                operation.setLockerNumber(locker.getLockerNumber());
            }
        }

        return ResponseUtil.ok(operation);
    }

    /**
     * 导出操作记录
     */
    @RequiresPermissions("admin:lockeroperation:export")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "操作记录"}, button = "导出")
    @GetMapping("/export")
    public void export(HttpServletResponse response,
                       Integer lockerId,
                       Integer userId,
                       String operationType,
                       Integer storeId,
                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) throws IOException {

        // 如果没有指定门店ID，使用上下文中的门店ID
        if (storeId == null && StoreContext.hasStoreId()) {
            storeId = StoreContext.getStoreId();
        }
        
        List<LitemallLockerOperation> operationList = operationService.queryForExport(
                lockerId, userId, operationType, storeId, startTime, endTime);

        // Enrich with user and locker information
        for (LitemallLockerOperation operation : operationList) {
            if (operation.getUserId() != null) {
                LitemallUser user = userService.findById(operation.getUserId());
                if (user != null) {
                    operation.setUserName(user.getNickname());
                    operation.setUserMobile(user.getMobile());
                }
            }
            if (operation.getLockerId() != null) {
                LitemallLocker locker = lockerService.findById(operation.getLockerId());
                if (locker != null) {
                    operation.setLockerNumber(locker.getLockerNumber());
                }
            }
        }

        // Generate CSV content
        StringBuilder csvContent = new StringBuilder();
        // UTF-8 BOM for Excel compatibility
        csvContent.append("\ufeff");
        // CSV header
        csvContent.append("操作ID,储物柜编号,用户姓名,用户手机号,操作类型,操作时间,操作员,备注\n");

        // CSV data
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (LitemallLockerOperation operation : operationList) {
            csvContent.append(operation.getId()).append(",");
            csvContent.append(operation.getLockerNumber() != null ? operation.getLockerNumber() : "").append(",");
            csvContent.append(operation.getUserName() != null ? operation.getUserName() : "").append(",");
            csvContent.append(operation.getUserMobile() != null ? operation.getUserMobile() : "").append(",");
            csvContent.append(getOperationTypeText(operation.getOperationType())).append(",");
            csvContent.append(operation.getAddTime().format(formatter)).append(",");
            csvContent.append(operation.getOperatorName() != null ? operation.getOperatorName() : "").append(",");
            csvContent.append(operation.getRemark() != null ? operation.getRemark() : "").append("\n");
        }

        // Set response headers
        response.setContentType("text/csv;charset=UTF-8");
        String fileName = "操作记录_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + ".csv";
        response.setHeader("Content-Disposition", "attachment;filename=" + 
                new String(fileName.getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1));

        // Write content
        try (OutputStream out = response.getOutputStream()) {
            out.write(csvContent.toString().getBytes(StandardCharsets.UTF_8));
            out.flush();
        }
    }

    /**
     * 获取操作统计信息
     */
    @RequiresPermissions("admin:lockeroperation:stats")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "操作记录"}, button = "统计")
    @GetMapping("/stats")
    public Object stats(Integer storeId,
                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // 如果没有指定门店ID，使用上下文中的门店ID
        if (storeId == null && StoreContext.hasStoreId()) {
            storeId = StoreContext.getStoreId();
        }
        
        Map<String, Object> data = new HashMap<>();
        
        // Total operations count
        long totalCount = operationService.countSelective(null, null, null, storeId, startTime, endTime);
        data.put("totalCount", totalCount);
        
        // Store operations count
        long storeCount = operationService.countSelective(null, null, "STORE", storeId, startTime, endTime);
        data.put("storeCount", storeCount);
        
        // Retrieve operations count
        long retrieveCount = operationService.countSelective(null, null, "RETRIEVE", storeId, startTime, endTime);
        data.put("retrieveCount", retrieveCount);
        
        // Force retrieve operations count
        long forceRetrieveCount = operationService.countSelective(null, null, "FORCE_RETRIEVE", storeId, startTime, endTime);
        data.put("forceRetrieveCount", forceRetrieveCount);
        
        return ResponseUtil.ok(data);
    }

    private String getOperationTypeText(String operationType) {
        if (operationType == null) {
            return "";
        }
        switch (operationType) {
            case "STORE":
                return "存入";
            case "RETRIEVE":
                return "取出";
            case "FORCE_RETRIEVE":
                return "强制取出";
            default:
                return operationType;
        }
    }
}