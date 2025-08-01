package org.linlinjava.litemall.db.dao;

import org.apache.ibatis.annotations.Param;
import org.linlinjava.litemall.db.domain.LitemallStorageRequest;

import java.util.List;

public interface LitemallStorageRequestMapper {
    int deleteByPrimaryKey(Integer id);

    int insert(LitemallStorageRequest record);

    int insertSelective(LitemallStorageRequest record);

    LitemallStorageRequest selectByPrimaryKey(Integer id);

    int updateByPrimaryKeySelective(LitemallStorageRequest record);

    int updateByPrimaryKey(LitemallStorageRequest record);
    
    List<LitemallStorageRequest> selectByUserId(@Param("userId") Integer userId);
    
    List<LitemallStorageRequest> selectActiveByUserId(@Param("userId") Integer userId);
    
    LitemallStorageRequest selectByRequestCode(@Param("requestCode") String requestCode);
    
    List<LitemallStorageRequest> selectByStatus(@Param("status") String status);
    
    String generateRequestCode();
}