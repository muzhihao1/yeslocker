package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.util.LockerUtil;
import org.linlinjava.litemall.db.domain.LitemallLockerOperation;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallLockerOperationService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 凭证相关接口
 * 简化版本：只提供查看和验证功能
 */
@RestController
@RequestMapping("/wx/voucher")
@Validated
public class WxVoucherController {
    private final Log logger = LogFactory.getLog(WxVoucherController.class);

    @Autowired
    private LitemallLockerOperationService operationService;
    
    @Autowired
    private LitemallUserService userService;

    /**
     * 获取凭证详情
     * 店员可查看凭证信息和日期
     */
    @GetMapping("/{code}")
    public Object getVoucherDetail(@PathVariable @NotEmpty String code) {
        try {
            LitemallLockerOperation operation = operationService.findByVoucherCode(code);
            
            if (operation == null) {
                return ResponseUtil.fail(404, "凭证不存在");
            }
            
            // 获取用户信息
            LitemallUser user = userService.findById(operation.getUserId());
            
            Map<String, Object> data = new HashMap<>();
            data.put("voucherCode", operation.getVoucherCode());
            data.put("operationType", operation.getOperationType());
            data.put("status", operation.getStatus());
            data.put("createdAt", operation.getAddTime());
            data.put("expiredAt", operation.getExpiredAt());
            data.put("isExpired", LockerUtil.isVoucherExpired(operation.getExpiredAt()));
            data.put("daysRemaining", LockerUtil.calculateDaysRemaining(operation.getExpiredAt()));
            
            // 用户信息（供店员确认）
            if (user != null) {
                data.put("userName", user.getNickname());
                data.put("userPhone", user.getMobile());
            }
            
            // 储物柜信息
            if (operation.getLockerId() != null) {
                data.put("lockerId", operation.getLockerId());
                // TODO: 添加储物柜位置信息
            }
            
            return ResponseUtil.ok(data);
            
        } catch (Exception e) {
            logger.error("获取凭证详情失败", e);
            return ResponseUtil.serious();
        }
    }

    /**
     * 验证凭证有效性
     * 用于扫码或输入凭证码时验证
     */
    @PostMapping("/validate")
    public Object validateVoucher(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        
        if (code == null || code.trim().isEmpty()) {
            return ResponseUtil.badArgument();
        }
        
        try {
            LitemallLockerOperation operation = operationService.findByVoucherCode(code);
            
            if (operation == null) {
                return ResponseUtil.fail(404, "凭证不存在");
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("valid", true);
            result.put("voucherCode", operation.getVoucherCode());
            result.put("status", operation.getStatus());
            result.put("operationType", operation.getOperationType());
            result.put("isExpired", LockerUtil.isVoucherExpired(operation.getExpiredAt()));
            
            // 检查凭证状态
            if ("COMPLETED".equals(operation.getStatus()) || "CANCELLED".equals(operation.getStatus())) {
                result.put("valid", false);
                result.put("reason", "凭证已使用或已取消");
            } else if (LockerUtil.isVoucherExpired(operation.getExpiredAt())) {
                result.put("valid", false);
                result.put("reason", "凭证已过期");
            }
            
            return ResponseUtil.ok(result);
            
        } catch (Exception e) {
            logger.error("验证凭证失败", e);
            return ResponseUtil.serious();
        }
    }

    /**
     * 获取用户的凭证列表
     * 用户查看自己的凭证历史
     */
    @GetMapping("/list")
    public Object getMyVouchers(@LoginUser Integer userId,
                               @RequestParam(defaultValue = "1") Integer page,
                               @RequestParam(defaultValue = "10") Integer limit,
                               @RequestParam(required = false) String status) {
        
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        
        try {
            List<LitemallLockerOperation> operations = operationService.queryByUser(userId, page, limit);
            
            List<Map<String, Object>> voucherList = new ArrayList<>();
            for (LitemallLockerOperation op : operations) {
                // 根据状态筛选
                if (status != null && !status.equals(op.getStatus())) {
                    continue;
                }
                
                Map<String, Object> item = new HashMap<>();
                item.put("voucherCode", op.getVoucherCode());
                item.put("operationType", op.getOperationType());
                item.put("status", op.getStatus());
                item.put("createdAt", op.getAddTime());
                item.put("expiredAt", op.getExpiredAt());
                item.put("isExpired", LockerUtil.isVoucherExpired(op.getExpiredAt()));
                item.put("daysRemaining", LockerUtil.calculateDaysRemaining(op.getExpiredAt()));
                
                if (op.getLockerId() != null) {
                    item.put("lockerId", op.getLockerId());
                }
                
                voucherList.add(item);
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("list", voucherList);
            data.put("total", voucherList.size());  // TODO: 实现真实的总数查询
            
            return ResponseUtil.ok(data);
            
        } catch (Exception e) {
            logger.error("获取凭证列表失败", e);
            return ResponseUtil.serious();
        }
    }

    /**
     * 扫描凭证二维码
     * 解析二维码内容获取凭证信息
     */
    @PostMapping("/scan")
    public Object scanVoucherQR(@RequestBody Map<String, Object> body) {
        String qrData = (String) body.get("qrData");
        
        if (qrData == null || qrData.trim().isEmpty()) {
            return ResponseUtil.badArgument();
        }
        
        try {
            // 解析二维码内容获取凭证码
            String voucherCode = LockerUtil.parseQrContent(qrData);
            
            if (voucherCode == null) {
                return ResponseUtil.fail(400, "无效的二维码格式");
            }
            
            // 获取凭证详情
            LitemallLockerOperation operation = operationService.findByVoucherCode(voucherCode);
            
            if (operation == null) {
                return ResponseUtil.fail(404, "凭证不存在");
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("voucherCode", operation.getVoucherCode());
            data.put("operationType", operation.getOperationType());
            data.put("status", operation.getStatus());
            data.put("isExpired", LockerUtil.isVoucherExpired(operation.getExpiredAt()));
            
            return ResponseUtil.ok(data);
            
        } catch (Exception e) {
            logger.error("扫描凭证二维码失败", e);
            return ResponseUtil.serious();
        }
    }
}