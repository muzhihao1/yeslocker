package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallLockerOperation;
import org.linlinjava.litemall.db.domain.LitemallStorageRequest;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.domain.LitemallVoucher;
import org.linlinjava.litemall.db.service.LitemallLockerOperationService;
import org.linlinjava.litemall.db.service.LitemallLockerService;
import org.linlinjava.litemall.db.service.LitemallStorageRequestService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.db.service.LitemallVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.validation.constraints.NotNull;

@RestController
@RequestMapping("/admin/user")
@Validated
public class AdminUserController {
    private final Log logger = LogFactory.getLog(AdminUserController.class);

    @Autowired
    private LitemallUserService userService;
    
    @Autowired
    private LitemallLockerOperationService lockerOperationService;
    
    @Autowired
    private LitemallStorageRequestService storageRequestService;
    
    @Autowired
    private LitemallVoucherService voucherService;
    
    @Autowired
    private LitemallLockerService lockerService;

    @RequiresPermissions("admin:user:list")
    @RequiresPermissionsDesc(menu = {"用户管理", "会员管理"}, button = "查询")
    @GetMapping("/list")
    public Object list(String username, String mobile,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "add_time") String sort,
                       @Order @RequestParam(defaultValue = "desc") String order) {
        List<LitemallUser> userList = userService.querySelective(username, mobile, page, limit, sort, order);
        return ResponseUtil.okList(userList);
    }
    @RequiresPermissions("admin:user:list")
    @RequiresPermissionsDesc(menu = {"用户管理", "会员管理"}, button = "详情")
    @GetMapping("/detail")
    public Object userDetail(@NotNull Integer id) {
    	LitemallUser user=userService.findById(id);
        return ResponseUtil.ok(user);
    }
    @RequiresPermissions("admin:user:list")
    @RequiresPermissionsDesc(menu = {"用户管理", "会员管理"}, button = "编辑")
    @PostMapping("/update")
    public Object userUpdate(@RequestBody LitemallUser user) {
        return ResponseUtil.ok(userService.updateById(user));
    }
    
    /**
     * 获取用户详细信息
     * 包含用户基本信息、身份验证状态、储物柜使用历史、当前存储状态等
     */
    @RequiresPermissions("admin:user:list")
    @RequiresPermissionsDesc(menu = {"用户管理", "会员管理"}, button = "详情")
    @GetMapping("/{id}/detail")
    public Object userDetail(@PathVariable("id") @NotNull Integer id) {
        // 获取用户基本信息
        LitemallUser user = userService.findById(id);
        if (user == null) {
            return ResponseUtil.fail(404, "用户不存在");
        }
        
        Map<String, Object> data = new HashMap<>();
        
        // 1. 基本用户信息
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("nickname", user.getNickname());
        userInfo.put("realName", user.getRealName());
        userInfo.put("mobile", user.getMobile());
        userInfo.put("avatar", user.getAvatar());
        userInfo.put("gender", user.getGender());
        userInfo.put("birthday", user.getBirthday());
        userInfo.put("userLevel", user.getUserLevel());
        userInfo.put("status", user.getStatus());
        userInfo.put("weixinOpenid", user.getWeixinOpenid());
        userInfo.put("addTime", user.getAddTime());
        userInfo.put("lastLoginTime", user.getLastLoginTime());
        userInfo.put("lastLoginIp", user.getLastLoginIp());
        data.put("user", userInfo);
        
        // 2. 身份验证信息
        Map<String, Object> identityInfo = new HashMap<>();
        identityInfo.put("identityVerified", user.getIdentityVerified());
        identityInfo.put("phoneVerified", user.getPhoneVerified());
        identityInfo.put("identityCard", user.getIdentityCard());
        data.put("identity", identityInfo);
        
        // 3. 当前储物柜信息
        Map<String, Object> currentLockerInfo = new HashMap<>();
        if (user.getLockerId() != null) {
            LitemallLocker locker = lockerService.findById(user.getLockerId());
            if (locker != null) {
                currentLockerInfo.put("lockerId", locker.getId());
                currentLockerInfo.put("lockerNumber", locker.getNumber());
                currentLockerInfo.put("lockerZone", locker.getZone());
                currentLockerInfo.put("lockerStatus", locker.getStatus());
            }
        }
        
        // 4. 查询当前活跃的存储申请
        List<LitemallStorageRequest> activeRequests = storageRequestService.queryActiveByUserId(id);
        if (!activeRequests.isEmpty()) {
            LitemallStorageRequest activeRequest = activeRequests.get(0);
            currentLockerInfo.put("activeRequest", activeRequest);
        }
        data.put("currentLocker", currentLockerInfo);
        
        // 5. 储物柜操作历史（最近20条）
        List<LitemallLockerOperation> operations = lockerOperationService.queryByUser(id, 1, 20);
        data.put("lockerHistory", operations);
        
        // 6. 凭证历史（最近10条）
        List<LitemallVoucher> vouchers = voucherService.queryByUser(id, 1, 10);
        data.put("voucherHistory", vouchers);
        
        // 7. 统计信息
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalStorageCount", lockerOperationService.countByUser(id));
        statistics.put("activeVoucherCount", voucherService.countActiveByUser(id));
        statistics.put("totalVoucherCount", voucherService.countByUser(id));
        data.put("statistics", statistics);
        
        // 8. 会员/VIP状态（暂时使用userLevel字段）
        Map<String, Object> memberInfo = new HashMap<>();
        memberInfo.put("userLevel", user.getUserLevel());
        memberInfo.put("levelName", getUserLevelName(user.getUserLevel()));
        data.put("memberInfo", memberInfo);
        
        return ResponseUtil.ok(data);
    }
    
    /**
     * 获取用户等级名称
     */
    private String getUserLevelName(Byte level) {
        if (level == null) {
            return "普通用户";
        }
        switch (level) {
            case 0:
                return "普通用户";
            case 1:
                return "VIP用户";
            case 2:
                return "高级VIP";
            default:
                return "未知等级";
        }
    }
}
