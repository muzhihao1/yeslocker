-- Test data for lockers (50+ entries)
-- For Terminal A support - A03 task

-- Clear existing test data
DELETE FROM litemall_locker WHERE cabinet_number LIKE 'TEST-%';

-- Insert test lockers with various states
-- Zone A: 20 lockers
INSERT INTO litemall_locker (cabinet_number, zone, status, location, notes, store_id, assigned_user_id, current_user_id, add_time, update_time) VALUES
('TEST-A001', 'A区', 'available', '1楼大厅左侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A002', 'A区', 'available', '1楼大厅左侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A003', 'A区', 'occupied', '1楼大厅左侧', '测试柜子', 1, NULL, 101, NOW(), NOW()),
('TEST-A004', 'A区', 'available', '1楼大厅左侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A005', 'A区', 'maintenance', '1楼大厅左侧', '维修中', 1, NULL, NULL, NOW(), NOW()),
('TEST-A006', 'A区', 'available', '1楼大厅左侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A007', 'A区', 'occupied', '1楼大厅左侧', '测试柜子', 1, NULL, 102, NOW(), NOW()),
('TEST-A008', 'A区', 'available', '1楼大厅左侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A009', 'A区', 'available', '1楼大厅左侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A010', 'A区', 'occupied', '1楼大厅左侧', '测试柜子', 1, NULL, 103, NOW(), NOW()),
('TEST-A011', 'A区', 'available', '1楼大厅右侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A012', 'A区', 'available', '1楼大厅右侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A013', 'A区', 'maintenance', '1楼大厅右侧', '锁坏了', 1, NULL, NULL, NOW(), NOW()),
('TEST-A014', 'A区', 'available', '1楼大厅右侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A015', 'A区', 'occupied', '1楼大厅右侧', '测试柜子', 1, NULL, 104, NOW(), NOW()),
('TEST-A016', 'A区', 'available', '1楼大厅右侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A017', 'A区', 'available', '1楼大厅右侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A018', 'A区', 'available', '1楼大厅右侧', '测试柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-A019', 'A区', 'occupied', '1楼大厅右侧', '测试柜子', 1, NULL, 105, NOW(), NOW()),
('TEST-A020', 'A区', 'available', '1楼大厅右侧', '测试柜子', 1, NULL, NULL, NOW(), NOW());

-- Zone B: 20 lockers
INSERT INTO litemall_locker (cabinet_number, zone, status, location, notes, store_id, assigned_user_id, current_user_id, add_time, update_time) VALUES
('TEST-B001', 'B区', 'available', '2楼VIP区', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B002', 'B区', 'available', '2楼VIP区', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B003', 'B区', 'occupied', '2楼VIP区', 'VIP专用', 1, NULL, 201, NOW(), NOW()),
('TEST-B004', 'B区', 'available', '2楼VIP区', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B005', 'B区', 'available', '2楼VIP区', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B006', 'B区', 'maintenance', '2楼VIP区', '清洁中', 1, NULL, NULL, NOW(), NOW()),
('TEST-B007', 'B区', 'available', '2楼VIP区', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B008', 'B区', 'occupied', '2楼VIP区', 'VIP专用', 1, NULL, 202, NOW(), NOW()),
('TEST-B009', 'B区', 'available', '2楼VIP区', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B010', 'B区', 'available', '2楼VIP区', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B011', 'B区', 'available', '2楼VIP区左侧', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B012', 'B区', 'occupied', '2楼VIP区左侧', 'VIP专用', 1, NULL, 203, NOW(), NOW()),
('TEST-B013', 'B区', 'available', '2楼VIP区左侧', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B014', 'B区', 'available', '2楼VIP区左侧', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B015', 'B区', 'maintenance', '2楼VIP区左侧', '升级中', 1, NULL, NULL, NOW(), NOW()),
('TEST-B016', 'B区', 'available', '2楼VIP区左侧', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B017', 'B区', 'available', '2楼VIP区左侧', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B018', 'B区', 'occupied', '2楼VIP区左侧', 'VIP专用', 1, NULL, 204, NOW(), NOW()),
('TEST-B019', 'B区', 'available', '2楼VIP区左侧', 'VIP专用', 1, NULL, NULL, NOW(), NOW()),
('TEST-B020', 'B区', 'available', '2楼VIP区左侧', 'VIP专用', 1, NULL, NULL, NOW(), NOW());

-- Zone C: 15 lockers
INSERT INTO litemall_locker (cabinet_number, zone, status, location, notes, store_id, assigned_user_id, current_user_id, add_time, update_time) VALUES
('TEST-C001', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C002', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C003', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C004', 'C区', 'occupied', '地下一层', '普通柜子', 1, NULL, 301, NOW(), NOW()),
('TEST-C005', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C006', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C007', 'C区', 'maintenance', '地下一层', '待修理', 1, NULL, NULL, NOW(), NOW()),
('TEST-C008', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C009', 'C区', 'occupied', '地下一层', '普通柜子', 1, NULL, 302, NOW(), NOW()),
('TEST-C010', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C011', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C012', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C013', 'C区', 'occupied', '地下一层', '普通柜子', 1, NULL, 303, NOW(), NOW()),
('TEST-C014', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW()),
('TEST-C015', 'C区', 'available', '地下一层', '普通柜子', 1, NULL, NULL, NOW(), NOW());

-- Different store lockers (Store 2)
INSERT INTO litemall_locker (cabinet_number, zone, status, location, notes, store_id, assigned_user_id, current_user_id, add_time, update_time) VALUES
('TEST-S2-001', 'A区', 'available', '浦东店1楼', '测试柜子', 2, NULL, NULL, NOW(), NOW()),
('TEST-S2-002', 'A区', 'available', '浦东店1楼', '测试柜子', 2, NULL, NULL, NOW(), NOW()),
('TEST-S2-003', 'A区', 'occupied', '浦东店1楼', '测试柜子', 2, NULL, 401, NOW(), NOW()),
('TEST-S2-004', 'B区', 'available', '浦东店2楼', 'VIP专用', 2, NULL, NULL, NOW(), NOW()),
('TEST-S2-005', 'B区', 'available', '浦东店2楼', 'VIP专用', 2, NULL, NULL, NOW(), NOW());

-- Summary by status:
-- available: 40 lockers
-- occupied: 12 lockers  
-- maintenance: 5 lockers
-- Total: 60 test lockers