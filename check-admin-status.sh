#!/bin/bash

echo "=== 检查管理后台完成状态 ==="

echo -e "\n1. 检查前端构建状态:"
if [ -d "litemall-admin/dist" ]; then
    echo "✓ 前端已构建"
    echo "  构建文件数量: $(find litemall-admin/dist -type f | wc -l)"
else
    echo "✗ 前端未构建"
fi

echo -e "\n2. 检查核心页面文件:"
pages=(
    "litemall-admin/src/views/locker/list.vue"
    "litemall-admin/src/views/locker/operation.vue"
    "litemall-admin/src/views/storage/store.vue"
    "litemall-admin/src/views/dashboard/index.vue"
    "litemall-admin/src/views/user/user.vue"
)

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "✓ $page 存在"
    else
        echo "✗ $page 缺失"
    fi
done

echo -e "\n3. 检查API接口文件:"
apis=(
    "litemall-admin/src/api/locker.js"
    "litemall-admin/src/api/storage.js"
    "litemall-admin/src/api/user.js"
    "litemall-admin/src/api/dashboard.js"
)

for api in "${apis[@]}"; do
    if [ -f "$api" ]; then
        echo "✓ $api 存在"
        echo "  方法数量: $(grep -c "export function" "$api" 2>/dev/null || echo 0)"
    else
        echo "✗ $api 缺失"
    fi
done

echo -e "\n4. 后端API端点检查:"
echo "检查后端控制器..."
find litemall-admin-api/src/main/java -name "*Controller.java" -type f | while read file; do
    echo "  $(basename $file): $(grep -c "@.*Mapping" "$file" 2>/dev/null || echo 0) 个端点"
done