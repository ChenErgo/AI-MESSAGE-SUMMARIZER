#!/bin/bash

# 部署 summarize 云函数脚本

echo "开始部署 summarize 云函数..."

# 进入云函数目录
cd "$(dirname "$0")/cloudfunctions/summarize"

# 安装依赖
echo "安装依赖..."
npm install

# 返回项目根目录
cd "$(dirname "$0")"

# 使用微信开发者工具的命令行工具部署云函数
echo "部署云函数..."
# 注意：这里需要使用微信开发者工具的命令行工具
# 如果没有安装，需要手动在微信开发者工具中右键云函数目录选择"上传并部署：云端安装依赖"

echo "部署完成！"
echo "请在微信开发者工具中："
echo "1. 打开项目"
echo "2. 在 cloudfunctions/summarize 目录上右键"
echo "3. 选择 '上传并部署：云端安装依赖'"
echo "4. 等待部署完成"