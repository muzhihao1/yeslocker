package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallStore;
import org.linlinjava.litemall.db.service.LitemallStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 门店控制器
 */
@RestController
@RequestMapping("/wx/store")
@Validated
public class WxStoreController {
    private final Log logger = LogFactory.getLog(WxStoreController.class);

    @Autowired
    private LitemallStoreService storeService;

    /**
     * 获取门店列表
     *
     * @param status 状态筛选（可选）
     * @return 门店列表
     */
    @GetMapping("/list")
    public Object list(@RequestParam(required = false) String status) {
        try {
            List<LitemallStore> storeList;
            
            if (status != null && !status.isEmpty()) {
                // 根据状态筛选
                storeList = storeService.querySelective(null, null, status, 1, 100, "add_time", "desc");
            } else {
                // 获取所有有效门店
                storeList = storeService.queryAll();
            }

            // 转换为前端需要的格式
            List<Map<String, Object>> storeVoList = storeList.stream().map(store -> {
                Map<String, Object> storeVo = new HashMap<>();
                storeVo.put("id", store.getId());
                storeVo.put("name", store.getName());
                storeVo.put("code", store.getCode());
                storeVo.put("address", store.getAddress());
                storeVo.put("phone", store.getPhone());
                storeVo.put("businessHours", store.getBusinessHours());
                storeVo.put("status", store.getStatus());
                storeVo.put("lockerCount", store.getLockerCount());
                storeVo.put("province", store.getProvince());
                storeVo.put("city", store.getCity());
                storeVo.put("district", store.getDistrict());
                storeVo.put("latitude", store.getLatitude());
                storeVo.put("longitude", store.getLongitude());
                return storeVo;
            }).collect(Collectors.toList());

            Map<String, Object> data = new HashMap<>();
            data.put("list", storeVoList);
            data.put("total", storeVoList.size());

            return ResponseUtil.ok(data);
        } catch (Exception e) {
            logger.error("获取门店列表失败", e);
            return ResponseUtil.fail();
        }
    }

    /**
     * 获取门店详情
     *
     * @param id 门店ID
     * @return 门店详情
     */
    @GetMapping("/{id}")
    public Object detail(@PathVariable Integer id) {
        try {
            LitemallStore store = storeService.findById(id);
            if (store == null || store.getDeleted()) {
                return ResponseUtil.badArgument();
            }

            Map<String, Object> storeVo = new HashMap<>();
            storeVo.put("id", store.getId());
            storeVo.put("name", store.getName());
            storeVo.put("code", store.getCode());
            storeVo.put("address", store.getAddress());
            storeVo.put("phone", store.getPhone());
            storeVo.put("businessHours", store.getBusinessHours());
            storeVo.put("status", store.getStatus());
            storeVo.put("lockerCount", store.getLockerCount());
            storeVo.put("managerName", store.getManagerName());
            storeVo.put("managerPhone", store.getManagerPhone());
            storeVo.put("province", store.getProvince());
            storeVo.put("city", store.getCity());
            storeVo.put("district", store.getDistrict());
            storeVo.put("latitude", store.getLatitude());
            storeVo.put("longitude", store.getLongitude());

            return ResponseUtil.ok(storeVo);
        } catch (Exception e) {
            logger.error("获取门店详情失败，门店ID: " + id, e);
            return ResponseUtil.fail();
        }
    }

    /**
     * 获取附近门店
     *
     * @param latitude  纬度
     * @param longitude 经度
     * @param radius    搜索半径（公里）
     * @return 附近门店列表
     */
    @GetMapping("/nearby")
    public Object nearby(@RequestParam Double latitude,
                        @RequestParam Double longitude,
                        @RequestParam(defaultValue = "5") Double radius) {
        try {
            // 获取所有有效门店
            List<LitemallStore> allStores = storeService.queryAll();

            // 计算距离并筛选
            List<Map<String, Object>> nearbyStores = allStores.stream()
                .map(store -> {
                    Map<String, Object> storeVo = new HashMap<>();
                    storeVo.put("id", store.getId());
                    storeVo.put("name", store.getName());
                    storeVo.put("code", store.getCode());
                    storeVo.put("address", store.getAddress());
                    storeVo.put("phone", store.getPhone());
                    storeVo.put("businessHours", store.getBusinessHours());
                    storeVo.put("status", store.getStatus());
                    storeVo.put("lockerCount", store.getLockerCount());
                    storeVo.put("latitude", store.getLatitude());
                    storeVo.put("longitude", store.getLongitude());

                    // 计算距离
                    if (store.getLatitude() != null && store.getLongitude() != null) {
                        double distance = calculateDistance(latitude, longitude,
                            store.getLatitude().doubleValue(), store.getLongitude().doubleValue());
                        storeVo.put("distance", distance);
                        storeVo.put("distanceText", formatDistance(distance));
                    } else {
                        storeVo.put("distance", null);
                        storeVo.put("distanceText", "未知");
                    }

                    return storeVo;
                })
                .filter(storeVo -> {
                    Double distance = (Double) storeVo.get("distance");
                    return distance != null && distance <= radius;
                })
                .sorted((a, b) -> {
                    Double distanceA = (Double) a.get("distance");
                    Double distanceB = (Double) b.get("distance");
                    if (distanceA == null) return 1;
                    if (distanceB == null) return -1;
                    return distanceA.compareTo(distanceB);
                })
                .collect(Collectors.toList());

            Map<String, Object> data = new HashMap<>();
            data.put("list", nearbyStores);
            data.put("total", nearbyStores.size());

            return ResponseUtil.ok(data);
        } catch (Exception e) {
            logger.error("获取附近门店失败", e);
            return ResponseUtil.fail();
        }
    }

    /**
     * 获取门店营业状态
     *
     * @param id 门店ID
     * @return 营业状态信息
     */
    @GetMapping("/{id}/status")
    public Object status(@PathVariable Integer id) {
        try {
            LitemallStore store = storeService.findById(id);
            if (store == null || store.getDeleted()) {
                return ResponseUtil.badArgument();
            }

            Map<String, Object> statusInfo = new HashMap<>();
            statusInfo.put("id", store.getId());
            statusInfo.put("name", store.getName());
            statusInfo.put("status", store.getStatus());
            statusInfo.put("businessHours", store.getBusinessHours());
            
            // 判断当前是否在营业时间内
            boolean isOpen = isStoreOpen(store);
            statusInfo.put("isOpen", isOpen);
            statusInfo.put("statusText", getStatusText(store.getStatus(), isOpen));

            return ResponseUtil.ok(statusInfo);
        } catch (Exception e) {
            logger.error("获取门店状态失败，门店ID: " + id, e);
            return ResponseUtil.fail();
        }
    }

    /**
     * 计算两个经纬度之间的距离（单位：公里）
     * 使用Haversine公式
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // 地球半径（公里）

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;

        return Math.round(distance * 100.0) / 100.0; // 保留两位小数
    }

    /**
     * 格式化距离显示
     */
    private String formatDistance(double distance) {
        if (distance < 1) {
            return (int)(distance * 1000) + "m";
        } else {
            return String.format("%.1fkm", distance);
        }
    }

    /**
     * 判断门店是否在营业时间内
     */
    private boolean isStoreOpen(LitemallStore store) {
        if (!"active".equals(store.getStatus())) {
            return false;
        }

        // TODO: 根据businessHours判断是否在营业时间内
        // 这里简化处理，实际需要解析营业时间并与当前时间比较
        return true;
    }

    /**
     * 获取状态文本
     */
    private String getStatusText(String status, boolean isOpen) {
        if ("active".equals(status)) {
            return isOpen ? "营业中" : "休息中";
        } else if ("inactive".equals(status)) {
            return "已停业";
        } else if ("maintenance".equals(status)) {
            return "维护中";
        } else {
            return "未知";
        }
    }
}