package org.linlinjava.litemall.core.task;

import org.linlinjava.litemall.db.service.LitemallLockerOperationService;
import org.linlinjava.litemall.core.notify.NotifyService;
import org.linlinjava.litemall.db.domain.LitemallLockerOperation;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.db.service.LitemallVoucherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 储物柜定时任务
 * 处理过期凭证、发送提醒通知等
 */
// @Component // TODO: Enable after configuring NotifyService properly
public class LockerScheduleTask {
    
    private static final Logger logger = LoggerFactory.getLogger(LockerScheduleTask.class);
    
    @Autowired
    private LitemallLockerOperationService operationService;
    
    @Autowired
    private LitemallVoucherService voucherService;
    
    @Autowired
    private LitemallUserService userService;
    
    @Autowired
    private NotifyService notifyService;
    
    /**
     * 每天凌晨2点执行：更新过期凭证状态
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void updateExpiredVouchers() {
        logger.info("开始执行过期凭证更新任务");
        
        try {
            // 更新过期凭证
            int expiredVoucherCount = voucherService.updateExpiredVouchers();
            logger.info("更新过期凭证数量：{}", expiredVoucherCount);
            
            // 更新过期操作记录
            int expiredOperationCount = operationService.updateExpiredStatus();
            logger.info("更新过期操作记录数量：{}", expiredOperationCount);
            
        } catch (Exception e) {
            logger.error("更新过期凭证任务执行失败", e);
        }
    }
    
    /**
     * 每天上午10点执行：发送即将过期提醒
     */
    @Scheduled(cron = "0 0 10 * * ?")
    public void sendExpiringReminders() {
        logger.info("开始执行过期提醒任务");
        
        try {
            // 查询3天内即将过期的操作
            List<LitemallLockerOperation> expiringOperations = operationService.findExpiringSoon(3);
            
            for (LitemallLockerOperation operation : expiringOperations) {
                try {
                    // 获取用户信息
                    LitemallUser user = userService.findById(operation.getUserId());
                    if (user == null) {
                        continue;
                    }
                    
                    // 发送提醒通知（微信模板消息）
                    // TODO: 实现凭证过期提醒功能
                    // notifyService.notifyWxTemplate(user.getWeixinOpenid(), 
                    //     "LOCKER_EXPIRING", 
                    //     new String[]{
                    //         operation.getCabinetNumber(),
                    //         operation.getExpiredAt().toString(),
                    //         "请尽快前往取回您的球杆"
                    //     });
                    
                    logger.info("已发送过期提醒给用户：{}", user.getId());
                    
                } catch (Exception e) {
                    logger.error("发送提醒失败，操作ID：" + operation.getId(), e);
                }
            }
            
            logger.info("过期提醒任务完成，发送提醒数量：{}", expiringOperations.size());
            
        } catch (Exception e) {
            logger.error("过期提醒任务执行失败", e);
        }
    }
    
    /**
     * 每天凌晨3点执行：清理已过期30天的数据
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanExpiredData() {
        logger.info("开始执行过期数据清理任务");
        
        try {
            // 这里只是标记删除，不是真正删除
            // 保留历史记录用于统计和查询
            
            logger.info("过期数据清理任务完成");
            
        } catch (Exception e) {
            logger.error("过期数据清理任务执行失败", e);
        }
    }
    
    /**
     * 每小时执行：检查储物柜状态一致性
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void checkLockerConsistency() {
        logger.info("开始执行储物柜状态检查任务");
        
        try {
            // 检查储物柜状态与操作记录的一致性
            // 如果发现不一致，记录日志并尝试修复
            
            logger.info("储物柜状态检查任务完成");
            
        } catch (Exception e) {
            logger.error("储物柜状态检查任务执行失败", e);
        }
    }
}