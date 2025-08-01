#!/bin/bash

# 临时切换到Java 11环境的脚本

echo "🔄 切换到Java 11环境..."

# 设置Java 11环境变量
export JAVA_HOME=/opt/homebrew/opt/openjdk@11/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

# 验证版本
echo "当前Java版本："
java -version
echo ""
echo "当前Maven版本："
mvn -v
echo ""
echo "✅ 已切换到Java 11环境"
echo ""
echo "提示：这只影响当前终端会话。如需永久修改，请编辑 ~/.zshrc 文件"