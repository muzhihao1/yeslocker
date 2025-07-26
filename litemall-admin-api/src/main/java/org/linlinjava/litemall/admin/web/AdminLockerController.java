package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.service.LitemallLockerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/admin/locker")
@Validated
public class AdminLockerController {
    private final Log logger = LogFactory.getLog(AdminLockerController.class);

    @Autowired
    private LitemallLockerService lockerService;

    @RequiresPermissions("admin:locker:list")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "查询")
    @GetMapping("/list")
    public Object list(String cabinetNumber, String zone, String status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "add_time") String sort,
                       @Order @RequestParam(defaultValue = "desc") String order) {
        List<LitemallLocker> lockerList = lockerService.querySelective(
            cabinetNumber, zone, status, page, limit, sort, order);
        return ResponseUtil.okList(lockerList);
    }

    @RequiresPermissions("admin:locker:read")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "详情")
    @GetMapping("/detail")
    public Object detail(@NotNull Integer id) {
        LitemallLocker locker = lockerService.findById(id);
        return ResponseUtil.ok(locker);
    }

    @RequiresPermissions("admin:locker:update")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody LitemallLocker locker) {
        if (locker.getId() == null) {
            return ResponseUtil.badArgument();
        }
        
        if (lockerService.updateById(locker) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok();
    }
}