package org.linlinjava.litemall.db.dao;

import org.apache.ibatis.annotations.Param;
import org.linlinjava.litemall.db.domain.LitemallVoucher;
import org.linlinjava.litemall.db.domain.LitemallVoucherExample;

import java.util.List;

public interface LitemallVoucherMapper {
    long countByExample(LitemallVoucherExample example);

    int deleteByExample(LitemallVoucherExample example);

    int deleteByPrimaryKey(Integer id);

    int insert(LitemallVoucher record);

    int insertSelective(LitemallVoucher record);

    List<LitemallVoucher> selectByExample(LitemallVoucherExample example);

    LitemallVoucher selectByPrimaryKey(Integer id);

    int updateByExampleSelective(@Param("record") LitemallVoucher record, @Param("example") LitemallVoucherExample example);

    int updateByExample(@Param("record") LitemallVoucher record, @Param("example") LitemallVoucherExample example);

    int updateByPrimaryKeySelective(LitemallVoucher record);

    int updateByPrimaryKey(LitemallVoucher record);
}