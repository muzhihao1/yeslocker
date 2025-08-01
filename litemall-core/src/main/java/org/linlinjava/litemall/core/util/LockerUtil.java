package org.linlinjava.litemall.core.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 储物柜工具类
 * 提供凭证码生成、格式化等功能
 */
public class LockerUtil {
    
    private static final String VOUCHER_PREFIX = "YS";
    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    
    /**
     * 生成凭证码
     * 格式：YS + 日期(YYMMDD) + 6位随机码
     * 示例：YS240122A8K9P3
     */
    public static String generateVoucherCode() {
        LocalDateTime now = LocalDateTime.now();
        String dateStr = now.format(DateTimeFormatter.ofPattern("yyMMdd"));
        
        StringBuilder randomStr = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            randomStr.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        
        return VOUCHER_PREFIX + dateStr + randomStr.toString();
    }
    
    /**
     * 生成操作编号
     * 格式：OP + 时间戳 + 4位随机数
     */
    public static String generateOperationNo() {
        long timestamp = System.currentTimeMillis();
        int random = RANDOM.nextInt(9000) + 1000;
        return "OP" + timestamp + random;
    }
    
    /**
     * 格式化储物柜编号显示
     * A01 -> A区01号
     */
    public static String formatCabinetNumber(String cabinetNumber) {
        if (cabinetNumber == null || cabinetNumber.length() < 3) {
            return cabinetNumber;
        }
        
        String zone = cabinetNumber.substring(0, 1);
        String number = cabinetNumber.substring(1);
        return zone + "区" + number + "号";
    }
    
    /**
     * 计算剩余天数
     */
    public static int calculateDaysRemaining(LocalDateTime expiredAt) {
        if (expiredAt == null) {
            return 0;
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(expiredAt)) {
            return 0;
        }
        
        long hours = java.time.Duration.between(now, expiredAt).toHours();
        return (int) Math.ceil(hours / 24.0);
    }
    
    /**
     * 检查凭证是否过期
     */
    public static boolean isVoucherExpired(LocalDateTime expiredAt) {
        if (expiredAt == null) {
            return true;
        }
        return LocalDateTime.now().isAfter(expiredAt);
    }
    
    /**
     * 生成二维码内容
     * 格式：LOCKER:凭证码
     */
    public static String generateQrContent(String voucherCode) {
        return "LOCKER:" + voucherCode;
    }
    
    /**
     * 解析二维码内容获取凭证码
     */
    public static String parseQrContent(String qrContent) {
        if (qrContent == null || !qrContent.startsWith("LOCKER:")) {
            return null;
        }
        return qrContent.substring(7);
    }
}