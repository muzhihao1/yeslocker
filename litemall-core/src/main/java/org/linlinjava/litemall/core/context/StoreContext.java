package org.linlinjava.litemall.core.context;

/**
 * 门店上下文持有器
 * 使用 ThreadLocal 在当前线程中保存门店 ID
 * 
 * @author Litemall Team
 * @since 1.0.0
 */
public class StoreContext {
    
    /**
     * ThreadLocal 存储当前线程的门店 ID
     */
    private static final ThreadLocal<Integer> STORE_ID_HOLDER = new ThreadLocal<>();
    
    /**
     * 私有构造函数，防止实例化
     */
    private StoreContext() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
    
    /**
     * 设置当前线程的门店 ID
     * 
     * @param storeId 门店 ID
     */
    public static void setStoreId(Integer storeId) {
        STORE_ID_HOLDER.set(storeId);
    }
    
    /**
     * 获取当前线程的门店 ID
     * 
     * @return 门店 ID，如果未设置则返回 null
     */
    public static Integer getStoreId() {
        return STORE_ID_HOLDER.get();
    }
    
    /**
     * 清除当前线程的门店 ID
     * 重要：必须在请求处理完成后调用，避免内存泄漏
     */
    public static void clear() {
        STORE_ID_HOLDER.remove();
    }
    
    /**
     * 检查当前线程是否设置了门店 ID
     * 
     * @return 如果设置了门店 ID 返回 true，否则返回 false
     */
    public static boolean hasStoreId() {
        return STORE_ID_HOLDER.get() != null;
    }
    
    /**
     * 获取门店 ID，如果未设置则返回默认值
     * 
     * @param defaultStoreId 默认门店 ID
     * @return 门店 ID
     */
    public static Integer getStoreIdOrDefault(Integer defaultStoreId) {
        Integer storeId = STORE_ID_HOLDER.get();
        return storeId != null ? storeId : defaultStoreId;
    }
}