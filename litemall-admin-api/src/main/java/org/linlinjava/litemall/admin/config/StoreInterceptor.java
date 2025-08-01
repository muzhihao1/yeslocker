package org.linlinjava.litemall.admin.config;

import org.linlinjava.litemall.core.context.StoreContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 门店拦截器
 * 从请求头中提取门店 ID 并设置到 StoreContext 中
 * 
 * @author Litemall Team
 * @since 1.0.0
 */
@Component
public class StoreInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(StoreInterceptor.class);
    
    /**
     * 请求头中的门店 ID 字段名
     */
    private static final String STORE_ID_HEADER = "X-Store-Id";
    
    /**
     * 默认门店 ID
     */
    private static final Integer DEFAULT_STORE_ID = 1;
    
    /**
     * 在请求处理之前执行
     * 从请求头中提取门店 ID 并设置到 StoreContext
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 从请求头获取门店 ID
        String storeIdStr = request.getHeader(STORE_ID_HEADER);
        
        if (!StringUtils.isEmpty(storeIdStr)) {
            try {
                Integer storeId = Integer.valueOf(storeIdStr);
                StoreContext.setStoreId(storeId);
                logger.debug("Set store ID in context: {}", storeId);
            } catch (NumberFormatException e) {
                logger.warn("Invalid store ID in header: {}", storeIdStr);
                // 设置默认门店 ID
                StoreContext.setStoreId(DEFAULT_STORE_ID);
            }
        } else {
            // 如果请求头中没有门店 ID，设置默认值
            StoreContext.setStoreId(DEFAULT_STORE_ID);
            logger.debug("No store ID in header, using default: {}", DEFAULT_STORE_ID);
        }
        
        return true;
    }
    
    /**
     * 在请求处理之后执行（在视图渲染之前）
     */
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, 
                          ModelAndView modelAndView) throws Exception {
        // 这里可以添加需要在视图渲染前执行的逻辑
    }
    
    /**
     * 在整个请求结束之后执行（视图渲染完毕）
     * 清理 ThreadLocal 中的门店 ID，防止内存泄漏
     */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, 
                               Exception ex) throws Exception {
        // 清理 ThreadLocal
        StoreContext.clear();
        logger.debug("Cleared store context");
    }
}