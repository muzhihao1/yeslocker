#!/bin/bash

echo "=== 修复并启动后端服务 ==="

# 进入项目根目录
cd /Users/liasiloam/Vibecoding/杆柜管理/yeslocker

# 清理旧的编译文件
echo "清理旧的编译文件..."
mvn clean

# 重新编译整个项目
echo "重新编译项目..."
mvn install -DskipTests

# 启动后端服务
echo "启动后端服务..."
cd litemall-all
java -Dfile.encoding=UTF-8 -jar target/litemall-all-*-exec.jar