package org.linlinjava.litemall.wx.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.storage.StorageService;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.db.domain.LitemallStorage;
import org.linlinjava.litemall.db.service.LitemallStorageService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 文件存储控制器
 * 支持球杆照片、身份证照片等文件上传
 */
@RestController
@RequestMapping("/wx/storage")
@Validated
public class WxStorageController {
    private final Log logger = LogFactory.getLog(WxStorageController.class);

    @Autowired
    private StorageService storageService;
    
    @Autowired
    private LitemallStorageService litemallStorageService;

    /**
     * 上传文件
     * 支持的文件类型：图片（jpg, jpeg, png, gif）
     * 最大文件大小：5MB
     */
    @PostMapping("/upload")
    public Object upload(@LoginUser Integer userId, @RequestParam("file") MultipartFile file) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        
        if (file.isEmpty()) {
            return ResponseUtil.badArgument();
        }

        // 检查文件大小（5MB限制）
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseUtil.fail(402, "文件大小不能超过5MB");
        }

        // 检查文件类型
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!isImageFile(extension)) {
            return ResponseUtil.fail(402, "只支持上传图片文件");
        }

        try {
            // 存储文件
            LitemallStorage storageInfo = storageService.store(file.getInputStream(), 
                file.getSize(), file.getContentType(), originalFilename);
            
            // 返回文件信息
            Map<String, Object> data = new HashMap<>();
            data.put("url", storageInfo.getUrl());
            data.put("key", storageInfo.getKey());
            data.put("name", storageInfo.getName());
            data.put("size", storageInfo.getSize());
            data.put("type", storageInfo.getType());
            
            return ResponseUtil.ok(data);
        } catch (IOException e) {
            logger.error("文件上传失败", e);
            return ResponseUtil.fail(502, "文件上传失败");
        }
    }

    /**
     * 批量上传文件
     * 最多支持9张图片
     */
    @PostMapping("/upload-batch")
    public Object uploadBatch(@LoginUser Integer userId, 
                             @RequestParam("files") MultipartFile[] files) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        
        if (files.length == 0) {
            return ResponseUtil.badArgument();
        }
        
        if (files.length > 9) {
            return ResponseUtil.fail(402, "最多只能上传9张图片");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("total", files.length);
        result.put("success", 0);
        result.put("fail", 0);
        result.put("files", new java.util.ArrayList<>());

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                result.put("fail", (Integer) result.get("fail") + 1);
                continue;
            }

            // 检查文件大小
            if (file.getSize() > 5 * 1024 * 1024) {
                result.put("fail", (Integer) result.get("fail") + 1);
                continue;
            }

            // 检查文件类型
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
            if (!isImageFile(extension)) {
                result.put("fail", (Integer) result.get("fail") + 1);
                continue;
            }

            try {
                // 存储文件
                LitemallStorage storageInfo = storageService.store(file.getInputStream(), 
                    file.getSize(), file.getContentType(), originalFilename);
                
                Map<String, Object> fileData = new HashMap<>();
                fileData.put("url", storageInfo.getUrl());
                fileData.put("key", storageInfo.getKey());
                fileData.put("name", storageInfo.getName());
                
                ((java.util.List) result.get("files")).add(fileData);
                result.put("success", (Integer) result.get("success") + 1);
                
            } catch (IOException e) {
                logger.error("文件上传失败: " + originalFilename, e);
                result.put("fail", (Integer) result.get("fail") + 1);
            }
        }

        return ResponseUtil.ok(result);
    }

    /**
     * 删除文件
     */
    @PostMapping("/delete")
    public Object delete(@LoginUser Integer userId, @RequestBody String key) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        
        if (key == null || key.isEmpty()) {
            return ResponseUtil.badArgument();
        }

        try {
            // 查询文件信息
            LitemallStorage storageInfo = litemallStorageService.findByKey(key);
            if (storageInfo == null) {
                return ResponseUtil.fail(404, "文件不存在");
            }

            // 删除文件
            storageService.delete(key);
            litemallStorageService.deleteByKey(key);
            
            return ResponseUtil.ok();
        } catch (Exception e) {
            logger.error("文件删除失败", e);
            return ResponseUtil.fail(502, "文件删除失败");
        }
    }

    /**
     * 获取文件信息
     */
    @GetMapping("/fetch/{key:.+}")
    public Object fetch(@PathVariable String key) {
        if (key == null || key.isEmpty()) {
            return ResponseUtil.badArgument();
        }

        LitemallStorage storageInfo = litemallStorageService.findByKey(key);
        if (storageInfo == null) {
            return ResponseUtil.fail(404, "文件不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("url", storageInfo.getUrl());
        data.put("key", storageInfo.getKey());
        data.put("name", storageInfo.getName());
        data.put("size", storageInfo.getSize());
        data.put("type", storageInfo.getType());
        data.put("addTime", storageInfo.getAddTime());
        
        return ResponseUtil.ok(data);
    }

    /**
     * 判断是否为图片文件
     */
    private boolean isImageFile(String extension) {
        return "jpg".equalsIgnoreCase(extension) || 
               "jpeg".equalsIgnoreCase(extension) || 
               "png".equalsIgnoreCase(extension) || 
               "gif".equalsIgnoreCase(extension) ||
               "bmp".equalsIgnoreCase(extension) ||
               "webp".equalsIgnoreCase(extension);
    }
}