package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.linlinjava.litemall.db.dao.LitemallLockerMapper;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallLockerExample;
import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LitemallLockerService {
    @Resource
    private LitemallLockerMapper lockerMapper;

    public List<LitemallLocker> querySelective(String cabinetNumber, String zone, 
                                               String status, Integer page, 
                                               Integer limit, String sort, String order) {
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();

        if (!StringUtils.isEmpty(cabinetNumber)) {
            criteria.andCabinetNumberLike("%" + cabinetNumber + "%");
        }
        if (!StringUtils.isEmpty(zone)) {
            criteria.andZoneEqualTo(zone);
        }
        if (!StringUtils.isEmpty(status)) {
            criteria.andStatusEqualTo(status);
        }
        criteria.andDeletedEqualTo(false);

        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            example.setOrderByClause(sort + " " + order);
        }

        PageHelper.startPage(page, limit);
        return lockerMapper.selectByExample(example);
    }

    public int updateById(LitemallLocker locker) {
        locker.setUpdateTime(LocalDateTime.now());
        return lockerMapper.updateByPrimaryKeySelective(locker);
    }

    public LitemallLocker findById(Integer id) {
        return lockerMapper.selectByPrimaryKey(id);
    }
}