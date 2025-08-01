#!/bin/bash

# B02 查询性能测试脚本
# 用于测试储物柜系统查询优化效果

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 数据库配置
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="litemall"
DB_USER="litemall"
DB_PASSWORD="litemall123456"

# API配置
API_BASE_URL="http://localhost:8080"
ADMIN_TOKEN=""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}储物柜系统查询性能测试${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查 MySQL 连接
check_mysql() {
    echo -e "\n${YELLOW}检查数据库连接...${NC}"
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ 数据库连接成功${NC}"
        return 0
    else
        echo -e "${RED}✗ 数据库连接失败${NC}"
        return 1
    fi
}

# 执行 SQL 查询并计时
execute_query() {
    local query="$1"
    local description="$2"
    
    echo -e "\n${YELLOW}测试: $description${NC}"
    echo "查询: $query"
    
    # 执行查询并计时
    start_time=$(date +%s.%N)
    result=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "$query" 2>&1)
    end_time=$(date +%s.%N)
    
    # 计算执行时间
    execution_time=$(echo "$end_time - $start_time" | bc)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 执行成功 - 耗时: ${execution_time}秒${NC}"
        # 显示结果行数
        row_count=$(echo "$result" | wc -l)
        echo "返回行数: $((row_count - 1))"
    else
        echo -e "${RED}✗ 执行失败${NC}"
        echo "$result"
    fi
}

# 测试 API 端点性能
test_api_endpoint() {
    local endpoint="$1"
    local description="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    
    echo -e "\n${YELLOW}API测试: $description${NC}"
    echo "端点: $endpoint"
    
    # 构建 curl 命令
    curl_cmd="curl -s -w '\n%{time_total}' -X $method"
    
    if [ -n "$ADMIN_TOKEN" ]; then
        curl_cmd="$curl_cmd -H 'X-Litemall-Admin-Token: $ADMIN_TOKEN'"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$API_BASE_URL$endpoint'"
    
    # 执行请求
    start_time=$(date +%s.%N)
    response=$(eval $curl_cmd)
    
    # 提取响应时间
    response_time=$(echo "$response" | tail -n 1)
    response_body=$(echo "$response" | head -n -1)
    
    # 检查响应
    if echo "$response_body" | jq -e '.errno == 0' >/dev/null 2>&1; then
        echo -e "${GREEN}✓ 请求成功 - 耗时: ${response_time}秒${NC}"
        # 显示返回的数据条数
        if echo "$response_body" | jq -e '.data.list' >/dev/null 2>&1; then
            count=$(echo "$response_body" | jq '.data.list | length')
            total=$(echo "$response_body" | jq '.data.total // 0')
            echo "返回记录数: $count, 总记录数: $total"
        fi
    else
        echo -e "${RED}✗ 请求失败${NC}"
        echo "$response_body" | jq '.'
    fi
}

# 测试查询性能
test_queries() {
    echo -e "\n${GREEN}=== 数据库查询性能测试 ===${NC}"
    
    # 1. 测试储物柜列表查询（无索引优化前的基准）
    execute_query \
        "SELECT * FROM litemall_locker WHERE deleted = 0 ORDER BY id DESC LIMIT 20;" \
        "储物柜列表查询（基础）"
    
    # 2. 测试带条件的储物柜查询
    execute_query \
        "SELECT l.*, u.username FROM litemall_locker l 
         LEFT JOIN litemall_user u ON l.current_user_id = u.id 
         WHERE l.store_id = 1 AND l.status = 'available' AND l.deleted = 0 
         ORDER BY l.zone, l.cabinet_number LIMIT 20;" \
        "可用储物柜查询（带JOIN）"
    
    # 3. 测试用户操作记录查询
    execute_query \
        "SELECT o.*, l.cabinet_number, l.zone FROM litemall_locker_operation o
         INNER JOIN litemall_locker l ON o.locker_id = l.id
         WHERE o.user_id = 1 AND o.deleted = 0
         ORDER BY o.add_time DESC LIMIT 20;" \
        "用户操作记录查询"
    
    # 4. 测试凭证查询
    execute_query \
        "SELECT * FROM litemall_voucher 
         WHERE user_id = 1 AND status = 'active' AND expired_at > NOW()
         ORDER BY created_at DESC LIMIT 10;" \
        "用户有效凭证查询"
    
    # 5. 测试存取申请查询
    execute_query \
        "SELECT r.*, l.cabinet_number, u.username FROM litemall_storage_request r
         INNER JOIN litemall_locker l ON r.locker_id = l.id
         INNER JOIN litemall_user u ON r.user_id = u.id
         WHERE r.store_id = 1 AND r.status = 'pending' AND r.deleted = 0
         ORDER BY r.add_time DESC LIMIT 20;" \
        "待处理申请查询（多表JOIN）"
    
    # 6. 测试统计查询
    execute_query \
        "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
            SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
            SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
         FROM litemall_locker 
         WHERE store_id = 1 AND deleted = 0;" \
        "储物柜状态统计"
    
    # 7. 测试深分页查询
    execute_query \
        "SELECT * FROM litemall_locker_operation 
         WHERE deleted = 0 
         ORDER BY id DESC 
         LIMIT 20 OFFSET 10000;" \
        "深分页查询（OFFSET 10000）"
}

# 测试 API 性能
test_apis() {
    echo -e "\n${GREEN}=== API 接口性能测试 ===${NC}"
    
    # 登录获取 token
    echo -e "\n${YELLOW}获取管理员 Token...${NC}"
    login_response=$(curl -s -X POST "$API_BASE_URL/admin/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin123","password":"admin123"}')
    
    ADMIN_TOKEN=$(echo "$login_response" | jq -r '.data.token // empty')
    
    if [ -n "$ADMIN_TOKEN" ]; then
        echo -e "${GREEN}✓ 登录成功${NC}"
    else
        echo -e "${RED}✗ 登录失败${NC}"
        return 1
    fi
    
    # 测试各个 API
    test_api_endpoint "/admin/locker/list?page=1&limit=20" "储物柜列表（第1页）"
    test_api_endpoint "/admin/locker/list?page=10&limit=20" "储物柜列表（第10页）"
    test_api_endpoint "/admin/locker/list?page=1&limit=100" "储物柜列表（大页面）"
    test_api_endpoint "/admin/locker/list?zone=A区&status=available&page=1&limit=20" "条件查询"
    
    test_api_endpoint "/admin/locker/operations?page=1&limit=20" "操作记录列表"
    test_api_endpoint "/admin/storage/requests?status=pending&page=1&limit=20" "待处理申请"
    test_api_endpoint "/admin/voucher/list?page=1&limit=20" "凭证列表"
}

# 分析查询计划
analyze_query_plans() {
    echo -e "\n${GREEN}=== 查询计划分析 ===${NC}"
    
    # 分析主要查询的执行计划
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
-- 1. 储物柜查询计划
EXPLAIN SELECT l.*, u.username FROM litemall_locker l 
LEFT JOIN litemall_user u ON l.current_user_id = u.id 
WHERE l.store_id = 1 AND l.status = 'available' AND l.deleted = 0 
ORDER BY l.zone, l.cabinet_number LIMIT 20\G

-- 2. 操作记录查询计划
EXPLAIN SELECT o.*, l.cabinet_number FROM litemall_locker_operation o
INNER JOIN litemall_locker l ON o.locker_id = l.id
WHERE o.user_id = 1 AND o.type = 'store' AND o.status = 'active' AND o.deleted = 0
ORDER BY o.add_time DESC LIMIT 20\G

-- 3. 凭证查询计划
EXPLAIN SELECT * FROM litemall_voucher 
WHERE user_id = 1 AND status = 'active' AND expired_at > NOW()
ORDER BY created_at DESC LIMIT 10\G
EOF
}

# 生成测试数据（可选）
generate_test_data() {
    echo -e "\n${YELLOW}是否生成测试数据？这将创建大量记录用于性能测试 (y/n): ${NC}"
    read -r confirm
    
    if [ "$confirm" != "y" ]; then
        return
    fi
    
    echo -e "${YELLOW}生成测试数据...${NC}"
    
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
-- 生成测试用户
INSERT INTO litemall_user (username, password, mobile, nickname, avatar, gender, birthday, last_login_time, last_login_ip, user_level, status, add_time, update_time, deleted, real_name, identity_verified, phone_verified, store_id)
SELECT 
    CONCAT('testuser', seq),
    '\$2a\$10\$test',
    CONCAT('139', LPAD(seq, 8, '0')),
    CONCAT('测试用户', seq),
    '',
    0,
    '1990-01-01',
    NOW(),
    '127.0.0.1',
    0,
    0,
    NOW(),
    NOW(),
    0,
    CONCAT('测试', seq),
    1,
    1,
    1
FROM (
    SELECT @row := @row + 1 as seq FROM 
    (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t1,
    (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t2,
    (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t3,
    (SELECT @row := 1000) t4
) AS sequence
WHERE @row < 2000
ON DUPLICATE KEY UPDATE update_time = NOW();

-- 生成测试操作记录
INSERT INTO litemall_locker_operation (user_id, type, locker_id, store_id, voucher_code, status, add_time, update_time, deleted)
SELECT 
    1 + FLOOR(RAND() * 100),
    IF(RAND() > 0.5, 'store', 'retrieve'),
    1 + FLOOR(RAND() * 20),
    1,
    CONCAT(DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(seq, 4, '0'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0')),
    'completed',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
    NOW(),
    0
FROM (
    SELECT @row2 := @row2 + 1 as seq FROM 
    (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t1,
    (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t2,
    (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t3,
    (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t4,
    (SELECT @row2 := 0) t5
) AS sequence
WHERE @row2 < 10000;

COMMIT;
EOF
    
    echo -e "${GREEN}✓ 测试数据生成完成${NC}"
}

# 主函数
main() {
    # 检查依赖
    for cmd in mysql curl jq bc; do
        if ! command -v $cmd &> /dev/null; then
            echo -e "${RED}错误: 需要安装 $cmd${NC}"
            exit 1
        fi
    done
    
    # 检查数据库连接
    if ! check_mysql; then
        exit 1
    fi
    
    # 选择测试项目
    echo -e "\n${YELLOW}选择测试项目:${NC}"
    echo "1. 数据库查询性能测试"
    echo "2. API 接口性能测试"
    echo "3. 查询计划分析"
    echo "4. 生成测试数据"
    echo "5. 执行全部测试"
    echo -n "请选择 (1-5): "
    read -r choice
    
    case $choice in
        1) test_queries ;;
        2) test_apis ;;
        3) analyze_query_plans ;;
        4) generate_test_data ;;
        5) 
            test_queries
            test_apis
            analyze_query_plans
            ;;
        *) echo -e "${RED}无效选择${NC}" ;;
    esac
    
    echo -e "\n${GREEN}测试完成！${NC}"
}

# 执行主函数
main "$@"