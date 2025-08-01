package org.linlinjava.litemall.core.util;

import java.security.SecureRandom;
import java.util.Random;

/**
 * 随机数工具类
 */
public class RandomUtil {
    
    private static final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final String NUMBERS = "0123456789";
    private static final String UPPER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER_ALPHABET = "abcdefghijklmnopqrstuvwxyz";
    
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Random RANDOM = new Random();

    /**
     * 生成随机字符串（包含字母和数字）
     * @param length 长度
     * @return 随机字符串
     */
    public static String getRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(SECURE_RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    /**
     * 生成随机数字字符串
     * @param length 长度
     * @return 随机数字字符串
     */
    public static String getRandomNumber(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(NUMBERS.charAt(SECURE_RANDOM.nextInt(NUMBERS.length())));
        }
        return sb.toString();
    }

    /**
     * 生成随机大写字母字符串
     * @param length 长度
     * @return 随机大写字母字符串
     */
    public static String getRandomUpperCase(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(UPPER_ALPHABET.charAt(SECURE_RANDOM.nextInt(UPPER_ALPHABET.length())));
        }
        return sb.toString();
    }

    /**
     * 生成随机小写字母字符串
     * @param length 长度
     * @return 随机小写字母字符串
     */
    public static String getRandomLowerCase(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(LOWER_ALPHABET.charAt(SECURE_RANDOM.nextInt(LOWER_ALPHABET.length())));
        }
        return sb.toString();
    }

    /**
     * 生成指定范围的随机整数
     * @param min 最小值（包含）
     * @param max 最大值（包含）
     * @return 随机整数
     */
    public static int getRandomInt(int min, int max) {
        if (min > max) {
            throw new IllegalArgumentException("min should be less than or equal to max");
        }
        return RANDOM.nextInt(max - min + 1) + min;
    }

    /**
     * 生成短信验证码
     * @param length 验证码长度
     * @return 验证码
     */
    public static String getSmsCode(int length) {
        return getRandomNumber(length);
    }

    /**
     * 生成凭证码（日期-随机码格式）
     * @param prefix 前缀
     * @param suffixLength 后缀长度
     * @return 凭证码
     */
    public static String getVoucherCode(String prefix, int suffixLength) {
        String suffix = getRandomString(suffixLength).toUpperCase();
        return prefix + "-" + suffix;
    }
}