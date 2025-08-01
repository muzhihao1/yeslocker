#!/bin/bash

# Java环境配置脚本（Apple Silicon Mac）

echo "🔧 配置Java环境变量..."

# 检测shell类型
SHELL_RC=""
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_RC="$HOME/.zshrc"
elif [[ "$SHELL" == *"bash"* ]]; then
    SHELL_RC="$HOME/.bashrc"
fi

# Java 11路径
JAVA_HOME="/opt/homebrew/opt/openjdk@11"

# 添加到环境变量
echo "" >> $SHELL_RC
echo "# Java环境配置" >> $SHELL_RC
echo "export JAVA_HOME=$JAVA_HOME" >> $SHELL_RC
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> $SHELL_RC

# Maven路径（如果存在）
if [ -d "/opt/homebrew/opt/maven" ]; then
    echo "export MAVEN_HOME=/opt/homebrew/opt/maven" >> $SHELL_RC
    echo 'export PATH="$MAVEN_HOME/bin:$PATH"' >> $SHELL_RC
fi

echo "✅ 环境变量已添加到 $SHELL_RC"
echo ""
echo "请执行以下命令使配置生效："
echo "source $SHELL_RC"
echo ""
echo "或者手动添加以下内容到 $SHELL_RC："
echo "-----------------------------------"
echo "export JAVA_HOME=$JAVA_HOME"
echo 'export PATH="$JAVA_HOME/bin:$PATH"'
if [ -d "/opt/homebrew/opt/maven" ]; then
    echo "export MAVEN_HOME=/opt/homebrew/opt/maven"
    echo 'export PATH="$MAVEN_HOME/bin:$PATH"'
fi
echo "-----------------------------------"

# 临时设置当前会话
export JAVA_HOME=$JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"

# 验证安装
echo ""
echo "当前Java版本："
$JAVA_HOME/bin/java -version