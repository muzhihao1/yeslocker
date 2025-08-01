package org.linlinjava.litemall.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * 跨域配置
 * 用于支持前端开发服务器访问后端 API
 */
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许的源地址
        config.addAllowedOrigin("http://localhost:8081"); // UniApp H5 开发服务器
        config.addAllowedOrigin("http://localhost:8082"); // 备用端口
        config.addAllowedOrigin("http://localhost:8090"); // Admin panel
        config.addAllowedOrigin("http://localhost:9527"); // Admin panel dev server
        config.addAllowedOrigin("http://127.0.0.1:8081");
        config.addAllowedOrigin("http://127.0.0.1:8082");
        config.addAllowedOrigin("http://127.0.0.1:8090");
        config.addAllowedOrigin("http://127.0.0.1:9527");
        
        // 生产环境配置
        // config.addAllowedOrigin("https://yeslocker.com");
        
        // 允许发送 Cookie
        config.setAllowCredentials(true);
        
        // 允许的请求方法
        config.addAllowedMethod("*");
        
        // 允许的请求头
        config.addAllowedHeader("*");
        
        // 暴露的响应头
        config.addExposedHeader("X-Litemall-Token");
        
        // 预检请求的有效期，单位为秒
        config.setMaxAge(3600L);
        
        // 配置路径
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}