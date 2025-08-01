package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
import org.linlinjava.litemall.db.dao.LitemallVoucherMapper;
import org.linlinjava.litemall.db.domain.LitemallVoucher;
import org.linlinjava.litemall.db.domain.LitemallVoucherExample;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 凭证服务
 * 管理储物柜存取凭证的创建、查询和验证
 */
@Service
public class LitemallVoucherService {
    
    @Resource
    private LitemallVoucherMapper voucherMapper;
    
    private static final String VOUCHER_PREFIX = "YS";
    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    
    /**
     * 生成凭证码
     */
    private String generateVoucherCode() {
        LocalDateTime now = LocalDateTime.now();
        String dateStr = now.format(DateTimeFormatter.ofPattern("yyMMdd"));
        
        StringBuilder randomStr = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            randomStr.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        
        return VOUCHER_PREFIX + dateStr + randomStr.toString();
    }
    
    /**
     * 生成二维码内容
     */
    private String generateQrContent(String voucherCode) {
        return "LOCKER:" + voucherCode;
    }
    
    /**
     * 检查凭证是否过期
     */
    private boolean isVoucherExpired(LocalDateTime expiredAt) {
        if (expiredAt == null) {
            return true;
        }
        return LocalDateTime.now().isAfter(expiredAt);
    }
    
    /**
     * 创建新凭证
     */
    @Transactional
    public LitemallVoucher createVoucher(Integer operationId, Integer userId, Integer validDays) {
        LitemallVoucher voucher = new LitemallVoucher();
        voucher.setOperationId(operationId);
        voucher.setUserId(userId);
        voucher.setCode(generateVoucherCode());
        voucher.setStatus("ACTIVE");
        voucher.setValidDays(validDays);
        
        LocalDateTime now = LocalDateTime.now();
        voucher.setCreatedAt(now);
        voucher.setExpiredAt(now.plusDays(validDays));
        voucher.setAddTime(now);
        voucher.setUpdateTime(now);
        voucher.setDeleted(false);
        
        // 生成二维码内容
        String qrContent = generateQrContent(voucher.getCode());
        voucher.setQrCodeUrl("/storage/qr/" + voucher.getCode() + ".png"); // 暂时使用占位URL
        
        voucherMapper.insertSelective(voucher);
        return voucher;
    }
    
    /**
     * 根据凭证码查询
     */
    public LitemallVoucher findByCode(String code) {
        LitemallVoucherExample example = new LitemallVoucherExample();
        example.createCriteria()
                .andCodeEqualTo(code)
                .andDeletedEqualTo(false);
        
        List<LitemallVoucher> vouchers = voucherMapper.selectByExample(example);
        return vouchers.isEmpty() ? null : vouchers.get(0);
    }
    
    /**
     * 验证凭证有效性
     */
    public boolean validateVoucher(String code) {
        LitemallVoucher voucher = findByCode(code);
        if (voucher == null) {
            return false;
        }
        
        // 检查状态
        if (!"ACTIVE".equals(voucher.getStatus())) {
            return false;
        }
        
        // 检查是否过期
        if (isVoucherExpired(voucher.getExpiredAt())) {
            // 更新状态为过期
            voucher.setStatus("EXPIRED");
            voucher.setUpdateTime(LocalDateTime.now());
            voucherMapper.updateByPrimaryKeySelective(voucher);
            return false;
        }
        
        return true;
    }
    
    /**
     * 使用凭证
     */
    @Transactional
    public void useVoucher(String code) {
        LitemallVoucher voucher = findByCode(code);
        if (voucher != null && "ACTIVE".equals(voucher.getStatus())) {
            voucher.setStatus("USED");
            voucher.setUsedAt(LocalDateTime.now());
            voucher.setUpdateTime(LocalDateTime.now());
            voucherMapper.updateByPrimaryKeySelective(voucher);
        }
    }
    
    /**
     * 根据操作ID查询凭证
     */
    public LitemallVoucher findByOperationId(Integer operationId) {
        LitemallVoucherExample example = new LitemallVoucherExample();
        example.createCriteria()
                .andOperationIdEqualTo(operationId)
                .andDeletedEqualTo(false);
        
        List<LitemallVoucher> vouchers = voucherMapper.selectByExample(example);
        return vouchers.isEmpty() ? null : vouchers.get(0);
    }
    
    /**
     * 查询用户的凭证列表
     */
    public List<LitemallVoucher> queryByUserId(Integer userId, Integer page, Integer limit) {
        LitemallVoucherExample example = new LitemallVoucherExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andDeletedEqualTo(false);
        example.setOrderByClause("created_at DESC");
        
        PageHelper.startPage(page, limit);
        return voucherMapper.selectByExample(example);
    }
    
    /**
     * 更新过期凭证状态
     */
    @Transactional
    public int updateExpiredVouchers() {
        LitemallVoucherExample example = new LitemallVoucherExample();
        example.createCriteria()
                .andStatusEqualTo("ACTIVE")
                .andExpiredAtLessThan(LocalDateTime.now())
                .andDeletedEqualTo(false);
        
        LitemallVoucher update = new LitemallVoucher();
        update.setStatus("EXPIRED");
        update.setUpdateTime(LocalDateTime.now());
        
        return voucherMapper.updateByExampleSelective(update, example);
    }
    
    /**
     * 查询即将过期的凭证（提前3天提醒）
     */
    public List<LitemallVoucher> findExpiringSoon(int days) {
        LocalDateTime deadline = LocalDateTime.now().plusDays(days);
        
        LitemallVoucherExample example = new LitemallVoucherExample();
        example.createCriteria()
                .andStatusEqualTo("ACTIVE")
                .andExpiredAtBetween(LocalDateTime.now(), deadline)
                .andDeletedEqualTo(false);
        
        return voucherMapper.selectByExample(example);
    }
    
    /**
     * 查询用户的凭证列表
     */
    public List<LitemallVoucher> queryByUser(Integer userId, Integer page, Integer limit) {
        LitemallVoucherExample example = new LitemallVoucherExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andDeletedEqualTo(false);
        example.setOrderByClause("created_at DESC");
        
        PageHelper.startPage(page, limit);
        return voucherMapper.selectByExample(example);
    }
    
    /**
     * 统计用户的活跃凭证数量
     */
    public long countActiveByUser(Integer userId) {
        LitemallVoucherExample example = new LitemallVoucherExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andStatusEqualTo("ACTIVE")
                .andDeletedEqualTo(false);
        
        return voucherMapper.countByExample(example);
    }
    
    /**
     * 统计用户的总凭证数量
     */
    public long countByUser(Integer userId) {
        LitemallVoucherExample example = new LitemallVoucherExample();
        example.createCriteria()
                .andUserIdEqualTo(userId)
                .andDeletedEqualTo(false);
        
        return voucherMapper.countByExample(example);
    }
}