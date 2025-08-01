package org.linlinjava.litemall.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 管理后台静态资源配置
 */
@Configuration
public class AdminWebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置管理后台静态资源
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("file:litemall-admin/dist/");
                
        // 配置管理后台首页
        registry.addResourceHandler("/admin")
                .addResourceLocations("file:litemall-admin/dist/index.html");
    }
}