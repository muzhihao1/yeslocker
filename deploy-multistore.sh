#!/bin/bash

# 部署多店铺功能脚本
# Deploy Multi-Store Feature Script

echo "=== 耶氏体育储物柜管理系统 - 多店铺功能部署 ==="
echo "=== Yeshi Sports Locker System - Multi-Store Feature Deployment ==="
echo ""

# 1. 执行数据库迁移
echo "1. 执行数据库迁移脚本..."
echo "   Executing database migration scripts..."
echo ""
echo "请执行以下命令："
echo "Please execute the following commands:"
echo ""
echo "mysql -u root -p123456 litemall < sql/store-schema.sql"
echo "mysql -u root -p123456 litemall < sql/add-store-id-to-locker.sql"
echo ""

# 2. 编译项目
echo "2. 编译项目..."
echo "   Compiling project..."
echo ""
echo "cd litemall-all"
echo "mvn clean package -DskipTests"
echo ""

# 3. 启动服务
echo "3. 启动服务..."
echo "   Starting services..."
echo ""
echo "java -jar target/litemall-all-*-exec.jar"
echo ""

# 4. 功能测试清单
echo "4. 功能测试清单："
echo "   Feature Testing Checklist:"
echo ""
echo "   管理后台测试 (Admin Panel Testing):"
echo "   - [ ] 访问 http://localhost:8080/admin"
echo "   - [ ] 登录管理员账号"
echo "   - [ ] 测试门店管理 (储物柜管理 -> 门店管理)"
echo "     - [ ] 创建新门店"
echo "     - [ ] 编辑门店信息"
echo "     - [ ] 查看门店列表"
echo "   - [ ] 测试储物柜列表"
echo "     - [ ] 查看门店筛选下拉框"
echo "     - [ ] 测试按门店筛选储物柜"
echo "   - [ ] 测试操作记录 (储物柜管理 -> 操作记录)"
echo "     - [ ] 查看操作记录列表"
echo "     - [ ] 测试筛选功能"
echo "     - [ ] 测试导出功能"
echo "     - [ ] 查看统计信息"
echo ""

# 5. API测试
echo "5. API测试端点："
echo "   API Testing Endpoints:"
echo ""
echo "   门店管理 APIs:"
echo "   - GET  /admin/store/list"
echo "   - POST /admin/store/create"
echo "   - POST /admin/store/update"
echo "   - POST /admin/store/delete"
echo "   - GET  /admin/store/all"
echo ""
echo "   操作记录 APIs:"
echo "   - GET  /admin/locker/operation/list"
echo "   - GET  /admin/locker/operation/detail"
echo "   - GET  /admin/locker/operation/export"
echo "   - GET  /admin/locker/operation/stats"
echo ""

# 6. 注意事项
echo "6. 注意事项："
echo "   Important Notes:"
echo ""
echo "   - 请在请求头中包含 X-Store-Id 以启用门店过滤"
echo "   - Include X-Store-Id header in requests to enable store filtering"
echo "   - 默认门店ID为1 (Default store ID is 1)"
echo "   - 现有数据会自动关联到默认门店"
echo "   - Existing data will be automatically associated with default store"
echo ""

echo "=== 部署完成 / Deployment Complete ==="