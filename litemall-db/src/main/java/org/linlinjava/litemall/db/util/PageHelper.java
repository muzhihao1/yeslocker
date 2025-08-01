package org.linlinjava.litemall.db.util;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageInfo;

import java.util.List;

/**
 * 分页辅助工具类
 * 提供优化的分页查询支持
 */
public class PageHelper {
    
    // 最大页码限制
    public static final int MAX_PAGE = 100;
    // 单页最大记录数
    public static final int MAX_PAGE_SIZE = 100;
    // 默认页码
    public static final int DEFAULT_PAGE = 1;
    // 默认页大小
    public static final int DEFAULT_PAGE_SIZE = 20;
    
    /**
     * 验证并标准化分页参数
     */
    public static PageParam normalize(Integer page, Integer limit) {
        if (page == null || page < 1) {
            page = DEFAULT_PAGE;
        }
        if (page > MAX_PAGE) {
            page = MAX_PAGE;
        }
        
        if (limit == null || limit < 1) {
            limit = DEFAULT_PAGE_SIZE;
        }
        if (limit > MAX_PAGE_SIZE) {
            limit = MAX_PAGE_SIZE;
        }
        
        return new PageParam(page, limit);
    }
    
    /**
     * 计算分页偏移量
     */
    public static int calculateOffset(int page, int limit) {
        return (page - 1) * limit;
    }
    
    /**
     * 创建分页结果
     */
    public static <T> PageResult<T> createPageResult(List<T> list, long total, int page, int limit) {
        PageResult<T> result = new PageResult<>();
        result.setList(list);
        result.setTotal(total);
        result.setPageNum(page);
        result.setPageSize(limit);
        result.setPages((int) Math.ceil((double) total / limit));
        result.setHasNextPage(page < result.getPages());
        result.setHasPreviousPage(page > 1);
        return result;
    }
    
    /**
     * 从 PageHelper 的 Page 对象创建结果
     */
    public static <T> PageResult<T> fromPage(Page<T> page) {
        return createPageResult(
            page.getResult(),
            page.getTotal(),
            page.getPageNum(),
            page.getPageSize()
        );
    }
    
    /**
     * 从 PageInfo 创建结果
     */
    public static <T> PageResult<T> fromPageInfo(PageInfo<T> pageInfo) {
        PageResult<T> result = new PageResult<>();
        result.setList(pageInfo.getList());
        result.setTotal(pageInfo.getTotal());
        result.setPageNum(pageInfo.getPageNum());
        result.setPageSize(pageInfo.getPageSize());
        result.setPages(pageInfo.getPages());
        result.setHasNextPage(pageInfo.isHasNextPage());
        result.setHasPreviousPage(pageInfo.isHasPreviousPage());
        return result;
    }
    
    /**
     * 分页参数类
     */
    public static class PageParam {
        private final int page;
        private final int limit;
        
        public PageParam(int page, int limit) {
            this.page = page;
            this.limit = limit;
        }
        
        public int getPage() {
            return page;
        }
        
        public int getLimit() {
            return limit;
        }
        
        public int getOffset() {
            return calculateOffset(page, limit);
        }
    }
    
    /**
     * 分页结果类
     */
    public static class PageResult<T> {
        private List<T> list;
        private long total;
        private int pageNum;
        private int pageSize;
        private int pages;
        private boolean hasNextPage;
        private boolean hasPreviousPage;
        
        // Getters and setters
        public List<T> getList() {
            return list;
        }
        
        public void setList(List<T> list) {
            this.list = list;
        }
        
        public long getTotal() {
            return total;
        }
        
        public void setTotal(long total) {
            this.total = total;
        }
        
        public int getPageNum() {
            return pageNum;
        }
        
        public void setPageNum(int pageNum) {
            this.pageNum = pageNum;
        }
        
        public int getPageSize() {
            return pageSize;
        }
        
        public void setPageSize(int pageSize) {
            this.pageSize = pageSize;
        }
        
        public int getPages() {
            return pages;
        }
        
        public void setPages(int pages) {
            this.pages = pages;
        }
        
        public boolean isHasNextPage() {
            return hasNextPage;
        }
        
        public void setHasNextPage(boolean hasNextPage) {
            this.hasNextPage = hasNextPage;
        }
        
        public boolean isHasPreviousPage() {
            return hasPreviousPage;
        }
        
        public void setHasPreviousPage(boolean hasPreviousPage) {
            this.hasPreviousPage = hasPreviousPage;
        }
    }
}