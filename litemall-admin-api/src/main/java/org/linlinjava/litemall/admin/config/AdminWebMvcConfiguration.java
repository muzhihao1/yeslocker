package org.linlinjava.litemall.admin.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Admin API Web MVC 配置
 * 
 * @author Litemall Team
 * @since 1.0.0
 */
@Configuration
public class AdminWebMvcConfiguration implements WebMvcConfigurer {
    
    @Autowired
    private StoreInterceptor storeInterceptor;
    
    /**
     * 添加拦截器
     * 
     * @param registry 拦截器注册器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册门店拦截器
        // 拦截所有请求，但排除静态资源和错误页面
        registry.addInterceptor(storeInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/error", "/static/**", "/webjars/**");
    }
}