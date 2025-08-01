package org.linlinjava.litemall.admin.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallLockerOperation;
import org.linlinjava.litemall.db.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 管理后台仪表板服务
 * 提供各种统计数据的业务逻辑
 */
@Service
public class AdminDashboardService {
    private final Log logger = LogFactory.getLog(AdminDashboardService.class);

    @Autowired
    private LitemallUserService userService;
    
    @Autowired
    private LitemallLockerService lockerService;
    
    @Autowired
    private LitemallLockerOperationService lockerOperationService;
    
    @Autowired
    private LitemallIdentityVerificationService identityVerificationService;

    /**
     * 获取仪表板汇总数据
     * 使用缓存，缓存时间5分钟
     */
    @Cacheable(value = "dashboardSummary", key = "'summary'")
    public Map<String, Object> getSummaryData() {
        Map<String, Object> data = new HashMap<>();
        
        // 获取今日时间范围
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        // 今日统计
        Map<String, Object> todayStats = new HashMap<>();
        todayStats.put("newUsers", userService.countByAddTime(startOfDay, endOfDay));
        todayStats.put("storeOperations", lockerOperationService.countTodayStore(startOfDay, endOfDay));
        todayStats.put("retrieveOperations", lockerOperationService.countTodayRetrieve(startOfDay, endOfDay));
        todayStats.put("activeLockers", lockerOperationService.countActiveOperations());
        
        // 总体统计
        Map<String, Object> totalStats = new HashMap<>();
        totalStats.put("totalUsers", userService.count());
        totalStats.put("verifiedUsers", identityVerificationService.countVerified());
        totalStats.put("totalLockers", lockerService.count());
        totalStats.put("availableLockers", lockerService.countAvailable());
        
        // 使用率计算
        long totalLockers = lockerService.count();
        long activeLockers = lockerOperationService.countActiveOperations();
        double usageRate = totalLockers > 0 ? (double) activeLockers / totalLockers * 100 : 0;
        totalStats.put("usageRate", String.format("%.1f", usageRate));
        
        data.put("today", todayStats);
        data.put("total", totalStats);
        
        // 获取最近的操作记录（前5条）
        List<LitemallLockerOperation> recentOperations = lockerOperationService.querySelective(
                null, null, null, null, null, 1, 5, "add_time", "desc");
        List<Map<String, Object>> recentList = new ArrayList<>();
        for (LitemallLockerOperation op : recentOperations) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", op.getId());
            item.put("type", op.getType());
            item.put("lockerNumber", op.getLockerNumber());
            item.put("userName", op.getUserName());
            item.put("time", op.getAddTime());
            recentList.add(item);
        }
        data.put("recentOperations", recentList);
        
        return data;
    }

    /**
     * 获取收入统计数据
     * 注：MVP版本暂无收费功能，返回模拟数据
     */
    @Cacheable(value = "dashboardRevenue", key = "'revenue_' + #startDate + '_' + #endDate")
    public Map<String, Object> getRevenueData(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> data = new HashMap<>();
        
        // MVP版本暂无收费功能，返回模拟数据结构
        data.put("totalRevenue", BigDecimal.ZERO);
        data.put("storageRevenue", BigDecimal.ZERO);
        data.put("overdueRevenue", BigDecimal.ZERO);
        data.put("otherRevenue", BigDecimal.ZERO);
        
        // 日收入趋势（模拟数据）
        List<Map<String, Object>> dailyRevenue = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", current.toString());
            dayData.put("revenue", BigDecimal.ZERO);
            dailyRevenue.add(dayData);
            current = current.plusDays(1);
        }
        data.put("dailyRevenue", dailyRevenue);
        
        // 收入构成
        Map<String, Object> composition = new HashMap<>();
        composition.put("storage", 0);
        composition.put("overdue", 0);
        composition.put("other", 0);
        data.put("revenueComposition", composition);
        
        return data;
    }

    /**
     * 获取储物柜使用情况分析数据
     */
    @Cacheable(value = "dashboardUsage", key = "'usage_' + #period")
    public Map<String, Object> getUsageAnalytics(String period) {
        Map<String, Object> data = new HashMap<>();
        
        // 计算时间范围
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime;
        switch (period) {
            case "day":
                startTime = endTime.minusDays(1);
                break;
            case "week":
                startTime = endTime.minusWeeks(1);
                break;
            case "month":
                startTime = endTime.minusMonths(1);
                break;
            default:
                startTime = endTime.minusWeeks(1);
        }
        
        // 各区域使用情况
        List<Map<String, Object>> zoneUsage = new ArrayList<>();
        String[] zones = {"A", "B", "C", "D", "VIP"};
        for (String zone : zones) {
            Map<String, Object> zoneData = new HashMap<>();
            zoneData.put("zone", zone);
            
            // 获取该区域的储物柜
            List<LitemallLocker> lockers = lockerService.queryByZone(zone);
            long totalInZone = lockers.size();
            long availableInZone = lockers.stream()
                    .filter(l -> "available".equals(l.getStatus()))
                    .count();
            long occupiedInZone = totalInZone - availableInZone;
            
            zoneData.put("total", totalInZone);
            zoneData.put("occupied", occupiedInZone);
            zoneData.put("available", availableInZone);
            zoneData.put("usageRate", totalInZone > 0 ? 
                    String.format("%.1f", (double) occupiedInZone / totalInZone * 100) : "0.0");
            
            zoneUsage.add(zoneData);
        }
        data.put("zoneUsage", zoneUsage);
        
        // 时段分布（24小时）
        List<Map<String, Object>> hourlyDistribution = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            Map<String, Object> hourData = new HashMap<>();
            hourData.put("hour", String.format("%02d:00", hour));
            
            // 统计该时段的存取操作
            LocalDateTime hourStart = LocalDate.now().atTime(hour, 0);
            LocalDateTime hourEnd = hourStart.plusHours(1);
            
            long storeCount = lockerOperationService.countByTypeAndTimeRange("store", hourStart, hourEnd);
            long retrieveCount = lockerOperationService.countByTypeAndTimeRange("retrieve", hourStart, hourEnd);
            
            hourData.put("store", storeCount);
            hourData.put("retrieve", retrieveCount);
            hourData.put("total", storeCount + retrieveCount);
            
            hourlyDistribution.add(hourData);
        }
        data.put("hourlyDistribution", hourlyDistribution);
        
        // 平均存储时长统计
        Map<String, Object> durationStats = new HashMap<>();
        durationStats.put("avgDuration", "2.5天"); // MVP版本模拟数据
        durationStats.put("minDuration", "1小时");
        durationStats.put("maxDuration", "30天");
        data.put("durationStats", durationStats);
        
        // 热门储物柜TOP10
        List<Map<String, Object>> popularLockers = new ArrayList<>();
        // MVP版本返回模拟数据
        for (int i = 1; i <= 10; i++) {
            Map<String, Object> locker = new HashMap<>();
            locker.put("number", "A" + String.format("%03d", i));
            locker.put("usageCount", 50 - i * 3);
            locker.put("zone", "A");
            popularLockers.add(locker);
        }
        data.put("popularLockers", popularLockers);
        
        return data;
    }

    /**
     * 获取趋势图表数据
     */
    @Cacheable(value = "dashboardTrends", key = "'trends_' + #type + '_' + #days")
    public Map<String, Object> getTrendsData(String type, Integer days) {
        Map<String, Object> data = new HashMap<>();
        
        List<Map<String, Object>> trendData = new ArrayList<>();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);
        
        // 根据类型获取不同的趋势数据
        switch (type) {
            case "user":
                // 用户增长趋势
                for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                    Map<String, Object> dayData = new HashMap<>();
                    dayData.put("date", date.toString());
                    
                    LocalDateTime dayStart = date.atStartOfDay();
                    LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
                    
                    // 新增用户数
                    long newUsers = userService.countByAddTime(dayStart, dayEnd);
                    // 累计用户数（需要查询到该日期为止的所有用户）
                    long totalUsers = userService.countByAddTime(null, dayEnd);
                    
                    dayData.put("newUsers", newUsers);
                    dayData.put("totalUsers", totalUsers);
                    trendData.add(dayData);
                }
                
                data.put("chartTitle", "用户增长趋势");
                data.put("yAxisLabel", "用户数");
                break;
                
            case "operation":
                // 存取操作趋势
                for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                    Map<String, Object> dayData = new HashMap<>();
                    dayData.put("date", date.toString());
                    
                    LocalDateTime dayStart = date.atStartOfDay();
                    LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
                    
                    long storeCount = lockerOperationService.countTodayStore(dayStart, dayEnd);
                    long retrieveCount = lockerOperationService.countTodayRetrieve(dayStart, dayEnd);
                    
                    dayData.put("store", storeCount);
                    dayData.put("retrieve", retrieveCount);
                    dayData.put("total", storeCount + retrieveCount);
                    trendData.add(dayData);
                }
                
                data.put("chartTitle", "存取操作趋势");
                data.put("yAxisLabel", "操作次数");
                break;
                
            case "revenue":
                // 收入趋势（MVP版本模拟数据）
                for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                    Map<String, Object> dayData = new HashMap<>();
                    dayData.put("date", date.toString());
                    dayData.put("revenue", BigDecimal.ZERO);
                    dayData.put("orders", 0);
                    trendData.add(dayData);
                }
                
                data.put("chartTitle", "收入趋势");
                data.put("yAxisLabel", "收入金额（元）");
                break;
        }
        
        data.put("trendData", trendData);
        data.put("period", days + "天");
        
        // 添加统计摘要
        Map<String, Object> summary = calculateTrendSummary(type, trendData);
        data.put("summary", summary);
        
        return data;
    }
    
    /**
     * 计算趋势摘要信息
     */
    private Map<String, Object> calculateTrendSummary(String type, List<Map<String, Object>> trendData) {
        Map<String, Object> summary = new HashMap<>();
        
        if (trendData.isEmpty()) {
            return summary;
        }
        
        switch (type) {
            case "user":
                // 计算总新增用户和平均每日新增
                long totalNewUsers = trendData.stream()
                        .mapToLong(d -> (Long) d.get("newUsers"))
                        .sum();
                double avgNewUsers = (double) totalNewUsers / trendData.size();
                
                summary.put("totalNewUsers", totalNewUsers);
                summary.put("avgDailyNewUsers", String.format("%.1f", avgNewUsers));
                break;
                
            case "operation":
                // 计算总操作数和平均每日操作
                long totalOps = trendData.stream()
                        .mapToLong(d -> (Long) d.get("total"))
                        .sum();
                double avgOps = (double) totalOps / trendData.size();
                
                summary.put("totalOperations", totalOps);
                summary.put("avgDailyOperations", String.format("%.1f", avgOps));
                break;
                
            case "revenue":
                // MVP版本返回0
                summary.put("totalRevenue", BigDecimal.ZERO);
                summary.put("avgDailyRevenue", BigDecimal.ZERO);
                break;
        }
        
        return summary;
    }
}