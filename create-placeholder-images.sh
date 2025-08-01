#!/bin/bash

# 创建占位图片脚本
# 使用 macOS 的 sips 命令创建纯色占位图片

echo "🎨 创建占位图片..."

# 进入静态资源目录
cd yeslocker-uniapp/src/static

# 创建目录
mkdir -p tabbar

# 创建纯色占位图片的函数
create_placeholder() {
    local filename=$1
    local size=$2
    local color=$3
    
    # 使用 ImageMagick (如果已安装) 或 sips
    if command -v convert &> /dev/null; then
        convert -size $size xc:$color "$filename"
    elif command -v sips &> /dev/null; then
        # macOS 方法：创建一个临时的纯色图片
        # 先创建一个1x1的图片，然后调整大小
        echo "Creating $filename..."
        # 创建一个简单的PNG数据
        printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x01UU\x86\x18\x00\x00\x00\x00IEND\xaeB`\x82' > temp.png
        sips -z ${size#*x} ${size%x*} temp.png --out "$filename" 2>/dev/null
        rm -f temp.png
    else
        # 如果都没有，创建一个空文件作为占位
        touch "$filename"
    fi
}

# 创建空状态图片 (200x200, 灰色)
create_placeholder "empty-locker.png" "200x200" "#E8E8E8"
create_placeholder "empty-history.png" "200x200" "#E8E8E8"

# 创建 TabBar 图标 (81x81)
create_placeholder "tabbar/home.png" "81x81" "#999999"
create_placeholder "tabbar/home-active.png" "81x81" "#1890ff"
create_placeholder "tabbar/storage.png" "81x81" "#999999"
create_placeholder "tabbar/storage-active.png" "81x81" "#1890ff"
create_placeholder "tabbar/shop.png" "81x81" "#999999"
create_placeholder "tabbar/shop-active.png" "81x81" "#1890ff"
create_placeholder "tabbar/user.png" "81x81" "#999999"
create_placeholder "tabbar/user-active.png" "81x81" "#1890ff"

# 创建功能图标
create_placeholder "icon-scan.png" "100x100" "#666666"
create_placeholder "icon-voucher.png" "100x100" "#666666"
create_placeholder "icon-locker.png" "100x100" "#666666"
create_placeholder "icon-vip.png" "100x100" "#FFD700"

# 创建广告占位图
create_placeholder "ad-banner-1.jpg" "750x300" "#FFE4E1"
create_placeholder "ad-banner-2.jpg" "750x300" "#E0FFFF"
create_placeholder "ad-banner-3.jpg" "750x300" "#F0E68C"
create_placeholder "ad-inline.jpg" "690x150" "#F5F5F5"

# 创建其他图片
create_placeholder "default-avatar.png" "120x120" "#CCCCCC"
create_placeholder "locker-available.png" "100x100" "#90EE90"
create_placeholder "locker-occupied.png" "100x100" "#FF6B6B"
create_placeholder "success.png" "200x200" "#52C41A"

echo "✅ 占位图片创建完成！"
echo ""
echo "📝 注意事项："
echo "1. 这些是临时占位图片，请尽快替换为正式设计稿"
echo "2. 部分图片可能只是空文件，需要手动创建"
echo "3. 建议使用专业设计工具创建正式图标"

# 复制到编译输出目录
echo ""
echo "📋 复制到编译输出目录..."
cp -r * ../../dist/dev/mp-weixin/static/ 2>/dev/null || echo "请重新编译项目以更新静态资源"

echo ""
echo "✨ 完成！请重新编译项目：npm run dev:mp-weixin"