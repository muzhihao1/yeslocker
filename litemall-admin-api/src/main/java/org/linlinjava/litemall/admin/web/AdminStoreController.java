package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallStore;
import org.linlinjava.litemall.db.service.LitemallStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/admin/store")
@Validated
public class AdminStoreController {
    private final Log logger = LogFactory.getLog(AdminStoreController.class);

    @Autowired
    private LitemallStoreService storeService;

    @RequiresPermissions("admin:store:list")
    @RequiresPermissionsDesc(menu = {"门店管理", "门店列表"}, button = "查询")
    @GetMapping("/list")
    public Object list(String name, String code, String status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "add_time") String sort,
                       @Order @RequestParam(defaultValue = "desc") String order) {
        List<LitemallStore> storeList = storeService.querySelective(
            name, code, status, page, limit, sort, order);
        return ResponseUtil.okList(storeList);
    }

    private Object validate(LitemallStore store) {
        String name = store.getName();
        if (StringUtils.isEmpty(name)) {
            return ResponseUtil.badArgument("门店名称不能为空");
        }

        String code = store.getCode();
        if (StringUtils.isEmpty(code)) {
            return ResponseUtil.badArgument("门店编码不能为空");
        }

        // 检查编码是否重复
        if (store.getId() == null) {
            // 新增时检查
            if (storeService.checkExistByCode(code)) {
                return ResponseUtil.fail(-1, "门店编码已存在");
            }
        } else {
            // 更新时检查（排除自己）
            if (storeService.checkExistByCode(code, store.getId())) {
                return ResponseUtil.fail(-1, "门店编码已存在");
            }
        }

        String address = store.getAddress();
        if (StringUtils.isEmpty(address)) {
            return ResponseUtil.badArgument("门店地址不能为空");
        }

        String phone = store.getPhone();
        if (StringUtils.isEmpty(phone)) {
            return ResponseUtil.badArgument("联系电话不能为空");
        }

        String status = store.getStatus();
        if (StringUtils.isEmpty(status)) {
            return ResponseUtil.badArgument("门店状态不能为空");
        }

        return null;
    }

    @RequiresPermissions("admin:store:create")
    @RequiresPermissionsDesc(menu = {"门店管理", "门店列表"}, button = "添加")
    @PostMapping("/create")
    public Object create(@RequestBody LitemallStore store) {
        Object error = validate(store);
        if (error != null) {
            return error;
        }

        // 设置默认值
        if (store.getLockerCount() == null) {
            store.setLockerCount(0);
        }
        if (StringUtils.isEmpty(store.getStatus())) {
            store.setStatus("ACTIVE");
        }

        storeService.add(store);
        return ResponseUtil.ok(store);
    }

    @RequiresPermissions("admin:store:read")
    @RequiresPermissionsDesc(menu = {"门店管理", "门店列表"}, button = "详情")
    @GetMapping("/detail")
    public Object detail(@NotNull Integer id) {
        LitemallStore store = storeService.findById(id);
        return ResponseUtil.ok(store);
    }

    @RequiresPermissions("admin:store:update")
    @RequiresPermissionsDesc(menu = {"门店管理", "门店列表"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody LitemallStore store) {
        Object error = validate(store);
        if (error != null) {
            return error;
        }
        
        if (storeService.update(store) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok(store);
    }

    @RequiresPermissions("admin:store:delete")
    @RequiresPermissionsDesc(menu = {"门店管理", "门店列表"}, button = "删除")
    @PostMapping("/delete")
    public Object delete(@RequestBody LitemallStore store) {
        Integer id = store.getId();
        if (id == null) {
            return ResponseUtil.badArgument();
        }
        
        // TODO: 检查是否有关联的储物柜，如果有则不允许删除
        // 这需要在实现了储物柜与门店关联后添加检查逻辑
        
        storeService.delete(id);
        return ResponseUtil.ok();
    }

    /**
     * 获取所有有效的门店列表（用于下拉框选择）
     */
    @RequiresPermissions("admin:store:list")
    @RequiresPermissionsDesc(menu = {"门店管理", "门店列表"}, button = "查询")
    @GetMapping("/all")
    public Object all() {
        List<LitemallStore> storeList = storeService.queryAll();
        return ResponseUtil.okList(storeList);
    }
}