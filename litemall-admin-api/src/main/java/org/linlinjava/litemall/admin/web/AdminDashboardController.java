package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.admin.service.AdminDashboardService;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Map;

/**
 * 管理后台仪表板控制器
 * 提供各种统计数据接口供前端展示
 */
@RestController
@RequestMapping("/admin/dashboard")
@Validated
public class AdminDashboardController {
    private final Log logger = LogFactory.getLog(AdminDashboardController.class);

    @Autowired
    private AdminDashboardService dashboardService;

    /**
     * 获取仪表板汇总数据
     * 包含今日统计、总体统计等关键指标
     *
     * @return 汇总统计数据
     */
    @RequiresPermissions("admin:dashboard:summary")
    @RequiresPermissionsDesc(menu = {"统计管理", "仪表板汇总"}, button = "查询")
    @GetMapping("/summary")
    public Object summary() {
        logger.info("获取仪表板汇总数据");
        try {
            Map<String, Object> data = dashboardService.getSummaryData();
            return ResponseUtil.ok(data);
        } catch (Exception e) {
            logger.error("获取仪表板汇总数据失败", e);
            return ResponseUtil.fail();
        }
    }

    /**
     * 获取收入统计数据
     * 包含日收入、周收入、月收入等
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 收入统计数据
     */
    @RequiresPermissions("admin:dashboard:revenue")
    @RequiresPermissionsDesc(menu = {"统计管理", "收入统计"}, button = "查询")
    @GetMapping("/revenue")
    public Object revenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        logger.info("获取收入统计数据");
        try {
            // 如果没有指定日期范围，默认获取最近30天的数据
            if (startDate == null) {
                endDate = LocalDate.now();
                startDate = endDate.minusDays(30);
            }
            
            Map<String, Object> data = dashboardService.getRevenueData(startDate, endDate);
            return ResponseUtil.ok(data);
        } catch (Exception e) {
            logger.error("获取收入统计数据失败", e);
            return ResponseUtil.fail();
        }
    }

    /**
     * 获取储物柜使用情况分析数据
     * 包含使用率、各区域使用情况、高峰时段等
     *
     * @param period 时间周期（day/week/month）
     * @return 使用情况分析数据
     */
    @RequiresPermissions("admin:dashboard:usage")
    @RequiresPermissionsDesc(menu = {"统计管理", "使用情况分析"}, button = "查询")
    @GetMapping("/usage")
    public Object usage(@RequestParam(defaultValue = "week") String period) {
        logger.info("获取储物柜使用情况分析数据，周期：" + period);
        try {
            // 验证period参数
            if (!period.matches("day|week|month")) {
                return ResponseUtil.badArgument("period参数只能是day、week或month");
            }
            
            Map<String, Object> data = dashboardService.getUsageAnalytics(period);
            return ResponseUtil.ok(data);
        } catch (Exception e) {
            logger.error("获取使用情况分析数据失败", e);
            return ResponseUtil.fail();
        }
    }

    /**
     * 获取趋势图表数据
     * 包含用户增长趋势、存取操作趋势等
     *
     * @param type  趋势类型（user/operation/revenue）
     * @param days  统计天数（默认7天）
     * @return 趋势图表数据
     */
    @RequiresPermissions("admin:dashboard:trends")
    @RequiresPermissionsDesc(menu = {"统计管理", "趋势分析"}, button = "查询")
    @GetMapping("/trends")
    public Object trends(
            @RequestParam(defaultValue = "operation") String type,
            @RequestParam(defaultValue = "7") Integer days) {
        logger.info("获取趋势图表数据，类型：" + type + "，天数：" + days);
        try {
            // 验证type参数
            if (!type.matches("user|operation|revenue")) {
                return ResponseUtil.badArgument("type参数只能是user、operation或revenue");
            }
            
            // 限制最大查询天数
            if (days > 90) {
                return ResponseUtil.badArgument("最多只能查询90天的趋势数据");
            }
            
            Map<String, Object> data = dashboardService.getTrendsData(type, days);
            return ResponseUtil.ok(data);
        } catch (Exception e) {
            logger.error("获取趋势图表数据失败", e);
            return ResponseUtil.fail();
        }
    }
}