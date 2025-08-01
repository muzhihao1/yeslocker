package org.linlinjava.litemall.core.storage.config;

import org.linlinjava.litemall.core.storage.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
public class StorageAutoConfiguration {

    private final StorageProperties properties;

    public StorageAutoConfiguration(StorageProperties properties) {
        this.properties = properties;
    }

    @Bean
    public StorageService storageService() {
        StorageService storageService = new StorageService();
        String active = this.properties.getActive();
        storageService.setActive(active);
        if (active.equals("local")) {
            storageService.setStorage(localStorage());
        } else if (active.equals("aliyun")) {
            storageService.setStorage(aliyunStorage());
        } else if (active.equals("tencent")) {
            storageService.setStorage(tencentStorage());
        } else if (active.equals("qiniu")) {
            storageService.setStorage(qiniuStorage());
        } else {
            throw new RuntimeException("当前存储模式 " + active + " 不支持");
        }

        return storageService;
    }

    @Bean
    @ConditionalOnMissingBean
    public LocalStorage localStorage() {
        LocalStorage localStorage = new LocalStorage();
        StorageProperties.Local local = this.properties.getLocal();
        if (local != null) {
            localStorage.setAddress(local.getAddress());
            localStorage.setStoragePath(local.getStoragePath());
        }
        return localStorage;
    }

    @Bean
    @ConditionalOnProperty(prefix = "litemall.storage", name = "active", havingValue = "aliyun")
    public AliyunStorage aliyunStorage() {
        AliyunStorage aliyunStorage = new AliyunStorage();
        StorageProperties.Aliyun aliyun = this.properties.getAliyun();
        if (aliyun != null) {
            aliyunStorage.setAccessKeyId(aliyun.getAccessKeyId());
            aliyunStorage.setAccessKeySecret(aliyun.getAccessKeySecret());
            aliyunStorage.setBucketName(aliyun.getBucketName());
            aliyunStorage.setEndpoint(aliyun.getEndpoint());
        }
        return aliyunStorage;
    }

    @Bean
    @ConditionalOnProperty(prefix = "litemall.storage", name = "active", havingValue = "tencent")
    public TencentStorage tencentStorage() {
        TencentStorage tencentStorage = new TencentStorage();
        StorageProperties.Tencent tencent = this.properties.getTencent();
        if (tencent != null) {
            tencentStorage.setSecretId(tencent.getSecretId());
            tencentStorage.setSecretKey(tencent.getSecretKey());
            tencentStorage.setBucketName(tencent.getBucketName());
            tencentStorage.setRegion(tencent.getRegion());
        }
        return tencentStorage;
    }

    @Bean
    @ConditionalOnProperty(prefix = "litemall.storage", name = "active", havingValue = "qiniu")
    public QiniuStorage qiniuStorage() {
        QiniuStorage qiniuStorage = new QiniuStorage();
        StorageProperties.Qiniu qiniu = this.properties.getQiniu();
        if (qiniu != null) {
            qiniuStorage.setAccessKey(qiniu.getAccessKey());
            qiniuStorage.setSecretKey(qiniu.getSecretKey());
            qiniuStorage.setBucketName(qiniu.getBucketName());
            qiniuStorage.setEndpoint(qiniu.getEndpoint());
        }
        return qiniuStorage;
    }
}
