package org.linlinjava.litemall.core.exception;

/**
 * 业务异常类
 * 用于处理储物柜系统的业务逻辑异常
 */
public class BusinessException extends RuntimeException {
    
    private Integer code;
    private String message;
    
    public BusinessException(String message) {
        super(message);
        this.code = 500;
        this.message = message;
    }
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.code = 500;
        this.message = message;
    }
    
    public Integer getCode() {
        return code;
    }
    
    public void setCode(Integer code) {
        this.code = code;
    }
    
    @Override
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    /**
     * 常用业务异常
     */
    public static BusinessException userNotFound() {
        return new BusinessException(601, "用户不存在");
    }
    
    public static BusinessException lockerNotAvailable() {
        return new BusinessException(602, "储物柜不可用");
    }
    
    public static BusinessException voucherInvalid() {
        return new BusinessException(603, "凭证无效或已过期");
    }
    
    public static BusinessException hasActiveStorage() {
        return new BusinessException(604, "您已有正在使用的储物柜");
    }
    
    public static BusinessException operationNotFound() {
        return new BusinessException(605, "操作记录不存在");
    }
    
    public static BusinessException identityNotVerified() {
        return new BusinessException(606, "请先完成身份验证");
    }
    
    public static BusinessException exceedMaxStorage() {
        return new BusinessException(607, "超过最大存储数量限制");
    }
}