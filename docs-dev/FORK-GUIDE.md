# Fork Litemall 项目指南

## 步骤1：在GitHub上Fork项目

1. **访问Litemall项目主页**
   ```
   https://github.com/linlinjava/litemall
   ```

2. **点击Fork按钮**
   - 在页面右上角找到"Fork"按钮
   - 点击后会跳转到您的GitHub账号
   - 等待Fork完成（约10-30秒）

3. **验证Fork成功**
   - 检查URL变为：`https://github.com/[您的用户名]/litemall`
   - 看到"forked from linlinjava/litemall"标识

## 步骤2：克隆到本地并改名

```bash
# 1. 克隆您Fork的仓库（替换YOUR_USERNAME）
git clone https://github.com/YOUR_USERNAME/litemall.git yeshi-locker

# 2. 进入项目目录
cd yeshi-locker

# 3. 查看远程仓库配置
git remote -v
# 应该看到：
# origin  https://github.com/YOUR_USERNAME/litemall.git (fetch)
# origin  https://github.com/YOUR_USERNAME/litemall.git (push)

# 4. 添加上游仓库（用于后续同步更新）
git remote add upstream https://github.com/linlinjava/litemall.git

# 5. 验证远程仓库配置
git remote -v
# 现在应该看到origin和upstream两个远程仓库
```

## 步骤3：创建开发分支

```bash
# 1. 创建并切换到开发分支
git checkout -b yeshi-mvp

# 2. 推送分支到您的仓库
git push -u origin yeshi-mvp
```

## 步骤4：整合Context Engineering文档

```bash
# 1. 将context-engineering文档复制到项目中
cp -r /Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/context-engineering ./docs/

# 2. 创建项目说明
cat > README-YESHI.md << 'EOF'
# 耶氏体育球杆存取管理系统

基于Litemall改造的球杆存取管理微信小程序。

## 项目文档

- [Context Engineering文档](./docs/context-engineering/CONTEXT.md)
- [快速开始](./docs/context-engineering/implementation/quick-start.md)
- [原始Litemall文档](./README.md)

## 改造说明

本项目在Litemall基础上进行以下改造：

1. **业务改造**
   - 商品管理 → 球杆存取管理
   - 订单系统 → 凭证系统
   - 商品展示 → 二手球杆展示

2. **保留功能**
   - 用户系统
   - 广告管理
   - 后台管理
   - 统计分析

3. **新增功能**
   - 身份验证
   - 凭证生成
   - 定期提醒
   - 操作记录

## 开发进度

- [x] Context Engineering文档
- [ ] 数据库改造
- [ ] API开发
- [ ] 小程序改造
- [ ] 测试部署
EOF

# 3. 添加并提交
git add .
git commit -m "feat: 初始化耶氏体育项目，添加Context Engineering文档体系"
git push
```

## 步骤5：项目初始化

```bash
# 1. 安装后端依赖（如果使用Java）
cd litemall-all
mvn clean install

# 2. 或使用Node.js版本
# 创建新的Node.js后端（如果不想用Java）
mkdir yeshi-backend
cd yeshi-backend
npm init -y
npm install express mysql2 redis jsonwebtoken multer

# 3. 安装管理后台依赖
cd ../litemall-admin
npm install

# 4. 准备小程序开发
# 使用微信开发者工具打开 litemall-wx 目录
```

## 步骤6：数据库初始化

```bash
# 1. 创建数据库
mysql -u root -p

CREATE DATABASE yeshi_locker DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. 导入基础表
cd yeshi-locker
mysql -u root -p yeshi_locker < litemall-db/sql/litemall_schema.sql
mysql -u root -p yeshi_locker < litemall-db/sql/litemall_table.sql

# 3. 导入扩展表（创建yeshi-extensions.sql）
mysql -u root -p yeshi_locker < yeshi-extensions.sql
```

## 步骤7：配置更新

1. **更新项目名称**
   - 修改pom.xml中的artifactId
   - 更新package.json中的name
   - 修改小程序app.json中的名称

2. **配置文件**
   - 复制application-dev.yml.example为application-dev.yml
   - 更新数据库连接信息
   - 配置微信小程序AppID和Secret
   - 配置七牛云存储信息

## 验证清单

- [ ] Fork成功，可以看到自己的仓库
- [ ] 本地克隆成功，目录名为yeshi-locker
- [ ] Context Engineering文档已整合
- [ ] 可以成功构建后端项目
- [ ] 数据库创建成功
- [ ] 配置文件已更新

## 常见问题

### Q: Fork后如何同步上游更新？
```bash
# 获取上游更新
git fetch upstream
# 合并到本地
git merge upstream/master
# 推送到自己的仓库
git push origin
```

### Q: 是否需要修改包名？
初期不需要，保持原有结构便于后续合并上游更新。等项目稳定后再考虑重构。

### Q: 如何处理冲突？
优先保留自己的业务代码，通用功能尽量使用上游版本。

## 下一步

1. 开始按照[快速开始指南](./docs/context-engineering/implementation/quick-start.md)进行开发
2. 实现核心的存取杆功能
3. 改造小程序界面
4. 部署测试

---

有问题请参考Context Engineering文档或在Issue中提问。