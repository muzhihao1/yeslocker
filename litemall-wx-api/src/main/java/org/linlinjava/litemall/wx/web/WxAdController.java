package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallAd;
import org.linlinjava.litemall.db.service.LitemallAdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 广告相关接口
 * 简化版本：只提供展示功能，无点击跟踪
 */
@RestController
@RequestMapping("/wx/ad")
@Validated
public class WxAdController {
    private final Log logger = LogFactory.getLog(WxAdController.class);

    @Autowired
    private LitemallAdService adService;

    /**
     * 获取广告列表
     * @param position 广告位置 (1:首页 2:操作页 3:凭证底部 4:二手市场)
     * @return 广告列表
     */
    @GetMapping("/list")
    public Object getAdList(@RequestParam(required = false) Integer position) {
        try {
            List<LitemallAd> ads;
            
            if (position != null) {
                // 根据位置查询广告
                ads = adService.queryByPosition(position.byteValue());
            } else {
                // 查询首页广告（默认位置1）
                ads = adService.queryIndex();
            }
            
            List<Map<String, Object>> adList = new ArrayList<>();
            for (LitemallAd ad : ads) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", ad.getId());
                item.put("name", ad.getName());
                item.put("link", ad.getLink());
                item.put("url", ad.getUrl());
                item.put("position", ad.getPosition());
                item.put("content", ad.getContent());
                item.put("startTime", ad.getStartTime());
                item.put("endTime", ad.getEndTime());
                
                adList.add(item);
            }
            
            return ResponseUtil.ok(adList);
            
        } catch (Exception e) {
            logger.error("获取广告列表失败", e);
            return ResponseUtil.serious();
        }
    }

    /**
     * 记录广告点击（简化版 - 仅作为接口兼容）
     * 用户要求暂时不需要点击跟踪，但保留接口以防前端调用
     */
    @PostMapping("/click")
    public Object recordAdClick(@RequestBody Map<String, Object> body) {
        // 简化实现：只返回成功，不做实际记录
        Integer adId = (Integer) body.get("adId");
        
        if (adId == null) {
            return ResponseUtil.badArgument();
        }
        
        try {
            // TODO: 如果未来需要点击统计，在这里实现
            logger.info("广告点击 - AdId: " + adId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "记录成功");
            
            return ResponseUtil.ok(result);
            
        } catch (Exception e) {
            logger.error("记录广告点击失败", e);
            return ResponseUtil.serious();
        }
    }

    /**
     * 记录广告展示（简化版 - 仅作为接口兼容）
     * 用户要求暂时不需要展示跟踪，但保留接口以防前端调用
     */
    @PostMapping("/impressions")
    public Object recordAdImpressions(@RequestBody Map<String, Object> body) {
        // 简化实现：只返回成功，不做实际记录
        @SuppressWarnings("unchecked")
        List<Integer> adIds = (List<Integer>) body.get("adIds");
        
        if (adIds == null || adIds.isEmpty()) {
            return ResponseUtil.badArgument();
        }
        
        try {
            // TODO: 如果未来需要展示统计，在这里实现
            logger.info("广告展示 - AdIds: " + adIds);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "记录成功");
            result.put("count", adIds.size());
            
            return ResponseUtil.ok(result);
            
        } catch (Exception e) {
            logger.error("记录广告展示失败", e);
            return ResponseUtil.serious();
        }
    }
}